import { Injectable, NotFoundException } from "@nestjs/common"
import jp from "jsonpath"

import { Listing } from "./entities/listing.entity"
import {
  ListingDto,
  ListingCreateDto,
  ListingUpdateDto,
  PaginatedListingsDto,
  ListingFilterParams,
  filterTypeToFieldMap,
  ListingsQueryParams,
} from "./dto/listing.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { SelectQueryBuilder, Repository } from "typeorm"
import { plainToClass } from "class-transformer"
import { PropertyCreateDto, PropertyUpdateDto } from "../property/dto/property.dto"
import { arrayIndex } from "../libs/arrayLib"
import { mapTo } from "../shared/mapTo"
import { addFilters } from "../shared/filter"

@Injectable()
export class ListingsService {
  constructor(@InjectRepository(Listing) private readonly listingRepository: Repository<Listing>) {}

  private getFullyJoinedQueryBuilder() {
    return this.listingRepository
      .createQueryBuilder("listings")
      .leftJoinAndSelect("listings.image", "image")
      .leftJoinAndSelect("listings.events", "listingEvents")
      .leftJoinAndSelect("listingEvents.file", "listingEventFile")
      .leftJoinAndSelect("listings.result", "result")
      .leftJoinAndSelect("listings.applicationAddress", "applicationAddress")
      .leftJoinAndSelect("listings.leasingAgentAddress", "leasingAgentAddress")
      .leftJoinAndSelect("listings.applicationPickUpAddress", "applicationPickUpAddress")
      .leftJoinAndSelect("listings.applicationMailingAddress", "applicationMailingAddress")
      .leftJoinAndSelect("listings.applicationDropOffAddress", "applicationDropOffAddress")
      .leftJoinAndSelect("listings.leasingAgents", "leasingAgents")
      .leftJoinAndSelect("listings.preferences", "preferences")
      .leftJoinAndSelect("listings.property", "property")
      .leftJoinAndSelect("property.buildingAddress", "buildingAddress")
      .leftJoinAndSelect("property.units", "units")
      .leftJoinAndSelect("units.unitType", "unitTypeRef")
      .leftJoinAndSelect("units.unitRentType", "unitRentType")
      .leftJoinAndSelect("units.priorityType", "priorityType")
      .leftJoinAndSelect("units.amiChart", "amiChart")
      .leftJoinAndSelect("listings.jurisdiction", "jurisdiction")
      .leftJoinAndSelect("listings.reservedCommunityType", "reservedCommunityType")
  }

  public async list(origin: string, params: ListingsQueryParams): Promise<PaginatedListingsDto> {
    const innerFilteredQuery = this.listingRepository
      .createQueryBuilder("listings")
      .select("listings.id", "listings_id")
      // .distinctOn(["listings.id"])
      .leftJoin("listings.property", "property")
      .leftJoin("property.units", "units")
      // .andWhere("units.maxOccupancy = :maxOccupancy")
      .groupBy("listings.id")
      .orderBy({ "listings.id": "DESC" })
      // .offset(3)
      // .limit(2)
    // const innerCount = await innerFilteredQuery.getCount()
    // console.log("avaleske: inner count is " + innerCount.toString())

    const qb = this.getFullyJoinedQueryBuilder()
    const whereParameters: { [key: string]: string } = {}
    if (params.filter) {
      addFilters<ListingFilterParams, typeof filterTypeToFieldMap>(
        params.filter,
        filterTypeToFieldMap,
        innerFilteredQuery,
        whereParameters
      )
    }

    qb.orderBy({
      "listings.id": "DESC",
      "units.max_occupancy": "ASC",
      "preferences.ordinal": "ASC",
    })

    const paginationInfo = {
      currentPage: params.page,
      itemCount: undefined as number,
      itemsPerPage: params.limit,
      totalItems: undefined as number,
      totalPages: undefined as number,
    }
    let listings: Listing[]

    if (paginationInfo.currentPage > 0 && paginationInfo.itemsPerPage > 0) {
      // Calculate the number of listings to skip (because they belong to lower page numbers)
      const offset = (paginationInfo.currentPage - 1) * paginationInfo.itemsPerPage
      innerFilteredQuery.offset(offset).limit(paginationInfo.itemsPerPage)
      qb.andWhere("listings.id IN (" + innerFilteredQuery.getQuery() + ")").setParameters(
        whereParameters
      )

      listings = await qb.getMany()

      paginationInfo.itemCount = listings.length

      // Get the total listings count, with filters applied. getCount() ignores any offsets and limits
      paginationInfo.totalItems = await innerFilteredQuery.getCount()
      paginationInfo.totalPages = Math.ceil(paginationInfo.totalItems / paginationInfo.itemsPerPage)
    } else {
      // If currentPage or itemsPerPage aren't specified (or are invalid), issue the SQL query to
      // get all listings (no pagination).
      qb.andWhere("listings.id IN (" + innerFilteredQuery.getQuery() + ")").setParameters(
        whereParameters
      )
      listings = await qb.getMany()

      paginationInfo.currentPage = 1
      paginationInfo.itemCount = listings.length
      paginationInfo.totalPages = 1
      paginationInfo.itemsPerPage = listings.length
      paginationInfo.totalItems = listings.length
    }

    // Sort units and preferences.
    // This step was removed from the SQL query because it interferes with pagination
    // (See https://github.com/CityOfDetroit/affordable-housing-app/issues/88#issuecomment-865329223)
    // listings.forEach((listing) => {
    //   listing.property.units.sort((a, b) => a.maxOccupancy - b.maxOccupancy)
    //   listing.preferences.sort((a, b) => a.ordinal - b.ordinal)
    // })

    /**
     * Get the application counts and map them to listings
     */
    if (origin === process.env.PARTNERS_BASE_URL) {
      const counts = await this.listingRepository
        .createQueryBuilder("listing")
        .select("listing.id")
        .loadRelationCountAndMap("listing.applicationCount", "listing.applications", "applications")
        .getMany()

      const countIndex = arrayIndex<Listing>(counts, "id")

      listings.forEach((listing: Listing) => {
        listing.applicationCount = countIndex[listing.id].applicationCount || 0
      })
    }

    // TODO(https://github.com/CityOfDetroit/bloom/issues/135): decide whether to remove jsonpath
    if (params.jsonpath) {
      listings = jp.query(listings, params.jsonpath)
    }

    const paginatedListings = {
      items: mapTo<ListingDto, Listing>(ListingDto, listings),
      meta: paginationInfo,
    }

    return paginatedListings
  }

  async create(listingDto: ListingCreateDto) {
    const listing = this.listingRepository.create({
      ...listingDto,
      property: plainToClass(PropertyCreateDto, listingDto),
    })
    return await listing.save()
  }

  async update(listingDto: ListingUpdateDto) {
    const qb = this.getFullyJoinedQueryBuilder()
    qb.where("listings.id = :id", { id: listingDto.id })
    const listing = await qb.getOne()

    if (!listing) {
      throw new NotFoundException()
    }
    listingDto.units.forEach((unit) => {
      if (unit.id.length === 0 || unit.id === "undefined") {
        delete unit.id
      }
    })
    Object.assign(listing, {
      ...plainToClass(Listing, listingDto, { excludeExtraneousValues: true }),
      property: plainToClass(
        PropertyUpdateDto,
        {
          // NOTE: Create a property out of fields encapsulated in listingDto
          ...listingDto,
          // NOTE: Since we use the entire listingDto to create a property object the listing ID
          //  would overwrite propertyId fetched from DB
          id: listing.property.id,
        },
        { excludeExtraneousValues: true }
      ),
    })

    return await this.listingRepository.save(listing)
  }

  async delete(listingId: string) {
    const listing = await this.listingRepository.findOneOrFail({
      where: { id: listingId },
    })
    return await this.listingRepository.remove(listing)
  }

  async findOne(listingId: string) {
    const result = await this.getFullyJoinedQueryBuilder()
      .where("listings.id = :id", { id: listingId })
      .orderBy({
        "preferences.ordinal": "ASC",
      })
      .getOne()
    if (!result) {
      throw new NotFoundException()
    }
    return result
  }
}

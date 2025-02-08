import { useContext, useEffect } from "react"
import axios from "axios"
import qs from "qs"
import { useRouter } from "next/router"
import {
  EnumListingFilterParamsComparison,
  Jurisdiction,
  ListingFilterParams,
  ListingOrderByKeys,
  ListingsStatusEnum,
  OrderByEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ParsedUrlQuery } from "querystring"
import { AppSubmissionContext } from "./applications/AppSubmissionContext"
import { useRequireLoggedInUser, isInternalLink } from "@bloom-housing/shared-helpers"

export const useRedirectToPrevPage = (defaultPath = "/") => {
  const router = useRouter()

  return (queryParams: ParsedUrlQuery = {}) => {
    const redirectUrl =
      typeof router.query.redirectUrl === "string" && isInternalLink(router.query.redirectUrl)
        ? router.query.redirectUrl
        : defaultPath
    const redirectParams = { ...queryParams }
    if (router.query.listingId) redirectParams.listingId = router.query.listingId

    return router.push({ pathname: redirectUrl, query: redirectParams })
  }
}

export const useFormConductor = (stepName: string) => {
  useRequireLoggedInUser("/", !process.env.showMandatedAccounts)
  const context = useContext(AppSubmissionContext)
  const conductor = context.conductor

  conductor.stepTo(stepName)

  useEffect(() => {
    conductor.skipCurrentStepIfNeeded()
  }, [conductor])
  return context
}

export async function fetchBaseListingData(
  {
    additionalFilters,
    orderBy,
    orderDir,
    limit,
  }: {
    additionalFilters?: ListingFilterParams[]
    orderBy?: ListingOrderByKeys[]
    orderDir?: OrderByEnum[]
    limit?: string
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any
) {
  let listings = []
  try {
    const { id: jurisdictionId } = await fetchJurisdictionByName(req)

    if (!jurisdictionId) {
      return listings
    }
    let filter: ListingFilterParams[] = [
      {
        $comparison: EnumListingFilterParamsComparison["="],
        jurisdiction: jurisdictionId,
      },
    ]

    if (additionalFilters) {
      filter = filter.concat(additionalFilters)
    }
    const params: {
      view: string
      limit: string
      filter: ListingFilterParams[]
      orderBy?: ListingOrderByKeys[]
      orderDir?: OrderByEnum[]
    } = {
      view: "base",
      limit: limit || "all",
      filter,
    }
    if (orderBy) {
      params.orderBy = orderBy
    }
    if (orderDir) {
      params.orderDir = orderDir
    }
    const response = await axios.get(process.env.listingServiceUrl, {
      params,
      paramsSerializer: (params) => {
        return qs.stringify(params)
      },
      headers: {
        passkey: process.env.API_PASS_KEY,
        "x-forwarded-for": req.headers["x-forwarded-for"] ?? req.socket.remoteAddress,
      },
    })

    listings = response.data?.items
  } catch (e) {
    console.log("fetchBaseListingData error: ", e)
  }

  return listings
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchOpenListings(req: any) {
  return await fetchBaseListingData(
    {
      additionalFilters: [
        {
          $comparison: EnumListingFilterParamsComparison["="],
          status: ListingsStatusEnum.active,
        },
      ],
      orderBy: [ListingOrderByKeys.mostRecentlyPublished],
      orderDir: [OrderByEnum.desc],
    },
    req
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchClosedListings(req: any) {
  return await fetchBaseListingData(
    {
      additionalFilters: [
        {
          $comparison: EnumListingFilterParamsComparison["="],
          status: ListingsStatusEnum.closed,
        },
      ],
      orderBy: [ListingOrderByKeys.mostRecentlyClosed],
      orderDir: [OrderByEnum.desc],
      limit: process.env.maxClosedListings,
    },
    req
  )
}

let jurisdiction: Jurisdiction | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchJurisdictionByName(req?: any) {
  try {
    if (jurisdiction) {
      return jurisdiction
    }

    const jurisdictionName = process.env.jurisdictionName

    const headers = {
      passkey: process.env.API_PASS_KEY,
    }
    if (req) {
      headers["x-forwarded-for"] = req.headers["x-forwarded-for"] ?? req.socket.remoteAddress
    }
    const jurisdictionRes = await axios.get(
      `${process.env.backendApiBase}/jurisdictions/byName/${jurisdictionName}`,
      {
        headers,
      }
    )
    jurisdiction = jurisdictionRes?.data
  } catch (error) {
    console.log("error = ", error)
  }

  return jurisdiction
}

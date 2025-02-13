import { ApiPropertyOptional } from '@nestjs/swagger';
import { HomeTypeEnum, ListingsStatusEnum, RegionEnum } from '@prisma/client';
import { Expose } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsString,
  IsUUID,
} from 'class-validator';
import { BaseFilter } from '../shared/base-filter.dto';
import { ValidationsGroupsEnum } from '../../enums/shared/validation-groups-enum';
import { FilterAvailabilityEnum } from '../../enums/listings/filter-availability-enum';
import { ListingFilterKeys } from '../../enums/listings/filter-key-enum';

export class ListingFilterParams extends BaseFilter {
  @Expose()
  @ApiPropertyOptional({
    enum: FilterAvailabilityEnum,
    enumName: 'FilterAvailabilityEnum',
    example: 'waitlistOpen',
  })
  @IsEnum(FilterAvailabilityEnum, {
    groups: [ValidationsGroupsEnum.default],
  })
  [ListingFilterKeys.availability]?: FilterAvailabilityEnum;

  @Expose()
  @ApiPropertyOptional({
    example: 2,
  })
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.bathrooms]?: number;

  @Expose()
  @ApiPropertyOptional({
    example: 3,
  })
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.bedrooms]?: number;

  @Expose()
  @ApiPropertyOptional({
    type: String,
    example: 'San Jose',
  })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.city]?: string;

  @Expose()
  @ApiPropertyOptional({
    type: Array,
    example: ['Santa Clara'],
  })
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.counties]?: string[];

  @Expose()
  @ApiPropertyOptional({
    enum: HomeTypeEnum,
    enumName: 'HomeTypeEnum',
    isArray: true,
    example: ['apartment'],
    default: ['apartment'],
  })
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  @IsEnum(HomeTypeEnum, { groups: [ValidationsGroupsEnum.default], each: true })
  [ListingFilterKeys.homeTypes]?: HomeTypeEnum[];

  @Expose()
  @ApiPropertyOptional({
    type: Array,
    example: ['abcdef'],
  })
  @IsUUID(4, { groups: [ValidationsGroupsEnum.default], each: true })
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.ids]?: string[];

  @Expose()
  @ApiPropertyOptional({
    type: Boolean,
    example: false,
  })
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.isVerified]?: boolean;

  @Expose()
  @ApiPropertyOptional({
    example: 'bab6cb4f-7a5a-4ee5-b327-0c2508807780',
  })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.jurisdiction]?: string;

  @Expose()
  @ApiPropertyOptional({
    example: 'FAB1A3C6-965E-4054-9A48-A282E92E9426',
  })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.leasingAgent]?: string;

  @Expose()
  @ApiPropertyOptional({
    type: Array,
    example: ['elevator'],
  })
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.listingFeatures]?: string[];

  @Expose()
  @ApiPropertyOptional({
    type: Number,
    example: '1000',
  })
  @IsNumberString({}, { groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.monthlyRent]?: string;

  @Expose()
  @ApiPropertyOptional({
    example: 'Coliseum',
  })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.name]?: string;

  @Expose()
  @ApiPropertyOptional({
    example: 'Fox Creek',
  })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.neighborhood]?: string;

  @Expose()
  @ApiPropertyOptional({
    enum: RegionEnum,
    enumName: 'RegionEnum',
    isArray: true,
    example: ['Eastside'],
    default: ['Eastside'],
  })
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  @IsEnum(RegionEnum, { groups: [ValidationsGroupsEnum.default], each: true })
  [ListingFilterKeys.regions]?: RegionEnum[];

  @Expose()
  @ApiPropertyOptional({
    type: Array,
    example: ['Seniors'],
  })
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.reservedCommunityTypes]?: string[];

  @Expose()
  @ApiPropertyOptional({
    type: Boolean,
    example: false,
  })
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.section8Acceptance]?: boolean;

  @Expose()
  @ApiPropertyOptional({
    enum: ListingsStatusEnum,
    enumName: 'ListingsStatusEnum',
    example: 'active',
  })
  @IsEnum(ListingsStatusEnum, { groups: [ValidationsGroupsEnum.default] })
  [ListingFilterKeys.status]?: ListingsStatusEnum;

  @Expose()
  @ApiPropertyOptional({
    example: '48211',
  })
  [ListingFilterKeys.zipCode]?: string;
}

import { PaginationAllowsAllQueryParams } from '../shared/pagination.dto';
import { Expose, Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListingFilterParams } from './listings-filter-params.dto';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsString,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { ValidationsGroupsEnum } from '../../enums/shared/validation-groups-enum';
import { ListingOrderByKeys } from '../../enums/listings/order-by-enum';
import { ListingViews } from '../../enums/listings/view-enum';
import { OrderByEnum } from '../../enums/shared/order-by-enum';
import { OrderQueryParamValidator } from '../../utilities/order-by-validator';

export class ListingsQueryBody extends PaginationAllowsAllQueryParams {
  @Expose()
  @ApiPropertyOptional({
    type: ListingFilterParams,
    isArray: true,
    example: [
      { $comparison: '=', status: 'active' },
      { $comparison: '=', bedrooms: 1 },
    ],
  })
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  @ArrayMaxSize(16, { groups: [ValidationsGroupsEnum.default] })
  @Type(() => ListingFilterParams)
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  filter?: ListingFilterParams[];

  @Expose()
  @ApiPropertyOptional({
    enum: ListingViews,
    enumName: 'ListingViews',
    example: 'full',
  })
  @IsEnum(ListingViews, {
    groups: [ValidationsGroupsEnum.default],
  })
  view?: ListingViews;

  @Expose()
  @ApiPropertyOptional({
    enum: ListingOrderByKeys,
    enumName: 'ListingOrderByKeys',
    example: ['mostRecentlyUpdated'],
    default: ['mostRecentlyUpdated'],
  })
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  @ArrayMaxSize(16, { groups: [ValidationsGroupsEnum.default] })
  @Type(() => ListingFilterParams)
  @IsEnum(ListingOrderByKeys, {
    groups: [ValidationsGroupsEnum.default],
    each: true,
  })
  @Validate(OrderQueryParamValidator, {
    groups: [ValidationsGroupsEnum.default],
  })
  orderBy?: ListingOrderByKeys[];

  @Expose()
  @ApiPropertyOptional({
    enum: OrderByEnum,
    enumName: 'OrderByEnum',
    example: ['desc'],
    default: ['desc'],
  })
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  @ArrayMaxSize(16, { groups: [ValidationsGroupsEnum.default] })
  @Transform(({ value }) => {
    return value ? value.map((val) => val.toLowerCase()) : undefined;
  })
  @IsEnum(OrderByEnum, { groups: [ValidationsGroupsEnum.default], each: true })
  @Validate(OrderQueryParamValidator, {
    groups: [ValidationsGroupsEnum.default],
  })
  orderDir?: OrderByEnum[];

  @Expose()
  @ApiPropertyOptional({
    example: 'search',
  })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MinLength(3, {
    message: 'Search must be at least 3 characters',
    groups: [ValidationsGroupsEnum.default],
  })
  search?: string;
}

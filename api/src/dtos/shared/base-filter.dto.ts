import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ValidationsGroupsEnum } from '../../enums/shared/validation-groups-enum';

// Add other comparisons as needed (>, <, etc)
export enum Compare {
  '=' = '=',
  '<>' = '<>',
  'IN' = 'IN',
  '>=' = '>=',
  '<=' = '<=',
  'LIKE' = 'LIKE',
  'NA' = 'NA', // For filters that don't use the comparison param
}

export class BaseFilter {
  @Expose()
  @ApiProperty({
    enum: Object.keys(Compare),
    example: '=',
    default: Compare['='],
  })
  @IsEnum(Compare, { groups: [ValidationsGroupsEnum.default] })
  $comparison: Compare;
}

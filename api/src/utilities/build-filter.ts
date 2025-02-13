import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Compare } from '../dtos/shared/base-filter.dto';

type filter = {
  $comparison: Compare;
  $include_nulls: boolean;
  value: any;
  key: string;
  caseSensitive?: boolean;
};

/*
  This constructs the "where" part of a prisma query
  Because the where clause is specific to each model we are working with this has to be very generic.
  It only constructs the actual body of the where statement, how that clause is used must be managed by the service calling this helper function
*/
export function buildFilter(filter: filter): any {
  const toReturn = [];
  const comparison = filter['$comparison'];
  const includeNulls = filter['$include_nulls'];
  const filterValue = filter.value;
  // Mode should only be set if we want insensitive.
  // "default" is the default value and not all filters can have mode set such as "status"
  let mode = {};
  if (!filter.caseSensitive) {
    mode = { mode: Prisma.QueryMode.insensitive };
  }

  if (comparison === Compare.IN) {
    toReturn.push({
      in: String(filterValue)
        .split(',')
        .map((s) => {
          if (!filter.caseSensitive) {
            return s.trim().toLowerCase();
          }
          return s.trim();
        })
        .filter((s) => s.length !== 0),
      ...mode,
    });
  } else if (comparison === Compare['<>']) {
    toReturn.push({
      not: {
        equals: filterValue,
      },
      ...mode,
    });
  } else if (comparison === Compare['=']) {
    toReturn.push({
      equals: filterValue,
      ...mode,
    });
  } else if (comparison === Compare['>=']) {
    toReturn.push({
      gte: filterValue,
      ...mode,
    });
  } else if (comparison === Compare['<=']) {
    toReturn.push({
      lte: filterValue,
      ...mode,
    });
  } else if (comparison === Compare['LIKE']) {
    toReturn.push({
      contains: filterValue,
      ...mode,
    });
  } else if (Compare.NA) {
    throw new HttpException(
      `Filter "${filter.key}" expected to be handled by a custom filter handler, but one was not implemented.`,
      HttpStatus.NOT_IMPLEMENTED,
    );
  } else {
    throw new HttpException(
      'Comparison Not Implemented',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  if (includeNulls) {
    toReturn.push({
      equals: null,
    });
  }

  return toReturn;
}

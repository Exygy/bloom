import { buildFilter } from '../../../src/utilities/build-filter';
import { Compare } from '../../../src/dtos/shared/base-filter.dto';
describe('Testing constructFilter', () => {
  it('should correctly build IN filter when includes null is false', () => {
    expect(
      buildFilter({
        $comparison: Compare.IN,
        $include_nulls: false,
        value: 'Capital, lowercase,',
        key: 'a key',
      }),
    ).toEqual([
      {
        in: ['capital', 'lowercase'],
        mode: 'insensitive',
      },
    ]);
  });
  it('should correctly build IN filter when includes null is true', () => {
    expect(
      buildFilter({
        $comparison: Compare.IN,
        $include_nulls: true,
        value: 'Capital, lowercase,',
        key: 'a key',
      }),
    ).toEqual([
      {
        in: ['capital', 'lowercase'],
        mode: 'insensitive',
      },
      {
        equals: null,
      },
    ]);
  });

  it('should correctly build <> filter when includes null is false', () => {
    expect(
      buildFilter({
        $comparison: Compare['<>'],
        $include_nulls: false,
        value: 'example',
        key: 'a key',
      }),
    ).toEqual([
      {
        mode: 'insensitive',
        not: {
          equals: 'example',
        },
      },
    ]);
  });
  it('should correctly build <> filter when includes null is true', () => {
    expect(
      buildFilter({
        $comparison: Compare['<>'],
        $include_nulls: true,
        value: 'example',
        key: 'a key',
      }),
    ).toEqual([
      {
        mode: 'insensitive',
        not: {
          equals: 'example',
        },
      },
      {
        equals: null,
      },
    ]);
  });

  it('should correctly build = filter when includes null is false', () => {
    expect(
      buildFilter({
        $comparison: Compare['='],
        $include_nulls: false,
        value: 'example',
        key: 'a key',
      }),
    ).toEqual([
      {
        equals: 'example',
        mode: 'insensitive',
      },
    ]);
  });
  it('should correctly build = filter when includes null is true', () => {
    expect(
      buildFilter({
        $comparison: Compare['='],
        $include_nulls: true,
        value: 'example',
        key: 'a key',
      }),
    ).toEqual([
      {
        equals: 'example',
        mode: 'insensitive',
      },
      {
        equals: null,
      },
    ]);
  });

  it('should correctly build >= filter when includes null is false', () => {
    expect(
      buildFilter({
        $comparison: Compare['>='],
        $include_nulls: false,
        value: 'example',
        key: 'a key',
      }),
    ).toEqual([
      {
        gte: 'example',
        mode: 'insensitive',
      },
    ]);
  });
  it('should correctly build >= filter when includes null is true', () => {
    expect(
      buildFilter({
        $comparison: Compare['>='],
        $include_nulls: true,
        value: 'example',
        key: 'a key',
      }),
    ).toEqual([
      {
        gte: 'example',
        mode: 'insensitive',
      },
      {
        equals: null,
      },
    ]);
  });

  it('should correctly build <= filter when includes null is false', () => {
    expect(
      buildFilter({
        $comparison: Compare['<='],
        $include_nulls: false,
        value: 'example',
        key: 'a key',
      }),
    ).toEqual([
      {
        lte: 'example',
        mode: 'insensitive',
      },
    ]);
  });
  it('should correctly build <= filter when includes null is true', () => {
    expect(
      buildFilter({
        $comparison: Compare['<='],
        $include_nulls: true,
        value: 'example',
        key: 'a key',
      }),
    ).toEqual([
      {
        lte: 'example',
        mode: 'insensitive',
      },
      {
        equals: null,
      },
    ]);
  });

  it('should correctly build LIKE filter when includes null is false', () => {
    expect(
      buildFilter({
        $comparison: Compare.LIKE,
        $include_nulls: false,
        value: 'Capital',
        key: 'a key',
      }),
    ).toEqual([
      {
        contains: 'Capital',
        mode: 'insensitive',
      },
    ]);
  });
  it('should correctly build LIKE filter when includes null is true', () => {
    expect(
      buildFilter({
        $comparison: Compare.LIKE,
        $include_nulls: true,
        value: 'Capital',
        key: 'a key',
      }),
    ).toEqual([
      {
        contains: 'Capital',
        mode: 'insensitive',
      },
      {
        equals: null,
      },
    ]);
  });

  it('should error if NA filter', () => {
    expect(() =>
      buildFilter({
        $comparison: Compare.NA,
        $include_nulls: false,
        value: 'example',
        key: 'a key',
      }),
    ).toThrowError(
      'Filter "a key" expected to be handled by a custom filter handler, but one was not implemented.',
    );
  });

  it('should error if unsupport comparison passed in', () => {
    expect(() =>
      buildFilter({
        $comparison: 'aaa' as Compare.NA,
        $include_nulls: false,
        value: 'example',
        key: 'a key',
      }),
    ).toThrowError();
  });
});

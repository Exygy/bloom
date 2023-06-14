import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/services/prisma.service';
import { jurisdictionFactory } from '../../prisma/seed-helpers/jurisdiction-factory';
import { listingFactory } from '../../prisma/seed-helpers/listing-factory';
import { stringify } from 'qs';
import { ListingsQueryParams } from '../../src/dtos/listings/listings-query-params.dto';
import { Compare } from '../../src/dtos/shared/base-filter.dto';
import { ListingOrderByKeys } from '../../src/enums/listings/order-by-enum';
import { OrderByEnum } from '../../src/enums/shared/order-by-enum';
import { ListingViews } from '../../src/enums/listings/view-enum';

describe('Listing Controller Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
    await clearAllDb();
  });

  const clearAllDb = async () => {
    await prisma.applicationMethods.deleteMany();
    await prisma.listingEvents.deleteMany();
    await prisma.listingImages.deleteMany();
    await prisma.listingMultiselectQuestions.deleteMany();
    await prisma.units.deleteMany();
    await prisma.amiChart.deleteMany();
    await prisma.listings.deleteMany();
    await prisma.reservedCommunityTypes.deleteMany();
    await prisma.jurisdictions.deleteMany();
  };

  it('list test no params no data', async () => {
    const res = await request(app.getHttpServer()).get('/listings').expect(200);

    expect(res.body).toEqual({
      items: [],
      meta: {
        currentPage: 1,
        itemCount: 0,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0,
      },
    });
  });

  it('list test no params some data', async () => {
    const jurisdiction = await prisma.jurisdictions.create({
      data: jurisdictionFactory(100),
    });

    await prisma.listings.create({
      data: listingFactory(10, jurisdiction.id),
    });

    await prisma.listings.create({
      data: listingFactory(50, jurisdiction.id),
    });

    const res = await request(app.getHttpServer()).get('/listings').expect(200);

    expect(res.body.meta).toEqual({
      currentPage: 1,
      itemCount: 2,
      itemsPerPage: 10,
      totalItems: 2,
      totalPages: 1,
    });

    const items = res.body.items.sort((a, b) => (a.name < b.name ? -1 : 1));

    expect(res.body.items.length).toEqual(2);
    expect(items[0].name).toEqual('name: 10');
    expect(items[1].name).toEqual('name: 50');
  });

  it('list test params no data', async () => {
    const queryParams: ListingsQueryParams = {
      limit: 1,
      page: 1,
      view: ListingViews.base,
      filter: [
        {
          $comparison: Compare.IN,
          name: 'name: 10,name: 50',
        },
      ],
    };
    const query = stringify(queryParams as any);

    const res = await request(app.getHttpServer())
      .get(`/listings?${query}`)
      .expect(200);

    expect(res.body).toEqual({
      items: [],
      meta: {
        currentPage: 1,
        itemCount: 0,
        itemsPerPage: 1,
        totalItems: 0,
        totalPages: 0,
      },
    });
  });

  it('list test params some data', async () => {
    const jurisdiction = await prisma.jurisdictions.create({
      data: jurisdictionFactory(100),
    });
    await prisma.listings.create({
      data: listingFactory(10, jurisdiction.id),
    });
    await prisma.listings.create({
      data: listingFactory(50, jurisdiction.id),
    });

    let queryParams: ListingsQueryParams = {
      limit: 1,
      page: 1,
      view: ListingViews.base,
      filter: [
        {
          $comparison: Compare.IN,
          name: 'name: 10,name: 50',
        },
      ],
      orderBy: [ListingOrderByKeys.name],
      orderDir: [OrderByEnum.ASC],
    };
    let query = stringify(queryParams as any);

    let res = await request(app.getHttpServer())
      .get(`/listings?${query}`)
      .expect(200);

    expect(res.body.meta).toEqual({
      currentPage: 1,
      itemCount: 1,
      itemsPerPage: 1,
      totalItems: 2,
      totalPages: 2,
    });

    expect(res.body.items.length).toEqual(1);
    expect(res.body.items[0].name).toEqual('name: 10');

    queryParams = {
      limit: 1,
      page: 2,
      view: ListingViews.base,
      filter: [
        {
          $comparison: Compare.IN,
          name: 'name: 10,name: 50',
        },
      ],
      orderBy: [ListingOrderByKeys.name],
      orderDir: [OrderByEnum.ASC],
    };
    query = stringify(queryParams as any);

    res = await request(app.getHttpServer())
      .get(`/listings?${query}`)
      .expect(200);

    expect(res.body.meta).toEqual({
      currentPage: 2,
      itemCount: 1,
      itemsPerPage: 1,
      totalItems: 2,
      totalPages: 2,
    });
    expect(res.body.items.length).toEqual(1);
    expect(res.body.items[0].name).toEqual('name: 50');
  });
});

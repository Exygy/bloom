import { Prisma, PrismaClient, ReservedCommunityTypes } from '@prisma/client';
import { randomInt } from 'crypto';

const reservedCommunityTypeOptions = [
  'specialNeeds',
  'senior',
  'senior62',
  'developmentalDisability',
  'veteran',
];

export const reservedCommunityTypeFactory = (
  jurisdictionId: string,
  name: string,
): Prisma.ReservedCommunityTypesCreateWithoutListingsInput => {
  return {
    name: name,
    description: `reservedCommunityTypes of ${name}`,
    jurisdictions: {
      connect: {
        id: jurisdictionId,
      },
    },
  };
};

export const reservedCommunityTypeFactoryAll = async (
  jurisdictionId: string,
  prismaClient: PrismaClient,
) => {
  await prismaClient.reservedCommunityTypes.createMany({
    data: reservedCommunityTypeOptions.map((value) => ({
      name: value,
      jurisdictionId: jurisdictionId,
    })),
  });
};

export const reservedCommunityTypeFactoryGet = async (
  prismaClient: PrismaClient,
  jurisdictionId: string,
  name?: string,
): Promise<ReservedCommunityTypes> => {
  // if name is not given pick one randomly from the above list
  const chosenName =
    name ||
    reservedCommunityTypeOptions[
      randomInt(reservedCommunityTypeOptions.length)
    ];
  const reservedCommunityType =
    await prismaClient.reservedCommunityTypes.findFirst({
      where: {
        name: {
          equals: chosenName,
        },
        jurisdictionId: {
          equals: jurisdictionId,
        },
      },
    });

  if (!reservedCommunityType) {
    console.warn(
      `reserved community type ${chosenName} was not created, run reservedCommunityTypeFactoryAll first`,
    );
  }
  return reservedCommunityType;
};

export const reservedCommunityTypesFindOrCreate = async (
  jurisdictionId: string,
  prismaClient: PrismaClient,
): Promise<ReservedCommunityTypes> => {
  const reservedCommunityType = await reservedCommunityTypeFactoryGet(
    prismaClient,
    jurisdictionId,
  );
  if (reservedCommunityType) {
    return await reservedCommunityTypeFactoryGet(prismaClient, jurisdictionId);
  }

  await reservedCommunityTypeFactoryAll(jurisdictionId, prismaClient);
  return await reservedCommunityTypeFactoryGet(prismaClient, jurisdictionId);
};

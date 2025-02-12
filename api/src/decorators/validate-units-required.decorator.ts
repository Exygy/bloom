import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PrismaService } from '../services/prisma.service';
import { ListingPublishedUpdate } from 'src/dtos/listings/listing-published-update.dto';
import { FeatureFlagEnum } from 'src/enums/feature-flags/feature-flags-enum';

export function ValidateUnitsRequired(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateUnitsRequired',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      async: true,
      validator: {
        async validate(value: unknown[], args: ValidationArguments) {
          const jurisdictionId = (args.object as ListingPublishedUpdate)
            .jurisdictions?.id;
          if (!jurisdictionId) return true;

          const prisma = new PrismaService();
          const jurisdiction = await prisma.jurisdictions.findFirst({
            where: { id: jurisdictionId },
            include: { featureFlags: true },
          });

          const hasUnitGroupsEnabled = jurisdiction?.featureFlags?.some(
            (flag) =>
              flag.name === FeatureFlagEnum.enableUnitGroups && flag.active,
          );

          return hasUnitGroupsEnabled || (value && value.length > 0);
        },
        defaultMessage: () => 'At least one unit is required',
      },
    });
  };
}

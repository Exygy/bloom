import React, { useContext, useMemo } from "react"
import { t, MinimalTable } from "@bloom-housing/ui-components"
import { Button, FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { ListingContext } from "../../ListingContext"
import { UnitDrawer } from "../DetailsUnitDrawer"
import {
  FeatureFlagEnum,
  ReviewOrderTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import SectionWithGrid from "../../../shared/SectionWithGrid"

type DetailUnitsProps = {
  setUnitDrawer: (unit: UnitDrawer) => void
}

const DetailUnits = ({ setUnitDrawer }: DetailUnitsProps) => {
  const listing = useContext(ListingContext)
  const { doJurisdictionsHaveFeatureFlagOn } = useContext(AuthContext)

  const unitTableHeaders = {
    number: "listings.unit.number",
    unitType: "listings.unit.type",
    amiPercentage: "listings.unit.ami",
    monthlyRent: "listings.unit.rent",
    sqFeet: "listings.unit.sqft",
    unitAccessibilityPriorityTypes: "listings.unit.priorityType",
    action: "",
  }

  const unitTableData = useMemo(
    () =>
      listing?.units.map((unit) => ({
        number: { content: unit.number },
        unitType: { content: unit.unitTypes && t(`listings.unitTypes.${unit.unitTypes.name}`) },
        amiPercentage: { content: unit.amiPercentage },
        monthlyRent: { content: unit.monthlyRent },
        sqFeet: { content: unit.sqFeet },
        unitAccessibilityPriorityTypes: { content: unit.unitAccessibilityPriorityTypes?.name },
        action: {
          content: (
            <Button
              type="button"
              variant="text"
              size="sm"
              className="font-semibold"
              onClick={() => setUnitDrawer(unit)}
            >
              {t("t.view")}
            </Button>
          ),
        },
      })),
    [listing, setUnitDrawer]
  )

  const listingAvailabilityText = useMemo(() => {
    if (listing.reviewOrderType !== ReviewOrderTypeEnum.waitlist) {
      return t("listings.availableUnits")
    } else if (listing.reviewOrderType === ReviewOrderTypeEnum.waitlist) {
      return t("listings.waitlist.open")
    }
    return t("t.none")
  }, [listing])

  const enableHomeType = doJurisdictionsHaveFeatureFlagOn(
    FeatureFlagEnum.enableHomeType,
    listing.jurisdictions.id
  )

  const enableSection8Question = doJurisdictionsHaveFeatureFlagOn(
    FeatureFlagEnum.enableSection8Question,
    listing.jurisdictions.id
  )

  return (
    <SectionWithGrid heading={t("listings.units")} inset>
      {enableHomeType && (
        <Grid.Row>
          <FieldValue id="homeType" label={t("listings.homeType")}>
            {listing.homeType ? t(`homeType.${listing.homeType}`) : t("t.none")}
          </FieldValue>
        </Grid.Row>
      )}
      <Grid.Row>
        <FieldValue
          id="unitTypesOrIndividual"
          testId={"unit-types-or-individual"}
          label={t("listings.unitTypesOrIndividual")}
          children={
            listing.disableUnitsAccordion
              ? t("listings.unit.unitTypes")
              : t("listings.unit.individualUnits")
          }
        />
        <FieldValue
          id="listings.listingAvailabilityQuestion"
          testId={"listing-availability-question"}
          label={t("listings.listingAvailabilityQuestion")}
          children={listingAvailabilityText}
        />
      </Grid.Row>
      <Grid.Row>
        <Grid.Cell>
          {listing.units.length ? (
            <MinimalTable id="unitTable" headers={unitTableHeaders} data={unitTableData} />
          ) : (
            <>
              <hr className="spacer-header" />
              <span className="text-base font-semibold pt-4">{t("t.none")}</span>
            </>
          )}
        </Grid.Cell>
      </Grid.Row>
      {enableSection8Question && (
        <Grid.Row>
          <FieldValue
            id="listings.section8Title"
            testId="listing-section-8-acceptance"
            label={t("listings.section8Title")}
          >
            {listing.section8Acceptance ? t("t.yes") : t("t.no")}
          </FieldValue>
        </Grid.Row>
      )}
    </SectionWithGrid>
  )
}

export { DetailUnits as default, DetailUnits }

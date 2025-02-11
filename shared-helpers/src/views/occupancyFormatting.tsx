import * as React from "react"
import { StandardTableData, t } from "@bloom-housing/ui-components"
import { Listing, UnitTypeEnum } from "../types/backend-swagger"

export const getOccupancy = (minOcc?: number | null, maxOcc?: number | null) => {
  if (minOcc && maxOcc && minOcc !== maxOcc && minOcc < maxOcc) {
    return `${minOcc}-${maxOcc} ${t("t.people")}`
  }
  if (minOcc && maxOcc && minOcc === maxOcc) {
    return `${minOcc} ${minOcc === 1 ? t("t.person") : t("t.people")}`
  }
  if (!minOcc && maxOcc) {
    return t("t.noMoreThan", {
      amount: `${maxOcc} ${maxOcc === 1 ? t("t.person") : t("t.people")}`,
    })
  }
  if (minOcc && !maxOcc) {
    return t("t.atLeast", {
      amount: `${minOcc} ${minOcc === 1 ? t("t.person") : t("t.people")}`,
    })
  }
  return t("t.n/a")
}

export const occupancyTable = (listing: Listing): StandardTableData => {
  let occupancyData: StandardTableData = []
  if (listing.unitsSummarized && listing.unitsSummarized.byUnitType) {
    occupancyData = listing.unitsSummarized.byUnitType.map((unitSummary) => {
      const occupancy = getOccupancy(unitSummary.occupancyRange.min, unitSummary.occupancyRange.max)

      return {
        unitType: {
          content: <strong>{t("listings.unitTypes." + unitSummary.unitTypes.name)}</strong>,
        },
        occupancy: { content: occupancy },
      }
    })
  }

  return occupancyData
}

export const getOccupancyDescription = (listing: Listing) => {
  const unitsSummarized = listing.unitsSummarized
  if (
    unitsSummarized &&
    unitsSummarized.unitTypes &&
    unitsSummarized.unitTypes.map((unitType) => unitType.name).includes(UnitTypeEnum.SRO)
  ) {
    return unitsSummarized.unitTypes.length == 1
      ? t("listings.occupancyDescriptionAllSro")
      : t("listings.occupancyDescriptionSomeSro")
  } else {
    return t("listings.occupancyDescriptionNoSro")
  }
}

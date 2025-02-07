import React, { useContext, useMemo } from "react"
import { t, MinimalTable } from "@bloom-housing/ui-components"
import { FieldValue } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { listingSectionQuestions } from "@bloom-housing/shared-helpers"
import { MultiselectQuestionsApplicationSectionEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import SectionWithGrid from "../../../shared/SectionWithGrid"

const DetailPreferences = () => {
  const listing = useContext(ListingContext)

  const preferencesTableHeaders = {
    order: "t.order",
    name: "t.name",
    description: "t.descriptionTitle",
  }

  const preferenceTableData = useMemo(
    () =>
      listingSectionQuestions(listing, MultiselectQuestionsApplicationSectionEnum.preferences)?.map(
        (listingPreference, index) => ({
          order: { content: index + 1 },
          name: { content: listingPreference?.multiselectQuestions?.text },
          description: { content: listingPreference?.multiselectQuestions?.description },
        })
      ),
    [listing]
  )

  return (
    <SectionWithGrid heading={t("listings.sections.housingPreferencesTitle")} inset bypassGrid>
      <SectionWithGrid.HeadingRow>{t("listings.activePreferences")}</SectionWithGrid.HeadingRow>
      {preferenceTableData.length ? (
        <MinimalTable
          id="preferenceTable"
          className="spacer-section-above"
          headers={preferencesTableHeaders}
          data={preferenceTableData}
        />
      ) : (
        <FieldValue className="spacer-section-above">{t("t.none")}</FieldValue>
      )}
    </SectionWithGrid>
  )
}

export default DetailPreferences

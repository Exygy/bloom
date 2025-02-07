import React, { useContext, useMemo } from "react"
import { t, MinimalTable } from "@bloom-housing/ui-components"
import { FieldValue } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { listingSectionQuestions } from "@bloom-housing/shared-helpers"
import { MultiselectQuestionsApplicationSectionEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import SectionWithGrid from "../../../shared/SectionWithGrid"

const DetailPrograms = () => {
  const listing = useContext(ListingContext)

  const programsTableHeaders = {
    order: "t.order",
    name: "t.name",
    description: "t.descriptionTitle",
  }

  const programsTableData = useMemo(
    () =>
      listingSectionQuestions(listing, MultiselectQuestionsApplicationSectionEnum.programs)
        ?.sort((firstEl, secondEl) => firstEl.ordinal - secondEl.ordinal)
        .map((program, index) => ({
          order: { content: index + 1 },
          name: { content: program?.multiselectQuestions?.text },
          description: { content: program?.multiselectQuestions?.description },
        })),
    [listing]
  )

  return (
    <SectionWithGrid heading="Housing Programs" inset bypassGrid>
      <SectionWithGrid.HeadingRow>Active Programs</SectionWithGrid.HeadingRow>
      {programsTableData.length ? (
        <MinimalTable
          className="spacer-section-above"
          headers={programsTableHeaders}
          data={programsTableData}
        />
      ) : (
        <FieldValue className="spacer-section-above">{t("t.none")}</FieldValue>
      )}
    </SectionWithGrid>
  )
}

export default DetailPrograms

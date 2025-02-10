import * as React from "react"
import { Unit, UnitSummary } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { StandardTable } from "@bloom-housing/ui-components"
import { getUnitTableData, unitsHeaders } from "@bloom-housing/shared-helpers"
import { ExpandableSection } from "../../../patterns/ExpandableSection"

type UnitSummariesProps = {
  disableUnitsAccordion: boolean
  units: Unit[]
  unitSummary: UnitSummary[]
}

export const UnitSummaries = ({
  disableUnitsAccordion,
  units,
  unitSummary,
}: UnitSummariesProps) => {
  if (!unitSummary?.length) return
  return (
    <>
      {unitSummary.map((summary, index) => {
        const unitTableData = getUnitTableData(units, summary)
        return (
          <div
            className={index !== 0 ? "seeds-m-bs-header" : ""}
            key={index}
            data-testid={"listing-unit-summary"}
          >
            <ExpandableSection
              title={unitTableData.barContent}
              priority={4}
              disableCollapse={disableUnitsAccordion}
              uniqueId={`unit-feature-${index}`}
            >
              <StandardTable headers={unitsHeaders} data={unitTableData.unitsFormatted} />
            </ExpandableSection>
          </div>
        )
      })}
    </>
  )
}

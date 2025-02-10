import * as React from "react"
import { t } from "@bloom-housing/ui-components"
import { CollapsibleSection } from "../../../patterns/CollapsibleSection"
import { OrderedSection } from "../../../patterns/OrderedSection"
import { EligibilitySection } from "../ListingViewSeedsHelpers"
import styles from "./Eligibility.module.scss"

type EligibilityProps = {
  eligibilitySections: EligibilitySection[]
}

export const Eligibility = ({ eligibilitySections }: EligibilityProps) => {
  if (!eligibilitySections.length) return
  return (
    <CollapsibleSection
      title={t("listings.sections.eligibilityTitle")}
      subtitle={t("listings.sections.eligibilitySubtitle")}
      priority={2}
      contentClassName={styles["mobile-collapse-padding"]}
    >
      <ol>
        {eligibilitySections.map((section, index) => {
          return (
            <div key={index}>
              <OrderedSection
                order={index + 1}
                title={section.header}
                subtitle={section.subheader}
                note={section.note}
              >
                {section.content}
              </OrderedSection>
              {index < eligibilitySections.length - 1 && <hr />}
            </div>
          )
        })}
      </ol>
    </CollapsibleSection>
  )
}

import * as React from "react"
import { t } from "@bloom-housing/ui-components"
import { CollapsibleSection } from "../../../patterns/CollapsibleSection"
import { CardList, ContentCardProps } from "../../../patterns/CardList"
import styles from "../ListingViewSeeds.module.scss"

type AdditionalInformationProps = {
  additionalInformation: ContentCardProps[]
}

export const AdditionalInformation = ({ additionalInformation }: AdditionalInformationProps) => {
  if (!additionalInformation.length) return
  return (
    <CollapsibleSection
      title={t("listings.additionalInformation")}
      subtitle={t("listings.sections.additionalInformationSubtitle")}
      priority={2}
    >
      <div className={`${styles["mobile-inline-collapse-padding"]} seeds-m-bs-section`}>
        <CardList cardContent={additionalInformation} priority={3} />
      </div>
    </CollapsibleSection>
  )
}

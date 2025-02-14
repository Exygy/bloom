import * as React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import { getCurrencyRange } from "@bloom-housing/shared-helpers"
import listingStyles from "../ListingViewSeeds.module.scss"
import styles from "./AdditionalFees.module.scss"

type AdditionalFeesProps = {
  applicationFee: string | null
  costsNotIncluded: string | null
  depositHelperText: string | null
  depositMax: string | null
  depositMin: string | null
  utilitiesIncluded: string[]
}

export const AdditionalFees = ({
  applicationFee,
  costsNotIncluded,
  depositHelperText,
  depositMax,
  depositMin,
  utilitiesIncluded,
}: AdditionalFeesProps) => {
  return (
    <>
      {(applicationFee ||
        depositMin ||
        depositMax ||
        costsNotIncluded ||
        utilitiesIncluded.length) && (
        <Card className={"seeds-m-bs-content"}>
          <Card.Section>
            <Heading size={"lg"} priority={3} className={"seeds-m-be-header"}>
              {t("listings.sections.additionalFees")}
            </Heading>
            <div className={styles["split-card"]}>
              {applicationFee && (
                <div className={styles["split-card-cell"]}>
                  <Heading size={"md"} className={listingStyles["thin-heading"]} priority={4}>
                    {t("listings.applicationFee")}
                  </Heading>
                  <div className={styles.emphasized}>{`$${applicationFee}`}</div>
                  <div>{t("listings.applicationPerApplicantAgeDescription")}</div>
                  <div>{t("listings.applicationFeeDueAt")}</div>
                </div>
              )}
              {(depositMin || depositMax) && (
                <div className={styles["split-card-cell"]}>
                  <Heading size={"md"} className={listingStyles["thin-heading"]} priority={4}>
                    {t("t.deposit")}
                  </Heading>
                  <div className={styles.emphasized}>
                    {getCurrencyRange(parseInt(depositMin), parseInt(depositMax))}
                  </div>
                  <div>{depositHelperText}</div>
                </div>
              )}
            </div>
            {costsNotIncluded && <div className={"seeds-m-be-content"}>{costsNotIncluded}</div>}
            {utilitiesIncluded.length && (
              <div className={"seeds-m-be-content"}>
                <Heading size={"md"} priority={4}>
                  {t("listings.sections.utilities")}
                </Heading>
                {utilitiesIncluded}
              </div>
            )}
          </Card.Section>
        </Card>
      )}
    </>
  )
}

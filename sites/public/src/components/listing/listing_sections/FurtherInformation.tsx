import * as React from "react"
import { t } from "@bloom-housing/ui-components"
import { InfoCard } from "./InfoCard"

type FurtherInformationProps = {
  instructions?: string
  phoneNumber?: string
}

export const FurtherInformation = ({ instructions, phoneNumber }: FurtherInformationProps) => {
  return (
    <InfoCard heading={t("application.referralApplication.furtherInformation")}>
      <>
        {phoneNumber && (
          <p className={"seeds-m-be-text"}>
            <a href={`tel:${phoneNumber.replace(/[-()]/g, "")}`}>{`${t(
              "t.call"
            )} ${phoneNumber}`}</a>
          </p>
        )}
        <p>{instructions || t("application.referralApplication.instructions")}</p>
      </>
    </InfoCard>
  )
}

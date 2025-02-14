import * as React from "react"
import { t } from "@bloom-housing/ui-components"
import { Link } from "@bloom-housing/ui-seeds"
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
            <Link href={`tel:${phoneNumber.replace(/[-()]/g, "")}`}>{`${t(
              "t.call"
            )} ${phoneNumber}`}</Link>
          </p>
        )}
        <p>{instructions || t("application.referralApplication.instructions")}</p>
      </>
    </InfoCard>
  )
}

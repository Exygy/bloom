import * as React from "react"
import { Card, Heading, Link } from "@bloom-housing/ui-seeds"
import { Address as AddressType } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { Address } from "@bloom-housing/shared-helpers"
import { t } from "@bloom-housing/ui-components"
import styles from "../ListingViewSeeds.module.scss"

type LeasingAgentProps = {
  address?: AddressType
  email?: string
  name?: string
  officeHours?: string
  phone?: string
  title?: string
}

export const LeasingAgent = ({
  address,
  email,
  name,
  officeHours,
  phone,
  title,
}: LeasingAgentProps) => {
  if (!address && !email && !name && !officeHours && !phone) return
  return (
    <Card
      className={`${styles["mobile-full-width-card"]} ${styles["mobile-no-bottom-border"]} seeds-m-bs-content`}
    >
      <Card.Section>
        <Heading size={"lg"} priority={2} className={"seeds-m-be-header"}>
          {t("leasingAgent.contact")}
        </Heading>
        <div>{name && <p className={`${styles["thin-heading"]} seeds-m-be-text`}>{name}</p>}</div>
        <div>{title && <p>{title}</p>}</div>
        <div>
          {phone && (
            <p className={"seeds-m-bs-header seeds-m-be-text"}>
              <Link href={`tel:${phone.replace(/[-()]/g, "")}`}>{`${t("t.call")} ${phone}`}</Link>
            </p>
          )}
        </div>
        <div>{phone && <p>{t("leasingAgent.dueToHighCallVolume")}</p>}</div>
        <div>
          {email && (
            <p className={"seeds-m-bs-header"}>
              <Link href={`mailto:${email}`}>{t("t.email")}</Link>
            </p>
          )}
        </div>
        {address && (
          <div className={"seeds-m-bs-header"}>
            <Address address={address} getDirections={true} />
          </div>
        )}

        {officeHours && (
          <div className={"seeds-m-bs-header"}>
            <Heading
              size={"md"}
              priority={3}
              className={`seeds-m-be-text ${styles["thin-heading-sm"]}`}
            >
              {t("leasingAgent.officeHours")}
            </Heading>
            <p>{officeHours}</p>
          </div>
        )}
      </Card.Section>
    </Card>
  )
}

import * as React from "react"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "../ListingViewSeeds.module.scss"

type InfoCardProps = {
  children: React.ReactNode
  heading: string
}

export const InfoCard = ({ children, heading }: InfoCardProps) => {
  return (
    <Card
      className={`${styles["mobile-full-width-card"]} ${styles["mobile-no-bottom-border"]} seeds-m-bs-content`}
    >
      <Card.Section>
        <Heading size={"lg"} priority={2} className={"seeds-m-be-header"}>
          {heading}
        </Heading>
        {children}
      </Card.Section>
    </Card>
  )
}

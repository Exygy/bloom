import * as React from "react"
import ClockIcon from "@heroicons/react/24/solid/ClockIcon"
import { Card, Icon } from "@bloom-housing/ui-seeds"
import listingStyles from "../ListingViewSeeds.module.scss"
import styles from "./DueDate.module.scss"

type DueDateProps = {
  content: string[]
}

export const DueDate = (props: DueDateProps) => {
  if (!props.content.length || props.content.every((item) => !item)) return
  return (
    <Card className={`${listingStyles["muted-card"]} ${styles["due-date-section"]}`} spacing={"sm"}>
      <Card.Section>
        <div className={styles["date-content"]}>
          <Icon size={"md"} className={styles["primary-color-icon"]} aria-hidden={true}>
            <ClockIcon />
          </Icon>
          <div>
            {props.content
              .filter((content) => !!content)
              .map((content, index) => {
                return <div key={index}>{content}</div>
              })}
          </div>
        </div>
      </Card.Section>
    </Card>
  )
}

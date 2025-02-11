import * as React from "react"
import dayjs from "dayjs"
import { Card, Heading, Link } from "@bloom-housing/ui-seeds"
import { getTimeRangeString } from "@bloom-housing/shared-helpers"
import { ListingEventCreate } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import styles from "../ListingViewSeeds.module.scss"

type DateSectionProps = {
  events: ListingEventCreate[]
  heading: string
}

export const DateSection = ({ events, heading }: DateSectionProps) => {
  if (!events.length) return
  return (
    <Card
      className={`${styles["mobile-full-width-card"]} ${styles["mobile-no-bottom-border"]} seeds-m-bs-content`}
    >
      <Card.Section>
        <Heading size={"lg"} priority={2} className={"seeds-p-be-header"}>
          {heading}
        </Heading>
        {events.map((event, index) => {
          const dateString = dayjs(event.startDate).format("MMMM D, YYYY")
          const timeString = getTimeRangeString(event.startTime, event.endTime)
          return (
            <div key={index}>
              {dateString && (
                <div className={`${styles["thin-heading"]} ${index > 0 && `seeds-m-bs-header`}`}>
                  {dateString}
                </div>
              )}
              {timeString && <div className={"seeds-m-bs-text"}>{timeString}</div>}
              {event.url && (
                <div className={"seeds-m-bs-text"}>
                  <Link href={event.url} hideExternalLinkIcon={true}>
                    {event.label || t("listings.openHouseEvent.seeVideo")}
                  </Link>
                </div>
              )}
              {event.note && <div className={"seeds-m-bs-text"}>{event.note}</div>}
            </div>
          )
        })}
      </Card.Section>
    </Card>
  )
}

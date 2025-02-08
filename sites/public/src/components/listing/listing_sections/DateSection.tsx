import * as React from "react"
import dayjs from "dayjs"
import { Card, Heading, Link } from "@bloom-housing/ui-seeds"
import { getTimeRangeString } from "@bloom-housing/shared-helpers"
import { ListingEventCreate } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import styles from "../ListingViewSeeds.module.scss"

export type DateSectionEventType = {
  dateString?: string
  linkText?: string
  linkURL?: string
  note?: string | React.ReactNode
  timeString?: string
}

export const getEvent = (
  event: ListingEventCreate,
  note?: string | React.ReactNode
): DateSectionEventType => {
  return {
    timeString: getTimeRangeString(event.startTime, event.endTime),
    dateString: dayjs(event.startDate).format("MMMM D, YYYY"),
    linkURL: event.url,
    linkText: event.label || t("listings.openHouseEvent.seeVideo"),
    note: note || event.note,
  }
}

type DateSectionProps = {
  events: DateSectionEventType[]
  heading: string
}

export const DateSection = ({ events, heading }: DateSectionProps) => {
  if (!events.length) return
  return (
    <Card className={styles["mobile-full-width-card"]}>
      <Card.Section>
        <Heading size={"lg"} priority={2} className={"seeds-p-be-header"}>
          {heading}
        </Heading>
        {events.map((event, index) => {
          return (
            <div key={index}>
              {event.dateString && (
                <div
                  className={`${styles["thin-heading"]} seeds-m-be-text ${
                    index > 0 && `seeds-m-bs-4`
                  }`}
                >
                  {event.dateString}
                </div>
              )}
              {event.timeString && <div className={"seeds-m-be-text"}>{event.timeString}</div>}
              {event?.linkText && event.linkURL && (
                <div className={"seeds-m-be-text"}>
                  <Link href={event.linkURL} hideExternalLinkIcon={true}>
                    {event.linkText}
                  </Link>
                </div>
              )}
              {event.note && (
                <div className={`${index < events.length - 1 ? "seeds-m-be-text" : ""}`}>
                  {event.note}
                </div>
              )}
            </div>
          )
        })}
      </Card.Section>
    </Card>
  )
}

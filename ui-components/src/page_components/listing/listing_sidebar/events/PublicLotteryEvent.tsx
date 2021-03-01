import * as React from "react"
import { ListingEvent } from "@bloom-housing/backend-core/types"
import { EventDateSection } from "../../../../sections/EventDateSection"
import { t } from "../../../../helpers/translator"

const PublicLotteryEvent = (props: { event: ListingEvent }) => {
  const { event } = props
  return (
    <section className="aside-block -mx-4 pt-0 md:mx-0 md:pt-4">
      <h4 className="text-caps-underline">{t("listings.publicLottery.header")}</h4>
      <EventDateSection event={event} />
      {event.url && (
        <p className="text text-gray-800 pb-3">
          <a href={event.url}>{t("listings.publicLottery.seeVideo")}</a>
        </p>
      )}
      {event.note && <p className="text-tiny text-gray-600">{event.note}</p>}
    </section>
  )
}

export { PublicLotteryEvent as default, PublicLotteryEvent }

import * as React from "react"
import { ListingEvent } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import { DateSection, getEvent } from "./DateSection"

type LotteryEventProps = {
  event: ListingEvent
  lotteryRanNoResultsPosted: boolean
}

export const LotteryEvent = ({ event, lotteryRanNoResultsPosted }: LotteryEventProps) => {
  if (!event) return null
  return (
    <DateSection
      heading={t("listings.publicLottery.header")}
      events={[
        getEvent(
          event,
          lotteryRanNoResultsPosted ? t("listings.lotteryResults.completeResultsWillBePosted") : ""
        ),
      ]}
    />
  )
}

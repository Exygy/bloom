import React from "react"
import dayjs from "dayjs"
import { StatusItem } from "./StatusItem"
import {
  Application,
  Listing,
  ListingsStatusEnum,
  LotteryStatusEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"

export interface AppWithListing extends Application {
  listings: Listing
}
interface StatusItemWrapperProps {
  application: AppWithListing
}

const StatusItemWrapper = (props: StatusItemWrapperProps) => {
  const applicationDueDate = props.application?.listings?.applicationDueDate
  const isListingClosed = props.application?.listings?.status === ListingsStatusEnum.closed

  return (
    <StatusItem
      applicationDueDate={applicationDueDate && dayjs(applicationDueDate).format("MMMM D, YYYY")}
      applicationURL={!isListingClosed && `/account/application/${props.application?.id}`}
      applicationUpdatedAt={dayjs(props.application?.updatedAt).format("MMMM D, YYYY")}
      confirmationNumber={props.application?.confirmationCode || props.application?.id}
      listingName={props.application?.listings?.name}
      listingURL={`/listing/${props.application?.listings?.id}`}
      key={props.application?.id}
      lotteryResults={
        props.application?.fullListing?.lotteryStatus === LotteryStatusEnum.publishedToPublic
      }
      lotteryURL={`/account/application/${props.application?.id}/lottery-results`}
    />
  )
}

export { StatusItemWrapper as default, StatusItemWrapper }

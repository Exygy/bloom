import * as React from "react"
import dayjs from "dayjs"
import { Button, Card, HeadingGroup } from "@bloom-housing/ui-seeds"
import {
  ListingEvent,
  ListingsStatusEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import styles from "../ListingViewSeeds.module.scss"

type LotteryResultsProps = {
  listingStatus: ListingsStatusEnum
  lotteryResultsEvent: ListingEvent
  lotteryResultsPdfUrl: string
}

export const LotteryResults = ({
  listingStatus,
  lotteryResultsEvent,
  lotteryResultsPdfUrl,
}: LotteryResultsProps) => {
  if (!lotteryResultsPdfUrl || listingStatus !== ListingsStatusEnum.closed) return
  return (
    <Card className={`${styles["mobile-full-width-card"]} ${styles["mobile-no-bottom-border"]}`}>
      <Card.Section>
        <HeadingGroup
          headingPriority={3}
          size={"lg"}
          className={`${styles["heading-group"]} seeds-m-be-header`}
          heading={t("listings.lotteryResults.header")}
          subheading={
            lotteryResultsEvent?.startTime
              ? dayjs(lotteryResultsEvent.startTime).format("MMMM D, YYYY")
              : null
          }
        />
        <Button
          href={lotteryResultsPdfUrl}
          hideExternalLinkIcon={true}
          className={styles["full-width-button"]}
        >
          {t("listings.lotteryResults.downloadResults")}
        </Button>
      </Card.Section>
    </Card>
  )
}

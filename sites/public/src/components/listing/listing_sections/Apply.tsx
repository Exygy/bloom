import React, { useContext } from "react"
import dayjs from "dayjs"
import Markdown from "markdown-to-jsx"
import { Address, AuthContext, getPostmarkString } from "@bloom-housing/shared-helpers"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import {
  ApplicationMethodsTypeEnum,
  Listing,
  ListingsStatusEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import { downloadExternalPDF } from "../../../lib/helpers"
import {
  getAddress,
  getDateString,
  getHasNonReferralMethods,
  getMethod,
  getOnlineApplicationURL,
  getPaperApplications,
} from "../ListingViewSeedsHelpers"
import listingStyles from "../ListingViewSeeds.module.scss"
import styles from "./Apply.module.scss"

type ApplyProps = {
  listing: Listing
  preview: boolean
  setShowDownloadModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const Apply = ({ listing, preview, setShowDownloadModal }: ApplyProps) => {
  const { initialStateLoaded, profile } = useContext(AuthContext)

  const applicationsClosed = dayjs() > dayjs(listing.applicationDueDate)

  const redirectIfSignedOut = () =>
    process.env.showMandatedAccounts && initialStateLoaded && !profile

  const onlineApplicationUrl = redirectIfSignedOut()
    ? `/sign-in?redirectUrl=/applications/start/choose-language&listingId=${listing.id}`
    : getOnlineApplicationURL(listing.applicationMethods, listing.id, preview)
  const disableApplyButton = !preview && listing.status !== ListingsStatusEnum.active

  const paperApplications = getPaperApplications(listing.applicationMethods)

  const hasPaperApplication =
    !!getMethod(listing.applicationMethods, ApplicationMethodsTypeEnum.FileDownload) &&
    paperApplications.length > 0

  const applicationPickUpAddress = getAddress(
    listing.applicationPickUpAddressType,
    "pickUp",
    listing
  )
  const applicationMailingAddress = getAddress(
    listing.applicationMailingAddressType,
    "mailIn",
    listing
  )
  const applicationDropOffAddress = getAddress(
    listing.applicationDropOffAddressType,
    "dropOff",
    listing
  )
  const postmarkString = getPostmarkString(
    listing.applicationDueDate
      ? getDateString(listing.applicationDueDate, `MMM DD, YYYY [${t("t.at")}] hh:mm A`)
      : null,
    listing.postmarkedApplicationsReceivedByDate
      ? getDateString(
          listing.postmarkedApplicationsReceivedByDate,
          `MMM DD, YYYY [${t("t.at")}] hh:mm A`
        )
      : null,
    listing.developer
  )

  const ApplyOnlineButton = (
    <Button
      disabled={disableApplyButton}
      className={listingStyles["full-width-button"]}
      href={onlineApplicationUrl}
      id={"listing-view-apply-button"}
    >
      {t("listings.apply.applyOnline")}
    </Button>
  )

  const DownloadApplicationButton = (
    <Button
      variant={onlineApplicationUrl ? "primary-outlined" : "primary"}
      onClick={async () => {
        paperApplications.length === 1
          ? await downloadExternalPDF(paperApplications[0].fileURL, listing.name)
          : setShowDownloadModal(true)
      }}
      className={listingStyles["full-width-button"]}
    >
      {t("listings.apply.downloadApplication")}
    </Button>
  )

  return (
    <>
      {getHasNonReferralMethods(listing) &&
        !applicationsClosed &&
        listing.status !== ListingsStatusEnum.closed && (
          <Card
            className={`${listingStyles["mobile-full-width-card"]} ${listingStyles["mobile-no-bottom-border"]}`}
          >
            <Card.Section divider="flush" className={styles["card-section-background"]}>
              <Heading priority={2} size={"lg"} className={"seeds-m-be-header"}>
                {t("listings.apply.howToApply")}
              </Heading>
              {onlineApplicationUrl ? ApplyOnlineButton : DownloadApplicationButton}
            </Card.Section>
            {((hasPaperApplication &&
              (onlineApplicationUrl ||
                applicationMailingAddress ||
                applicationPickUpAddress ||
                applicationDropOffAddress)) ||
              !!applicationPickUpAddress) && (
              <Card.Section divider="flush">
                {hasPaperApplication && onlineApplicationUrl && (
                  <>
                    <Heading priority={2} size={"lg"} className={"seeds-m-be-header"}>
                      {t("listings.apply.getAPaperApplication")}
                    </Heading>
                    {DownloadApplicationButton}
                  </>
                )}
                {applicationPickUpAddress && (
                  <div>
                    <Heading
                      size={"md"}
                      priority={3}
                      className={`${
                        hasPaperApplication && onlineApplicationUrl ? "seeds-m-bs-content" : ""
                      } seeds-m-be-header`}
                    >
                      {t("listings.apply.pickUpAnApplication")}
                    </Heading>
                    <Address address={applicationPickUpAddress} getDirections={true} />
                    {listing.applicationPickUpAddressOfficeHours && (
                      <div className={"seeds-m-bs-content"}>
                        <Heading size={"md"} priority={4} className={"seeds-m-be-header"}>
                          {t("leasingAgent.officeHours")}
                        </Heading>
                        <Markdown children={listing.applicationPickUpAddressOfficeHours} />
                      </div>
                    )}
                  </div>
                )}
                {applicationMailingAddress && (
                  <div className={"seeds-m-bs-content"}>
                    <Heading size={"lg"} priority={2} className={"seeds-m-be-header"}>
                      {t("listings.apply.submitAPaperApplication")}
                    </Heading>
                    <Heading size={"md"} priority={3} className={`seeds-m-be-header`}>
                      {t("listings.apply.sendByUsMail")}
                    </Heading>
                    <Address address={applicationMailingAddress} />
                    {postmarkString && <p className={"seeds-m-bs-label"}>{postmarkString}</p>}
                  </div>
                )}
                {applicationDropOffAddress && (
                  <div className={"seeds-m-bs-content"}>
                    <Heading size={"md"} priority={3} className={`seeds-m-be-header`}>
                      {t("listings.apply.dropOffApplication")}
                    </Heading>
                    <Address address={applicationDropOffAddress} getDirections={true} />
                    {listing.applicationDropOffAddressOfficeHours && (
                      <div className={"seeds-m-bs-content"}>
                        <Heading size={"md"} priority={4} className={"seeds-m-be-header"}>
                          {t("leasingAgent.officeHours")}
                        </Heading>
                        <Markdown children={listing.applicationDropOffAddressOfficeHours} />
                      </div>
                    )}
                  </div>
                )}
              </Card.Section>
            )}
          </Card>
        )}
    </>
  )
}

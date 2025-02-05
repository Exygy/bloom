import React, { useContext, useState } from "react"
import Markdown from "markdown-to-jsx"
import { useForm } from "react-hook-form"
import dayjs from "dayjs"
import ClockIcon from "@heroicons/react/24/solid/ClockIcon"
import {
  ApplicationMethodsTypeEnum,
  Jurisdiction,
  Listing,
  ListingEventsTypeEnum,
  ListingsStatusEnum,
  ReviewOrderTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import {
  ImageCard,
  ListingMap,
  t,
  StandardTableData,
  StandardTable,
} from "@bloom-housing/ui-components"
import {
  imageUrlFromListing,
  getCurrencyRange,
  getPostmarkString,
  getSummariesTable,
  IMAGE_FALLBACK_URL,
  pdfUrlFromListingEvents,
  AuthContext,
  getUnitTableData,
  unitsHeaders,
} from "@bloom-housing/shared-helpers"
import { Card, HeadingGroup, Icon, Heading, Button, Tag, Link } from "@bloom-housing/ui-seeds"
import { ErrorPage } from "../../pages/_error"
import { useGetApplicationStatusProps } from "../../lib/hooks"
import { downloadExternalPDF, getGenericAddress, oneLineAddress } from "../../lib/helpers"
import { CollapsibleSection } from "../../patterns/CollapsibleSection"
import { CardList } from "../../patterns/CardList"
import { OrderedSection } from "../../patterns/OrderedSection"
import { Address } from "../../patterns/Address"
import { ExpandableTable } from "../../patterns/ExpandableTable"

import {
  dateSection,
  getAdditionalInformation,
  getAddress,
  getAmiValues,
  getAvailabilityContent,
  getAvailabilitySubheading,
  getDateString,
  getEligibilitySections,
  getEvent,
  getFeatures,
  getHasNonReferralMethods,
  getListingTags,
  getMethod,
  getOnlineApplicationURL,
  getPaperApplications,
  getReservedTitle,
  getUtilitiesIncluded,
  PaperApplicationDialog,
} from "./ListingDetailViewHelpers"

import styles from "./ListingDetailView.module.scss"

interface ListingProps {
  listing: Listing
  preview?: boolean
  jurisdiction?: Jurisdiction
}

const unitSummariesHeaders = {
  unitType: "t.unitType",
  minimumIncome: "t.minimumIncome",
  rent: "t.rent",
  availability: "t.availability",
}

export const ListingDetailView = (props: ListingProps) => {
  const { initialStateLoaded, profile } = useContext(AuthContext)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  const { listing } = props
  const { content: appStatusContent, subContent: appStatusSubContent } =
    useGetApplicationStatusProps(listing)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch } = useForm()

  if (!listing) {
    return <ErrorPage />
  }

  // Massage listing data ----------
  const googleMapsHref =
    "https://www.google.com/maps/place/" + oneLineAddress(listing.listingsBuildingAddress)
  const applicationsClosed = dayjs() > dayjs(listing.applicationDueDate)
  const amiValues = getAmiValues(listing)
  const redirectIfSignedOut = () =>
    process.env.showMandatedAccounts && initialStateLoaded && !profile
  const onlineApplicationUrl = redirectIfSignedOut()
    ? `/sign-in?redirectUrl=/applications/start/choose-language&listingId=${listing.id}`
    : getOnlineApplicationURL(listing.applicationMethods, listing.id, props.preview)
  const disableApplyButton = !props.preview && listing.status !== ListingsStatusEnum.active
  const eligibilitySections = getEligibilitySections(listing)
  const paperApplications = getPaperApplications(listing.applicationMethods)
  const paperApplicationURL: string = watch(
    "paperApplicationLanguage",
    paperApplications?.length ? paperApplications[0].fileURL : undefined
  )
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
  const openHouseEvents = listing.listingEvents
    ?.filter((event) => event.type === ListingEventsTypeEnum.openHouse)
    .map((event) => getEvent(event))
  const publicLotteryEvent = listing.listingEvents?.find(
    (event) => event.type === ListingEventsTypeEnum.publicLottery
  )
  const lotteryResultsEvent = listing.listingEvents?.find(
    (event) => event.type === ListingEventsTypeEnum.lotteryResults
  )
  const lotteryRanNoResultsPosted =
    dayjs(publicLotteryEvent?.startTime) < dayjs() && !lotteryResultsEvent
  const listingTags = getListingTags(listing)
  const features = getFeatures(listing, props?.jurisdiction)
  const lotteryResultsPdfUrl = pdfUrlFromListingEvents(
    [lotteryResultsEvent],
    ListingEventsTypeEnum.lotteryResults,
    process.env.cloudinaryCloudName
  )
  const enableUtilitiesIncluded = props.jurisdiction.featureFlags?.some(
    (flag) => flag.name === "enableUtilitiesIncluded" && flag.active
  )
  const utilitiesIncluded = getUtilitiesIncluded(listing)
  let groupedUnits: StandardTableData = []
  if (amiValues.length == 1) {
    groupedUnits = getSummariesTable(
      listing.unitsSummarized.byUnitTypeAndRent,
      listing.reviewOrderType
    )
  } // else condition is handled inline below

  // Sections ----------
  const DueDate = (
    <Card className={`${styles["muted-card"]} ${styles["application-date-card"]}`} spacing={"sm"}>
      <Card.Section>
        <div className={styles["application-date-content"]}>
          <Icon size={"md"} className={styles["primary-icon"]}>
            <ClockIcon />
          </Icon>
          <div>
            <div>{appStatusContent}</div>
            <div>{appStatusSubContent}</div>
          </div>
        </div>
        {/* todo test subcontent */}
      </Card.Section>
    </Card>
  )

  const ListingMainDetails = (
    <>
      {(listing.reservedCommunityTypes || listing.status !== ListingsStatusEnum.closed) && (
        <Card
          className={`${styles["muted-card"]} ${styles["listing-info-card"]} ${styles["mobile-full-width-muted-card"]}`}
        >
          {listing.reservedCommunityTypes && (
            <Card.Section divider="inset">
              <HeadingGroup
                heading={getReservedTitle(listing)}
                subheading={t(
                  `listings.reservedCommunityTypes.${listing.reservedCommunityTypes.name}`
                )}
                size={"lg"}
                className={`${styles["heading-group"]} ${styles["emphasized-heading-group"]}`}
              />
              <p className={styles["card-note"]}>{listing.reservedCommunityDescription}</p>
            </Card.Section>
          )}
          {listing.status !== ListingsStatusEnum.closed && (
            <Card.Section>
              <HeadingGroup
                heading={
                  props.listing.reviewOrderType === ReviewOrderTypeEnum.waitlist
                    ? t("listings.waitlist.isOpen")
                    : t("listings.vacantUnitsAvailable")
                }
                subheading={getAvailabilitySubheading(
                  listing.waitlistOpenSpots,
                  listing.unitsAvailable
                )}
                size={"lg"}
                className={`${styles["heading-group"]} ${styles["emphasized-heading-group"]}`}
              />
              <p>{getAvailabilityContent(props.listing.reviewOrderType)}</p>
            </Card.Section>
          )}
        </Card>
      )}
    </>
  )

  const LotteryResults = (
    <>
      {lotteryResultsPdfUrl && listing.status === ListingsStatusEnum.closed && (
        <Card className={styles["mobile-full-width-card"]}>
          <Card.Section>
            <HeadingGroup
              headingPriority={3}
              size={"lg"}
              className={`${styles["heading-group"]} seeds-m-be-header`}
              heading={t("listings.lotteryResults.header")}
              subheading={
                lotteryResultsEvent?.startTime
                  ? dayjs(lotteryResultsEvent?.startTime).format("MMMM D, YYYY")
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
      )}
    </>
  )

  const LotterySection =
    publicLotteryEvent &&
    (!lotteryResultsEvent || lotteryRanNoResultsPosted) &&
    dateSection(t("listings.publicLottery.header"), [
      getEvent(
        publicLotteryEvent,
        lotteryRanNoResultsPosted ? t("listings.lotteryResults.completeResultsWillBePosted") : ""
      ),
    ])

  const OpenHouses = dateSection(t("listings.openHouseEvent.header"), openHouseEvents)

  const ApplyOnlineButton = (
    <Button
      // todo disabled doesnt work for link buttons
      disabled={disableApplyButton}
      className={styles["full-width-button"]}
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
      className={styles["full-width-button"]}
    >
      {t("listings.apply.downloadApplication")}
    </Button>
  )

  const Apply = (
    <>
      {getHasNonReferralMethods(listing) &&
        !applicationsClosed &&
        listing.status !== ListingsStatusEnum.closed && (
          <Card className={styles["mobile-full-width-card"]}>
            <Card.Section divider="flush" className={styles["card-section-background"]}>
              <Heading priority={2} size={"lg"} className={styles["card-heading"]}>
                {t("listings.apply.howToApply")}
              </Heading>
              {onlineApplicationUrl ? ApplyOnlineButton : DownloadApplicationButton}
            </Card.Section>
            {(hasPaperApplication || !!applicationPickUpAddress) && (
              <Card.Section divider="flush">
                {hasPaperApplication && onlineApplicationUrl && (
                  <>
                    <Heading priority={2} size={"lg"} className={styles["card-heading"]}>
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
                        <Markdown
                          children={listing.applicationPickUpAddressOfficeHours}
                          options={{ disableParsingRawHTML: true }}
                        />
                      </div>
                    )}
                  </div>
                )}
                {applicationMailingAddress && (
                  <div className={"seeds-m-bs-content"}>
                    <Heading size={"lg"} priority={2} className={"seeds-m-be-header"}>
                      {t("listings.apply.submitAPaperApplication")}
                    </Heading>
                    <p>{listing.applicationOrganization}</p>
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
                    <Address address={applicationPickUpAddress} getDirections={true} />
                    {listing.applicationDropOffAddressOfficeHours && (
                      <div className={"seeds-m-bs-content"}>
                        <Heading size={"md"} priority={4} className={"seeds-m-be-header"}>
                          {t("leasingAgent.officeHours")}
                        </Heading>
                        <Markdown
                          children={listing.applicationDropOffAddressOfficeHours}
                          options={{ disableParsingRawHTML: true }}
                        />
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

  const ReferralApplication = (
    <>
      {listing?.referralApplication && (
        <Card className={styles["mobile-full-width-card"]}>
          <Card.Section>
            <Heading size={"lg"} priority={2} className={"seeds-m-be-header"}>
              {t("application.referralApplication.furtherInformation")}
            </Heading>
            {listing.referralApplication.phoneNumber && (
              <p className={"seeds-m-be-text"}>
                <a href={`tel:${listing.leasingAgentPhone.replace(/[-()]/g, "")}`}>{`${t(
                  "t.call"
                )} ${listing.referralApplication.phoneNumber}`}</a>
              </p>
            )}
            <p>
              {listing.referralApplication.externalReference ||
                t("application.referralApplication.instructions")}
            </p>
          </Card.Section>
        </Card>
      )}
    </>
  )

  const WhatToExpect = (
    <Card className={styles["mobile-full-width-card"]}>
      <Card.Section>
        <Heading size={"lg"} priority={3} className={"seeds-m-be-header"}>
          {t("whatToExpect.label")}
        </Heading>
        <div>{listing.whatToExpect}</div>
      </Card.Section>
    </Card>
  )

  const LeasingAgent = (
    <Card className={styles["mobile-full-width-card"]}>
      <Card.Section>
        <Heading size={"lg"} priority={2} className={"seeds-m-be-header"}>
          {t("leasingAgent.contact")}
        </Heading>
        <div>
          {listing.leasingAgentName && (
            <p className={`${styles["slim-heading"]} seeds-m-be-text`}>
              {listing.leasingAgentName}
            </p>
          )}
        </div>
        <div>{listing.leasingAgentTitle && <p>{listing.leasingAgentTitle}</p>}</div>
        <div>
          {listing.leasingAgentPhone && (
            <p className={"seeds-m-bs-header seeds-m-be-text"}>
              <a href={`tel:${listing.leasingAgentPhone.replace(/[-()]/g, "")}`}>{`${t("t.call")} ${
                listing.leasingAgentPhone
              }`}</a>
            </p>
          )}
        </div>
        <div>{listing.leasingAgentPhone && <p>{t("leasingAgent.dueToHighCallVolume")}</p>}</div>
        <div>
          {listing.leasingAgentEmail && (
            <p className={"seeds-m-bs-header"}>
              <a href={`mailto:${listing.leasingAgentEmail}`}>{t("t.email")}</a>
            </p>
          )}
        </div>
        {listing.listingsLeasingAgentAddress && (
          <div className={"seeds-m-bs-header"}>
            <Address address={listing.listingsLeasingAgentAddress} getDirections={true} />
          </div>
        )}

        {listing.leasingAgentOfficeHours && (
          <div className={"seeds-m-bs-header"}>
            <Heading size={"md"} priority={3} className={"seeds-m-be-header"}>
              {t("leasingAgent.officeHours")}
            </Heading>
            <p>{listing.leasingAgentOfficeHours}</p>
          </div>
        )}
      </Card.Section>
    </Card>
  )

  const AdditionalFees = (
    <>
      {(listing.applicationFee ||
        listing.depositMin ||
        listing.depositMax ||
        listing.costsNotIncluded ||
        (enableUtilitiesIncluded && utilitiesIncluded?.length)) && (
        <Card className={"seeds-m-bs-content"}>
          <Card.Section>
            <Heading size={"lg"} priority={3} className={"seeds-m-be-header"}>
              {t("listings.sections.additionalFees")}
            </Heading>
            <div className={styles["split-card"]}>
              {listing.applicationFee && (
                <div className={styles["split-card-cell"]}>
                  <Heading size={"md"} className={styles["slim-heading"]}>
                    {t("listings.applicationFee")}
                  </Heading>
                  <div className={styles.emphasized}>{`$${listing.applicationFee}`}</div>
                  <div>{t("listings.applicationPerApplicantAgeDescription")}</div>
                  <div>{t("listings.applicationFeeDueAt")}</div>
                </div>
              )}
              {(listing.depositMin || listing.depositMax) && (
                <div className={styles["split-card-cell"]}>
                  <Heading size={"md"} className={styles["slim-heading"]}>
                    {t("t.deposit")}
                  </Heading>
                  <div className={styles.emphasized}>
                    {getCurrencyRange(parseInt(listing.depositMin), parseInt(listing.depositMax))}
                  </div>
                  <div>{listing.depositHelperText}</div>
                </div>
              )}
            </div>
            {listing.costsNotIncluded && (
              <div className={"seeds-m-be-content"}>{listing.costsNotIncluded}</div>
            )}
            {enableUtilitiesIncluded && utilitiesIncluded?.length && (
              <div className={"seeds-m-be-content"}>
                <Heading size={"md"}>{t("listings.sections.utilities")}</Heading>
                {utilitiesIncluded}
              </div>
            )}
          </Card.Section>
        </Card>
      )}
    </>
  )

  const ApplyBar = (
    <>
      {LotteryResults}
      {Apply}
      {ReferralApplication}
      {OpenHouses}
      {LotterySection}
      {WhatToExpect}
      {LeasingAgent}
    </>
  )

  return (
    <article className={styles["listing-detail-view"]}>
      <div className={styles["content-wrapper"]}>
        <div className={styles["left-bar"]}>
          {/* Image and main details */}
          <div className={styles["image-card"]}>
            <ImageCard
              images={imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize)).map(
                (imageUrl: string) => {
                  return {
                    url: imageUrl,
                  }
                }
              )}
              description={t("listings.buildingImageAltText")}
              moreImagesLabel={t("listings.moreImagesLabel")}
              moreImagesDescription={t("listings.moreImagesAltDescription", {
                listingName: listing.name,
              })}
              modalCloseLabel={t("t.backToListing")}
              modalCloseInContent
              fallbackImageUrl={IMAGE_FALLBACK_URL}
            />
            <div className={styles["listing-main-details"]}>
              <Heading priority={1} size={"xl"} className={styles["listing-heading"]}>
                {listing.name}
              </Heading>
              <div className={styles["listing-address"]}>
                <div className={"seeds-m-ie-4"}>
                  {oneLineAddress(listing.listingsBuildingAddress)}
                </div>
                <div>
                  <Link href={googleMapsHref} newWindowTarget={true}>
                    {t("t.viewOnMap")}
                  </Link>
                </div>
              </div>

              {listingTags?.length > 0 && (
                <div className={`${styles["listing-tags"]} seeds-m-bs-3`}>
                  {listingTags.map((tag) => {
                    return <Tag variant={tag.variant}>{tag.title}</Tag>
                  })}
                </div>
              )}

              <p className={"seeds-m-bs-3"}>{listing.developer}</p>
              <div className={`${styles["hide-desktop"]} seeds-m-b-3`}>{DueDate}</div>
            </div>
            <div className={styles["hide-desktop"]}>{ListingMainDetails}</div>
          </div>

          <div className={styles["rent-summary"]}>
            <div>
              <Heading size={"lg"} className={"seeds-m-be-header"} priority={2}>
                {t("listings.rentSummary")}
              </Heading>
              {amiValues.length > 1 &&
                amiValues.map((percent) => {
                  const byAMI = listing.unitsSummarized.byAMI.find((item) => {
                    return parseInt(item.percent, 10) == percent
                  })

                  groupedUnits = byAMI
                    ? getSummariesTable(byAMI.byUnitType, listing.reviewOrderType)
                    : []

                  return (
                    <React.Fragment key={percent}>
                      <Heading size={"md"} priority={3} className={"seeds-m-bs-content"}>
                        {t("listings.percentAMIUnit", { percent: percent })}
                      </Heading>
                      <div className={"seeds-m-bs-header"}>
                        <StandardTable
                          headers={unitSummariesHeaders}
                          data={groupedUnits}
                          responsiveCollapse={true}
                        />
                      </div>
                    </React.Fragment>
                  )
                })}
              {amiValues.length == 1 && (
                <StandardTable
                  headers={unitSummariesHeaders}
                  data={groupedUnits}
                  responsiveCollapse={true}
                />
              )}
            </div>
          </div>

          {/* Main content */}
          <div className={styles["main-content"]}>
            <div className={styles["hide-desktop"]}>{ApplyBar}</div>
            <CollapsibleSection
              title={t("listings.sections.eligibilityTitle")}
              subtitle={t("listings.sections.eligibilitySubtitle")}
              priority={2}
              contentClassName={styles["mobile-collapse"]}
            >
              <ol>
                {eligibilitySections.map((section, index) => {
                  return (
                    <>
                      <OrderedSection
                        order={index + 1}
                        title={section.header}
                        subtitle={section.subheader}
                        note={section.note}
                      >
                        {section.content}
                      </OrderedSection>
                      {index < eligibilitySections.length - 1 && <hr />}
                    </>
                  )
                })}
              </ol>
            </CollapsibleSection>

            <CollapsibleSection
              title={t("listings.sections.featuresTitle")}
              subtitle={t("listings.sections.featuresSubtitle")}
              priority={2}
            >
              <div className={styles["inline-collapse-padding"]}>
                {features.map((feature) => {
                  return (
                    <HeadingGroup
                      heading={feature.heading}
                      subheading={feature.subheading}
                      size={"lg"}
                      headingPriority={3}
                      className={styles["features-heading-group"]}
                    />
                  )
                })}
                <Heading size={"lg"} className={"seeds-m-be-header"} priority={3}>
                  {t("t.unitFeatures")}
                </Heading>
                {listing?.unitsSummarized?.byUnitType.map((summary, index) => {
                  const unitTableData = getUnitTableData(listing.units, summary)
                  return (
                    <div className={index !== 0 ? "seeds-m-bs-header" : ""}>
                      <ExpandableTable
                        title={unitTableData.barContent}
                        priority={4}
                        disableCollapse={listing.disableUnitsAccordion}
                      >
                        <StandardTable headers={unitsHeaders} data={unitTableData.unitsFormatted} />
                      </ExpandableTable>
                    </div>
                  )
                })}
                {AdditionalFees}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title={t("t.neighborhood")}
              subtitle={t("listings.sections.neighborhoodSubtitle")}
              priority={2}
            >
              <div className={styles["inline-collapse-padding"]}>
                <ListingMap
                  address={getGenericAddress(listing.listingsBuildingAddress)}
                  listingName={listing.name}
                />
              </div>
            </CollapsibleSection>

            {(listing.requiredDocuments || listing.programRules || listing.specialNotes) && (
              <CollapsibleSection
                title={t("listings.additionalInformation")}
                subtitle={t("listings.sections.additionalInformationSubtitle")}
                priority={2}
              >
                <div className={styles["inline-collapse-padding"]}>
                  <CardList cardContent={getAdditionalInformation(listing)} priority={3} />
                </div>
              </CollapsibleSection>
            )}
          </div>
        </div>
        {/* Right side bar */}
        <div className={styles["right-bar"]}>
          {DueDate}
          {ListingMainDetails}
          {ApplyBar}
        </div>
      </div>
      <PaperApplicationDialog
        showDialog={showDownloadModal}
        setShowDialog={setShowDownloadModal}
        register={register}
        paperApplications={paperApplications}
        paperApplicationUrl={paperApplicationURL}
        listingName={listing.name}
      />
    </article>
  )
}

import React, { useContext, useState } from "react"
import Markdown from "markdown-to-jsx"
import { useForm } from "react-hook-form"
import dayjs from "dayjs"
import ClockIcon from "@heroicons/react/24/solid/ClockIcon"
import {
  ApplicationMethodsTypeEnum,
  Jurisdiction,
  Listing,
  ListingEvent,
  ListingEventsTypeEnum,
  ListingsStatusEnum,
  MultiselectQuestionsApplicationSectionEnum,
  ReviewOrderTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import {
  AdditionalFees,
  Description,
  ExpandableText,
  GroupedTable,
  ImageCard,
  Contact,
  ListingDetails,
  ListingMap,
  EventSection,
  ReferralApplication,
  StandardTable,
  TableHeaders,
  QuantityRowSection,
  t,
  EventType,
  StandardTableData,
  ExpandableSection,
} from "@bloom-housing/ui-components"
import {
  cloudinaryPdfFromId,
  getOccupancyDescription,
  imageUrlFromListing,
  occupancyTable,
  getCurrencyRange,
  getPostmarkString,
  UnitTables,
  getSummariesTable,
  IMAGE_FALLBACK_URL,
  pdfUrlFromListingEvents,
  AuthContext,
} from "@bloom-housing/shared-helpers"
import { Card, HeadingGroup, Icon, Heading, Button, Tag } from "@bloom-housing/ui-seeds"
import { ErrorPage } from "../../pages/_error"
import { useGetApplicationStatusProps } from "../../lib/hooks"
import { downloadExternalPDF, getGenericAddress, oneLineAddress } from "../../lib/helpers"

import { CollapsibleSection } from "../../patterns/CollapsibleSection"
import { CardList, ContentCard } from "../../patterns/CardList"
import { OrderedSection } from "../../patterns/OrderedSection"
import { Address } from "../../patterns/Address"

import {
  getAddress,
  getAmiValues,
  getAvailabilityHeading,
  getDateString,
  getEvent,
  getFilteredMultiselectQuestions,
  getHasNonReferralMethods,
  getHmiData,
  getListingTags,
  getMethod,
  getOnlineApplicationURL,
  getPaperApplications,
  getReservedTitle,
  PaperApplicationDialog,
} from "./ListingDetailViewHelpers"

import styles from "./ListingDetailView.module.scss"

interface ListingProps {
  listing: Listing
  preview?: boolean
  jurisdiction?: Jurisdiction
}

const unitSummariesHeaders = {
  unitType: t("t.unitType"),
  minimumIncome: t("t.minimumIncome"),
  rent: t("t.rent"),
  availability: t("t.availability"),
}

const occupancyHeaders = {
  unitType: "t.unitType",
  occupancy: "t.occupancy",
}

export const ListingDetailView = (props: ListingProps) => {
  const { initialStateLoaded, profile } = useContext(AuthContext)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  let buildingSelectionCriteria
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
  const hmiHeaders = listing?.unitsSummarized?.hmi?.columns as TableHeaders
  const hmiData = getHmiData(listing)
  const preferences = getFilteredMultiselectQuestions(
    listing.listingMultiselectQuestions,
    MultiselectQuestionsApplicationSectionEnum.preferences
  )
  const programs = getFilteredMultiselectQuestions(
    listing.listingMultiselectQuestions,
    MultiselectQuestionsApplicationSectionEnum.programs
  )
  const redirectIfSignedOut = () =>
    process.env.showMandatedAccounts && initialStateLoaded && !profile
  const onlineApplicationUrl = redirectIfSignedOut()
    ? `/sign-in?redirectUrl=/applications/start/choose-language&listingId=${listing.id}`
    : getOnlineApplicationURL(listing.applicationMethods, listing.id, props.preview)

  const disableApplyButton = !props.preview && listing.status !== ListingsStatusEnum.active
  const occupancyDescription = getOccupancyDescription(listing)
  const occupancyData = occupancyTable(listing)
  const householdMaximumIncomeSubheader = listing?.units[0]?.bmrProgramChart
    ? t("listings.forIncomeCalculationsBMR")
    : t("listings.forIncomeCalculations")
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
  let openHouseEvents: EventType[] | null = null
  let publicLottery: ListingEvent | null = null
  let lotteryResults: ListingEvent | null = null
  if (Array.isArray(listing.listingEvents)) {
    listing.listingEvents.forEach((event) => {
      switch (event.type) {
        case ListingEventsTypeEnum.openHouse:
          if (!openHouseEvents) {
            openHouseEvents = []
          }
          openHouseEvents.push(getEvent(event))
          break
        case ListingEventsTypeEnum.publicLottery:
          publicLottery = event
          break
        case ListingEventsTypeEnum.lotteryResults:
          lotteryResults = event
          break
      }
    })
  }
  const listingTags = getListingTags(listing)
  const lotteryResultsPdfUrl = pdfUrlFromListingEvents(
    [lotteryResults],
    ListingEventsTypeEnum.lotteryResults,
    process.env.cloudinaryCloudName
  )
  let groupedUnits: StandardTableData = []
  if (amiValues.length == 1) {
    groupedUnits = getSummariesTable(
      listing.unitsSummarized.byUnitTypeAndRent,
      listing.reviewOrderType
    )
  } // else condition is handled inline below

  if (listing.listingsBuildingSelectionCriteriaFile) {
    buildingSelectionCriteria = (
      <p>
        <a
          href={cloudinaryPdfFromId(
            listing.listingsBuildingSelectionCriteriaFile.fileId,
            process.env.cloudinaryCloudName
          )}
          className={"text-blue-700"}
        >
          {t("listings.moreBuildingSelectionCriteria")}
        </a>
      </p>
    )
  } else if (listing.buildingSelectionCriteria) {
    buildingSelectionCriteria = (
      <p>
        <a href={listing.buildingSelectionCriteria} className={"text-blue-700"}>
          {t("listings.moreBuildingSelectionCriteria")}
        </a>
      </p>
    )
  }

  let lotterySection
  if (publicLottery && (!lotteryResults || (lotteryResults && !lotteryResults.url))) {
    lotterySection = publicLottery.startDate && (
      <EventSection
        headerText={t("listings.publicLottery.header")}
        sectionHeader={true}
        events={[getEvent(publicLottery)]}
      />
    )
    if (dayjs(publicLottery.startTime) < dayjs() && lotteryResults && !lotteryResults.url) {
      lotterySection = (
        <EventSection
          headerText={t("listings.lotteryResults.header")}
          sectionHeader={true}
          events={[
            getEvent(
              lotteryResults,
              lotteryResults.note || t("listings.lotteryResults.completeResultsWillBePosted")
            ),
          ]}
        />
      )
    }
  }

  // Sections ----------
  const DueDate = (
    <Card className={`${styles["muted-card"]} ${styles["application-date-card"]}`} spacing={"sm"}>
      <Card.Section>
        <div className={styles["application-date-content"]}>
          <Icon size={"md"} className={styles["primary-icon"]}>
            <ClockIcon />
          </Icon>
          {appStatusContent}
        </div>
        {/* todo test subcontent */}
        <div>{appStatusSubContent}</div>
      </Card.Section>
    </Card>
  )

  const ListingMainDetails = (
    <>
      {(listing.reservedCommunityTypes || listing.status !== ListingsStatusEnum.closed) && (
        <Card className={`${styles["muted-card"]} ${styles["listing-info-card"]}`}>
          {listing.reservedCommunityTypes && (
            <Card.Section divider="inset">
              <HeadingGroup
                heading={getReservedTitle(listing)}
                subheading={t(
                  `listings.reservedCommunityTypes.${listing.reservedCommunityTypes.name}`
                )}
                size={"lg"}
                className={styles["heading-group"]}
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
                subheading={getAvailabilityHeading(props.listing.reviewOrderType)}
                size={"lg"}
                className={styles["heading-group"]}
              />
            </Card.Section>
          )}
        </Card>
      )}
    </>
  )

  const LotteryResults = (
    <>
      {lotteryResultsPdfUrl && (
        <Card>
          <Card.Section>
            <HeadingGroup
              headingPriority={3}
              size={"lg"}
              className={styles["heading-group"]}
              heading={t("listings.lotteryResults.header")}
              subheading={
                lotteryResults?.startTime
                  ? dayjs(lotteryResults?.startTime).format("MMMM D, YYYY")
                  : null
              }
            />
            <Button href={lotteryResultsPdfUrl}>
              {t("listings.lotteryResults.downloadResults")}
            </Button>
          </Card.Section>
        </Card>
      )}
    </>
  )

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
    >
      {t("listings.apply.downloadApplication")}
    </Button>
  )

  const Apply = (
    <>
      {getHasNonReferralMethods(listing) &&
        !applicationsClosed &&
        listing.status !== ListingsStatusEnum.closed && (
          <Card>
            <Card.Section divider="flush" className={styles["card-section-background"]}>
              <Heading priority={3} size={"lg"} className={styles["card-heading"]}>
                {t("listings.apply.howToApply")}
              </Heading>
              {onlineApplicationUrl ? ApplyOnlineButton : DownloadApplicationButton}
            </Card.Section>
            {(hasPaperApplication || !!applicationPickUpAddress) && (
              <Card.Section divider="flush">
                {hasPaperApplication && onlineApplicationUrl && (
                  <>
                    <Heading priority={3} size={"lg"} className={styles["card-heading"]}>
                      {t("listings.apply.getAPaperApplication")}
                    </Heading>
                    {DownloadApplicationButton}
                  </>
                )}
                {applicationPickUpAddress && (
                  <div>
                    <Heading
                      size={"md"}
                      priority={4}
                      className={
                        hasPaperApplication && onlineApplicationUrl ? styles["sidebar-spacing"] : ""
                      }
                    >
                      {t("listings.apply.pickUpAnApplication")}
                    </Heading>
                    <Address address={applicationPickUpAddress} />
                    {listing.applicationPickUpAddressOfficeHours && (
                      <>
                        <Heading size={"sm"} priority={4} className={styles["sidebar-spacing"]}>
                          {t("leasingAgent.officeHours")}
                        </Heading>
                        <Markdown
                          className={styles["address-markdown"]}
                          children={listing.applicationPickUpAddressOfficeHours}
                          options={{ disableParsingRawHTML: true }}
                        />
                      </>
                    )}
                  </div>
                )}
                {applicationMailingAddress && (
                  <div>
                    <Heading size={"md"} priority={4} className={styles["sidebar-spacing"]}>
                      {t("listings.apply.submitAPaperApplication")}
                    </Heading>
                    <p>{listing.applicationOrganization}</p>
                    <Address address={applicationMailingAddress} />
                    {postmarkString && <p className={"text-label"}>{postmarkString}</p>}
                  </div>
                )}
                {applicationDropOffAddress && (
                  <div>
                    <Heading size={"md"} priority={4} className={styles["sidebar-spacing"]}>
                      {t("listings.apply.dropOffApplication")}
                    </Heading>
                    <Address address={applicationPickUpAddress} />
                    {listing.applicationDropOffAddressOfficeHours && (
                      <>
                        <Heading size={"sm"} priority={4} className={styles["sidebar-spacing"]}>
                          {t("leasingAgent.officeHours")}
                        </Heading>
                        <Markdown
                          className={styles["address-markdown"]}
                          children={listing.applicationDropOffAddressOfficeHours}
                          options={{ disableParsingRawHTML: true }}
                        />
                      </>
                    )}
                  </div>
                )}
              </Card.Section>
            )}
          </Card>
        )}
    </>
  )

  const getWaitlist = () => {
    const waitlistRow = [
      {
        text: t("listings.waitlist.openSlots"),
        amount: listing.waitlistOpenSpots,
        emphasized: true,
      },
    ]
    const unitRow = [
      {
        text: listing.unitsAvailable === 1 ? t("listings.vacantUnit") : t("listings.vacantUnits"),
        amount: listing.unitsAvailable,
        emphasized: true,
      },
    ]
    const description = () => {
      switch (listing.reviewOrderType) {
        case ReviewOrderTypeEnum.waitlist:
          return t("listings.waitlist.submitForWaitlist")
        case ReviewOrderTypeEnum.firstComeFirstServe:
          return t("listings.eligibleApplicants.FCFS")
        default:
          return t("listings.availableUnitsDescription")
      }
    }

    return (
      <QuantityRowSection
        quantityRows={
          listing.reviewOrderType === ReviewOrderTypeEnum.waitlist ? waitlistRow : unitRow
        }
        strings={{
          sectionTitle:
            listing.reviewOrderType === ReviewOrderTypeEnum.waitlist
              ? t("listings.waitlist.isOpen")
              : t("listings.vacantUnitsAvailable"),
          description: description(),
        }}
      />
    )
  }

  const getAccessibilityFeatures = () => {
    let featuresExist = false
    const features = Object.keys(listing?.listingFeatures ?? {}).map((feature, index) => {
      if (listing?.listingFeatures[feature]) {
        featuresExist = true
        return <li key={index}>{t(`eligibility.accessibility.${feature}`)}</li>
      }
    })
    return featuresExist ? <ul>{features}</ul> : null
  }

  const accessibilityFeatures = getAccessibilityFeatures()

  const getUtilitiesIncluded = () => {
    let utilitiesExist = false
    const utilitiesIncluded = Object.keys(listing?.listingUtilities ?? {}).reduce(
      (acc, current, index) => {
        if (listing?.listingUtilities[current]) {
          utilitiesExist = true
          acc.push(
            <li key={index} className={"list-disc list-inside"}>
              {t(`listings.utilities.${current}`)}
            </li>
          )
        }
        return acc
      },
      []
    )
    return !utilitiesExist ? null : (
      <div>
        <div className="text-base">{t("listings.sections.utilities")}</div>
        {utilitiesIncluded.length <= 4 ? (
          <ul>{utilitiesIncluded}</ul>
        ) : (
          <div className="flex">
            <ul className="float-left w-1/2">{utilitiesIncluded.slice(0, 4)}</ul>
            <ul className="float-right w-1/2">{utilitiesIncluded.slice(4)}</ul>
          </div>
        )}
      </div>
    )
  }

  const getFooterContent = () => {
    const footerContent: (string | React.ReactNode)[] = []
    if (props.jurisdiction.enableUtilitiesIncluded) {
      const utilitiesDisplay = getUtilitiesIncluded()
      if (utilitiesDisplay) footerContent.push(utilitiesDisplay)
    }
    if (listing?.costsNotIncluded) footerContent.push(listing.costsNotIncluded)
    return footerContent
  }

  return (
    <article
      className={`flex flex-wrap relative max-w-5xl m-auto mt-4 ${styles["listing-detail-view"]}`}
    >
      <header className={styles["image-card"]}>
        <ImageCard
          images={imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize)).map(
            (imageUrl: string) => {
              return {
                url: imageUrl,
              }
            }
          )}
          description={listing.name}
          moreImagesLabel={t("listings.moreImagesLabel")}
          moreImagesDescription={t("listings.moreImagesAltDescription", {
            listingName: listing.name,
          })}
          modalCloseLabel={t("t.backToListing")}
          modalCloseInContent
          fallbackImageUrl={IMAGE_FALLBACK_URL}
        />
        <div className={styles["listing-name-container"]}>
          <Heading priority={1} size={"xl"} className={styles["listing-heading"]}>
            {listing.name}
          </Heading>
          <div>{oneLineAddress(listing.listingsBuildingAddress)}</div>
          <p>
            <a href={googleMapsHref} target="_blank" aria-label="Opens in new window">
              {t("t.viewOnMap")}
            </a>
          </p>
          {listingTags?.length > 0 && (
            <div className={styles["listing-tags"]}>
              {listingTags.map((tag) => {
                return <Tag variant={tag.variant}>{tag.title}</Tag>
              })}
            </div>
          )}

          <p>{listing.developer}</p>
        </div>
      </header>

      <div className="w-full md:w-2/3 md:mt-6 md:pr-6">
        <div className={"mx-3 md:mx-0"}>
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
                  <h2 className="mt-4 mb-2">
                    {t("listings.percentAMIUnit", { percent: percent })}
                  </h2>
                  <GroupedTable
                    headers={unitSummariesHeaders}
                    data={[{ data: groupedUnits }]}
                    responsiveCollapse={true}
                  />
                </React.Fragment>
              )
            })}
          {amiValues.length == 1 && (
            <GroupedTable
              headers={unitSummariesHeaders}
              data={[{ data: groupedUnits }]}
              responsiveCollapse={true}
            />
          )}
        </div>
      </div>
      <div>
        <aside className="w-full static md:absolute md:right-0 md:w-1/3 md:top-0 sm:w-2/3 md:ml-2 h-full bg-white">
          <div>
            {DueDate}
            {ListingMainDetails}
            {LotteryResults}
            {Apply}

            {/* {!applicationsClosed && getWaitlist()} */}

            {listing?.referralApplication && (
              <ReferralApplication
                phoneNumber={
                  listing.referralApplication.phoneNumber ||
                  t("application.referralApplication.phoneNumber")
                }
                description={
                  listing.referralApplication.externalReference ||
                  t("application.referralApplication.instructions")
                }
                strings={{
                  title: t("application.referralApplication.furtherInformation"),
                }}
              />
            )}
          </div>

          {openHouseEvents && (
            <EventSection
              events={openHouseEvents}
              headerText={t("listings.openHouseEvent.header")}
            />
          )}
          {lotterySection}
          <ExpandableSection
            content={listing.whatToExpect}
            strings={{
              title: t("whatToExpect.label"),
              readMore: t("t.readMore"),
              readLess: t("t.readLess"),
            }}
          />
          {
            <Contact
              sectionTitle={t("leasingAgent.contact")}
              additionalInformation={
                listing.leasingAgentOfficeHours
                  ? [
                      {
                        title: t("leasingAgent.officeHours"),
                        content: listing.leasingAgentOfficeHours,
                      },
                    ]
                  : undefined
              }
              contactAddress={listing.listingsLeasingAgentAddress}
              contactEmail={listing.leasingAgentEmail}
              contactName={listing.leasingAgentName}
              contactPhoneNumber={`${t("t.call")} ${listing.leasingAgentPhone}`}
              contactPhoneNumberNote={t("leasingAgent.dueToHighCallVolume")}
              contactTitle={listing.leasingAgentTitle}
              strings={{
                email: t("t.email"),
                website: t("t.website"),
                getDirections: t("t.getDirections"),
              }}
            />
          }
        </aside>
      </div>

      <ListingDetails>
        <CollapsibleSection
          title={t("listings.sections.eligibilityTitle")}
          subtitle={t("listings.sections.eligibilitySubtitle")}
          priority={3}
        >
          <ul>
            {listing.reservedCommunityTypes && (
              <>
                <OrderedSection order={1} title={getReservedTitle(listing)}>
                  <CardList
                    cardContent={[
                      {
                        title: t(
                          `listings.reservedCommunityTypes.${listing.reservedCommunityTypes.name}`
                        ),
                        description: listing.reservedCommunityDescription,
                      },
                    ]}
                  />
                </OrderedSection>
                <hr />
              </>
            )}

            <OrderedSection
              order={2}
              title={t("listings.householdMaximumIncome")}
              subtitle={householdMaximumIncomeSubheader}
            >
              <StandardTable
                headers={hmiHeaders}
                data={hmiData}
                responsiveCollapse={true}
                translateData={true}
              />
            </OrderedSection>

            <hr />

            <OrderedSection order={3} title={t("t.occupancy")} subtitle={occupancyDescription}>
              <StandardTable
                headers={occupancyHeaders}
                data={occupancyData}
                responsiveCollapse={false}
              />
            </OrderedSection>

            <hr />

            {listing.rentalAssistance && (
              <>
                <OrderedSection
                  order={4}
                  title={t("listings.sections.rentalAssistanceTitle")}
                  subtitle={listing.rentalAssistance}
                />
                <hr />
              </>
            )}

            {programs?.length > 0 && (
              <>
                <OrderedSection
                  order={5}
                  title={t("listings.sections.housingProgramsTitle")}
                  subtitle={t("listings.sections.housingProgramsSubtitle")}
                  note={t("listings.remainingUnitsAfterPrograms")}
                >
                  <CardList
                    cardContent={programs.map((question) => {
                      return {
                        title: question.multiselectQuestions.text,
                        description: question.multiselectQuestions.description,
                      }
                    })}
                  />
                </OrderedSection>
                <hr />
              </>
            )}

            {preferences?.length > 0 && (
              <>
                <OrderedSection
                  order={6}
                  title={t("listings.sections.housingPreferencesTitle")}
                  subtitle={t("listings.sections.housingPreferencesSubtitle")}
                  note={t("listings.remainingUnitsAfterPreferenceConsideration")}
                >
                  <CardList
                    cardContent={preferences.map((question) => {
                      return {
                        title: question.multiselectQuestions.text,
                        description: question.multiselectQuestions.description,
                      }
                    })}
                  />
                </OrderedSection>
                <hr />
              </>
            )}

            {(listing.creditHistory ||
              listing.rentalHistory ||
              listing.criminalBackground ||
              buildingSelectionCriteria) && (
              <OrderedSection
                order={7}
                title={t("listings.sections.additionalEligibilityTitle")}
                subtitle={t("listings.sections.additionalEligibilitySubtitle")}
              >
                <>
                  {listing.creditHistory && (
                    <ContentCard title={t("listings.creditHistory")}>
                      <ExpandableText
                        className="text-xs text-gray-700"
                        buttonClassName="ml-4"
                        markdownProps={{ disableParsingRawHTML: true }}
                        strings={{
                          readMore: t("t.more"),
                          readLess: t("t.less"),
                        }}
                      >
                        {listing.creditHistory}
                      </ExpandableText>
                    </ContentCard>
                  )}
                  {listing.rentalHistory && (
                    <ContentCard title={t("listings.rentalHistory")}>
                      <ExpandableText
                        className="text-xs text-gray-700"
                        buttonClassName="ml-4"
                        markdownProps={{ disableParsingRawHTML: true }}
                        strings={{
                          readMore: t("t.more"),
                          readLess: t("t.less"),
                        }}
                      >
                        {listing.rentalHistory}
                      </ExpandableText>
                    </ContentCard>
                  )}
                  {listing.criminalBackground && (
                    <ContentCard title={t("listings.criminalBackground")}>
                      <ExpandableText
                        className="text-xs text-gray-700"
                        buttonClassName="ml-4"
                        markdownProps={{ disableParsingRawHTML: true }}
                        strings={{
                          readMore: t("t.more"),
                          readLess: t("t.less"),
                        }}
                      >
                        {listing.criminalBackground}
                      </ExpandableText>
                    </ContentCard>
                  )}
                  {buildingSelectionCriteria}
                </>
              </OrderedSection>
            )}
          </ul>
        </CollapsibleSection>

        <CollapsibleSection
          title={t("listings.sections.featuresTitle")}
          subtitle={t("listings.sections.featuresSubtitle")}
          priority={3}
        >
          <div className="listing-detail-panel">
            <dl className="column-definition-list">
              {listing.neighborhood && (
                <Description term={t("t.neighborhood")} description={listing.neighborhood} />
              )}
              {listing.yearBuilt && (
                <Description term={t("t.built")} description={listing.yearBuilt} />
              )}
              {listing.smokingPolicy && (
                <Description term={t("t.smokingPolicy")} description={listing.smokingPolicy} />
              )}
              {listing.petPolicy && (
                <Description term={t("t.petsPolicy")} description={listing.petPolicy} />
              )}
              {listing.amenities && (
                <Description term={t("t.propertyAmenities")} description={listing.amenities} />
              )}
              {listing.unitAmenities && (
                <Description term={t("t.unitAmenities")} description={listing.unitAmenities} />
              )}
              {listing.servicesOffered && (
                <Description term={t("t.servicesOffered")} description={listing.servicesOffered} />
              )}
              {accessibilityFeatures && props.jurisdiction?.enableAccessibilityFeatures && (
                <Description term={t("t.accessibility")} description={accessibilityFeatures} />
              )}
              {listing.accessibility && (
                <Description
                  term={t("t.additionalAccessibility")}
                  description={listing.accessibility}
                />
              )}
              <Description
                term={t("t.unitFeatures")}
                description={
                  <UnitTables
                    units={listing.units}
                    unitSummaries={listing?.unitsSummarized?.byUnitType}
                    disableAccordion={listing.disableUnitsAccordion}
                  />
                }
              />
            </dl>
            <AdditionalFees
              deposit={getCurrencyRange(parseInt(listing.depositMin), parseInt(listing.depositMax))}
              applicationFee={listing.applicationFee ? `$${listing.applicationFee}` : undefined}
              footerContent={getFooterContent()}
              strings={{
                sectionHeader: t("listings.sections.additionalFees"),
                applicationFee: t("listings.applicationFee"),
                deposit: t("t.deposit"),
                applicationFeeSubtext: [
                  t("listings.applicationPerApplicantAgeDescription"),
                  t("listings.applicationFeeDueAt"),
                ],
                depositSubtext: [listing.depositHelperText],
              }}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title={t("t.neighborhood")}
          subtitle={t("listings.sections.neighborhoodSubtitle")}
          priority={3}
        >
          <ListingMap
            address={getGenericAddress(listing.listingsBuildingAddress)}
            listingName={listing.name}
          />
        </CollapsibleSection>

        {(listing.requiredDocuments || listing.programRules || listing.specialNotes) && (
          <CollapsibleSection
            title={t("listings.additionalInformation")}
            subtitle={t("listings.sections.additionalInformationSubtitle")}
            priority={3}
          >
            {listing.requiredDocuments && (
              <ContentCard title={t("listings.requiredDocuments")}>
                <Markdown
                  children={listing.requiredDocuments}
                  options={{ disableParsingRawHTML: true }}
                />
              </ContentCard>
            )}
            {listing.programRules && (
              <ContentCard title={t("listings.importantProgramRules")}>
                <Markdown
                  children={listing.programRules}
                  options={{ disableParsingRawHTML: true }}
                />
              </ContentCard>
            )}
            {listing.specialNotes && (
              <ContentCard title={t("listings.specialNotes")}>
                <Markdown
                  children={listing.specialNotes}
                  options={{ disableParsingRawHTML: true }}
                />
              </ContentCard>
            )}
          </CollapsibleSection>
        )}
      </ListingDetails>
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

import React, { useContext } from "react"
import ReactDOMServer from "react-dom/server"
import Markdown from "markdown-to-jsx"
import {
  AdditionalFees,
  ApplicationStatus,
  Description,
  ExpandableText,
  GroupedTable,
  Heading,
  ImageCard,
  Contact,
  ListingDetails,
  ListingMap,
  OneLineAddress,
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
  getTimeRangeString,
  getCurrencyRange,
  getPostmarkString,
  UnitTables,
  getSummariesTable,
  IMAGE_FALLBACK_URL,
  pdfUrlFromListingEvents,
  AuthContext,
} from "@bloom-housing/shared-helpers"
import { Card, Heading as SeedsHeading } from "@bloom-housing/ui-seeds"
import dayjs from "dayjs"
import { ErrorPage } from "../../pages/_error"
import { useGetApplicationStatusProps } from "../../lib/hooks"
import { getGenericAddress, openInFuture } from "../../lib/helpers"
import { GetApplication } from "../listing/GetApplication"
import { SubmitApplication } from "../listing/SubmitApplication"
import {
  ApplicationAddressTypeEnum,
  ApplicationMethod,
  ApplicationMethodsTypeEnum,
  Jurisdiction,
  Listing,
  ListingEvent,
  ListingEventCreate,
  ListingEventsTypeEnum,
  ListingMultiselectQuestion,
  ListingsStatusEnum,
  MultiselectQuestionsApplicationSectionEnum,
  ReviewOrderTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { DownloadLotteryResults } from "../listing/DownloadLotteryResults"
import {
  getFilteredMultiselectQuestions,
  getMultiselectQuestionData,
} from "./ListingDetailViewHelpers"

import { CollapsibleSection } from "../../patterns/CollapsibleSection"
import { CardList, ContentCard } from "../../patterns/CardList"
import { OrderedSection } from "../../patterns/OrderedSection"

import styles from "./ListingDetailView.module.scss"

interface ListingProps {
  listing: Listing
  preview?: boolean
  jurisdiction?: Jurisdiction
}

export const ListingDetailView = (props: ListingProps) => {
  const { initialStateLoaded, profile } = useContext(AuthContext)
  let buildingSelectionCriteria, preferencesSection, programsSection
  const { listing } = props
  const { content: appStatusContent, subContent: appStatusSubContent } =
    useGetApplicationStatusProps(listing)

  const appOpenInFuture = openInFuture(listing)
  const hasNonReferralMethods = listing?.applicationMethods
    ? listing.applicationMethods.some(
        (method) => method.type !== ApplicationMethodsTypeEnum.Referral
      )
    : false

  if (!listing) {
    return <ErrorPage />
  }

  const preferences = getFilteredMultiselectQuestions(
    listing.listingMultiselectQuestions,
    MultiselectQuestionsApplicationSectionEnum.preferences
  )

  const programs = getFilteredMultiselectQuestions(
    listing.listingMultiselectQuestions,
    MultiselectQuestionsApplicationSectionEnum.programs
  )

  const oneLineAddress = (
    <OneLineAddress address={getGenericAddress(listing.listingsBuildingAddress)} />
  )

  const googleMapsHref =
    "https://www.google.com/maps/place/" + ReactDOMServer.renderToStaticMarkup(oneLineAddress)

  const unitSummariesHeaders = {
    unitType: t("t.unitType"),
    minimumIncome: t("t.minimumIncome"),
    rent: t("t.rent"),
    availability: t("t.availability"),
  }

  const amiValues = listing?.unitsSummarized?.amiPercentages
    ? listing.unitsSummarized.amiPercentages
        .map((percent) => {
          const percentInt = parseInt(percent, 10)
          return percentInt
        })
        .sort(function (a, b) {
          return a - b
        })
    : []

  const hmiHeaders = listing?.unitsSummarized?.hmi?.columns as TableHeaders

  const hmiData: StandardTableData = listing?.unitsSummarized?.hmi?.rows.map((row) => {
    const amiRows = Object.keys(row).reduce((acc, rowContent) => {
      acc[rowContent] = { content: row[rowContent] }
      return acc
    }, {})
    return {
      ...amiRows,
      sizeColumn: {
        content: (
          <strong>
            {listing.units[0].bmrProgramChart ? t(row["sizeColumn"]) : row["sizeColumn"]}
          </strong>
        ),
      },
    }
  })

  let groupedUnits: StandardTableData = []

  if (amiValues.length == 1) {
    groupedUnits = getSummariesTable(
      listing.unitsSummarized.byUnitTypeAndRent,
      listing.reviewOrderType
    )
  } // else condition is handled inline below

  const occupancyDescription = getOccupancyDescription(listing)
  const occupancyHeaders = {
    unitType: "t.unitType",
    occupancy: "t.occupancy",
  }
  const occupancyData = occupancyTable(listing)

  const householdMaximumIncomeSubheader = listing?.units[0]?.bmrProgramChart
    ? t("listings.forIncomeCalculationsBMR")
    : t("listings.forIncomeCalculations")

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

  const getEvent = (event: ListingEventCreate, note?: string | React.ReactNode): EventType => {
    return {
      timeString: getTimeRangeString(event.startTime, event.endTime),
      dateString: dayjs(event.startDate).format("MMMM D, YYYY"),
      linkURL: event.url,
      linkText: event.label || t("listings.openHouseEvent.seeVideo"),
      note: note || event.note,
    }
  }

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

  const getReservedTitle = () => {
    if (
      listing.reservedCommunityTypes.name === "senior55" ||
      listing.reservedCommunityTypes.name === "senior62" ||
      listing.reservedCommunityTypes.name === "senior"
    ) {
      return t("listings.reservedCommunitySeniorTitle")
    } else return t("listings.reservedCommunityTitleDefault")
  }

  // TODO: Move the below methods into our shared helper library when setup
  const hasMethod = (applicationMethods: ApplicationMethod[], type: ApplicationMethodsTypeEnum) => {
    return applicationMethods.some((method) => method.type == type)
  }

  const getMethod = (applicationMethods: ApplicationMethod[], type: ApplicationMethodsTypeEnum) => {
    return applicationMethods.find((method) => method.type == type)
  }

  type AddressLocation = "dropOff" | "pickUp" | "mailIn"

  const addressMap = {
    dropOff: listing.listingsApplicationDropOffAddress,
    pickUp: listing.listingsApplicationPickUpAddress,
    mailIn: listing.listingsApplicationMailingAddress,
  }

  const getAddress = (
    addressType: ApplicationAddressTypeEnum | undefined,
    location: AddressLocation
  ) => {
    if (addressType === ApplicationAddressTypeEnum.leasingAgent) {
      return listing.listingsLeasingAgentAddress
    }
    return addressMap[location]
  }

  const getOnlineApplicationURL = () => {
    let onlineApplicationURL
    if (hasMethod(listing.applicationMethods, ApplicationMethodsTypeEnum.Internal)) {
      onlineApplicationURL = `/applications/start/choose-language?listingId=${listing.id}`
      onlineApplicationURL += `${props.preview ? "&preview=true" : ""}`
    } else if (hasMethod(listing.applicationMethods, ApplicationMethodsTypeEnum.ExternalLink)) {
      onlineApplicationURL =
        getMethod(listing.applicationMethods, ApplicationMethodsTypeEnum.ExternalLink)
          ?.externalReference || ""
    }
    return onlineApplicationURL
  }

  const getPaperApplications = () => {
    return (
      getMethod(listing.applicationMethods, ApplicationMethodsTypeEnum.FileDownload)
        ?.paperApplications.sort((a, b) => {
          // Ensure English is always first
          if (a.language == "en") return -1
          if (b.language == "en") return 1

          // Otherwise, do regular string sort
          const aLang = t(`languages.${a.language}`)
          const bLang = t(`languages.${b.language}`)
          if (aLang < bLang) return -1
          if (aLang > bLang) return 1
          return 0
        })
        .map((paperApp) => {
          return {
            fileURL: paperApp?.assets?.fileId?.includes("https")
              ? paperApp?.assets?.fileId
              : cloudinaryPdfFromId(
                  paperApp?.assets?.fileId || "",
                  process.env.cloudinaryCloudName || ""
                ),
            languageString: t(`languages.${paperApp.language}`),
          }
        }) ?? null
    )
  }

  // Move the above methods into our shared helper library when setup

  const getDateString = (date: Date, format: string) => {
    return date ? dayjs(date).format(format) : null
  }

  const redirectIfSignedOut = () =>
    process.env.showMandatedAccounts && initialStateLoaded && !profile

  const submissionAddressExists =
    listing.listingsApplicationMailingAddress ||
    listing.applicationMailingAddressType === ApplicationAddressTypeEnum.leasingAgent ||
    listing.listingsApplicationDropOffAddress ||
    listing.applicationDropOffAddressType === ApplicationAddressTypeEnum.leasingAgent

  const applySidebar = () => (
    <>
      <GetApplication
        onlineApplicationURL={
          redirectIfSignedOut()
            ? `/sign-in?redirectUrl=/applications/start/choose-language&listingId=${listing.id}`
            : getOnlineApplicationURL()
        }
        applicationsOpen={!appOpenInFuture}
        applicationsOpenDate={getDateString(listing.applicationOpenDate, "MMMM D, YYYY")}
        paperApplications={getPaperApplications()}
        paperMethod={
          !!getMethod(listing.applicationMethods, ApplicationMethodsTypeEnum.FileDownload)
        }
        postmarkedApplicationsReceivedByDate={getDateString(
          listing.postmarkedApplicationsReceivedByDate,
          `MMM DD, YYYY [${t("t.at")}] hh:mm A`
        )}
        applicationPickUpAddressOfficeHours={listing.applicationPickUpAddressOfficeHours}
        applicationPickUpAddress={getAddress(listing.applicationPickUpAddressType, "pickUp")}
        preview={props.preview}
        listingName={listing.name}
        listingId={listing.id}
        listingStatus={listing.status}
      />
      {listing.status !== ListingsStatusEnum.closed && submissionAddressExists && (
        <SubmitApplication
          applicationMailingAddress={getAddress(listing.applicationMailingAddressType, "mailIn")}
          applicationDropOffAddress={getAddress(listing.applicationDropOffAddressType, "dropOff")}
          applicationDropOffAddressOfficeHours={listing.applicationDropOffAddressOfficeHours}
          applicationOrganization={listing.applicationOrganization}
          strings={{
            postmark: getPostmarkString(
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
            ),
            mailHeader: t("listings.apply.sendByUsMail"),
            dropOffHeader: t("listings.apply.dropOffApplication"),
            sectionHeader: t("listings.apply.submitAPaperApplication"),
            officeHoursHeader: t("leasingAgent.officeHours"),
            mapString: t("t.getDirections"),
          }}
        />
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

  const applicationsClosed = dayjs() > dayjs(listing.applicationDueDate)

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
    <article className="flex flex-wrap relative max-w-5xl m-auto">
      <header className="image-card--leader">
        <ImageCard
          images={imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize)).map(
            (imageUrl: string) => {
              return {
                url: imageUrl,
              }
            }
          )}
          tags={
            listing.reservedCommunityTypes
              ? [
                  {
                    text: t(
                      `listings.reservedCommunityTypes.${props.listing.reservedCommunityTypes.name}`
                    ),
                  },
                ]
              : undefined
          }
          description={listing.name}
          moreImagesLabel={t("listings.moreImagesLabel")}
          moreImagesDescription={t("listings.moreImagesAltDescription", {
            listingName: listing.name,
          })}
          modalCloseLabel={t("t.backToListing")}
          modalCloseInContent
          fallbackImageUrl={IMAGE_FALLBACK_URL}
        />
        <div className="py-3 mx-3 mt-4 flex flex-col items-center md:items-start text-center md:text-left">
          <Heading priority={1} styleType={"largePrimary"} className={"text-black"}>
            {listing.name}
          </Heading>
          <Heading priority={2} styleType={"mediumNormal"} className={"mb-1"}>
            {oneLineAddress}
          </Heading>
          <p className="text-gray-750 text-base mb-1">{listing.developer}</p>
          <p className="text-base">
            <a href={googleMapsHref} target="_blank" aria-label="Opens in new window">
              {t("t.viewOnMap")}
            </a>
          </p>
        </div>
      </header>

      <div className="w-full md:w-2/3 md:mt-6 md:mb-6 md:px-3 md:pr-8">
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
      <div className="w-full md:w-2/3 md:mt-3 md:hidden md:mx-3 border-gray-400 border-b">
        <ApplicationStatus content={appStatusContent} subContent={appStatusSubContent} />
        <div className="mx-4">
          <DownloadLotteryResults
            resultsDate={dayjs(lotteryResults?.startTime).format("MMMM D, YYYY")}
            pdfURL={pdfUrlFromListingEvents(
              [lotteryResults],
              ListingEventsTypeEnum.lotteryResults,
              process.env.cloudinaryCloudName
            )}
            buttonText={t("listings.lotteryResults.downloadResults")}
          />
          {!applicationsClosed && getWaitlist()}
          {hasNonReferralMethods &&
          !applicationsClosed &&
          listing.status !== ListingsStatusEnum.closed ? (
            <>{applySidebar()}</>
          ) : (
            <></>
          )}
        </div>
      </div>

      <div>
        <aside className="w-full static md:absolute md:right-0 md:w-1/3 md:top-0 sm:w-2/3 md:ml-2 h-full md:border border-gray-400 bg-white">
          <div className="hidden md:block">
            <ApplicationStatus content={appStatusContent} subContent={appStatusSubContent} />
            <DownloadLotteryResults
              resultsDate={dayjs(lotteryResults?.startTime).format("MMMM D, YYYY")}
              pdfURL={pdfUrlFromListingEvents(
                [lotteryResults],
                ListingEventsTypeEnum.lotteryResults,
                process.env.cloudinaryCloudName
              )}
              buttonText={t("listings.lotteryResults.downloadResults")}
            />
            {openHouseEvents && (
              <EventSection
                events={openHouseEvents}
                headerText={t("listings.openHouseEvent.header")}
              />
            )}
            {!applicationsClosed && getWaitlist()}
            {hasNonReferralMethods &&
              !applicationsClosed &&
              listing.status !== ListingsStatusEnum.closed &&
              applySidebar()}
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
            <div className="mb-2 md:hidden">
              <EventSection
                events={openHouseEvents}
                headerText={t("listings.openHouseEvent.header")}
              />
            </div>
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
          {!appOpenInFuture && (
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
          )}
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
                <OrderedSection order={1} title={getReservedTitle()}>
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
    </article>
  )
}

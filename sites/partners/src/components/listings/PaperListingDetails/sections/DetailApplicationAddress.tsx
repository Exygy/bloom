import React, { useContext } from "react"
import { t } from "@bloom-housing/ui-components"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { getDetailFieldString, getDetailFieldTime, getDetailAddress } from "./helpers"
import dayjs from "dayjs"
import SectionWithGrid from "../../../shared/SectionWithGrid"

const DetailApplicationAddress = () => {
  const listing = useContext(ListingContext)

  const postMarkDateFormat = (date: Date) => {
    return date ? dayjs(new Date(date)).format("MM/DD/YYYY") : t("t.none")
  }

  return (
    <SectionWithGrid heading={t("listings.sections.applicationAddressTitle")} inset>
      <Grid.Row columns={3}>
        <FieldValue
          id="applicationMailingSection"
          label={t("listings.applicationAddress.mailApplication")}
        >
          {listing.listingsApplicationMailingAddress || listing.applicationMailingAddressType
            ? t("t.yes")
            : t("t.no")}
        </FieldValue>
        {listing.applicationMailingAddressType && (
          <FieldValue
            id="applicationMailingAddressType"
            className="seeds-grid-span-2"
            label={t("listings.applicationAddress.mailApplicationType")}
          >
            {t("listings.leasingAgentAddress")}
          </FieldValue>
        )}
      </Grid.Row>

      {listing.listingsApplicationMailingAddress &&
        getDetailAddress(
          listing.listingsApplicationMailingAddress,
          "applicationMailingAddress",
          t("application.contact.mailingAddress")
        )}

      <hr />

      <Grid.Row columns={3}>
        <FieldValue id="applicationPickupQuestion" label={t("listings.applicationPickupQuestion")}>
          {listing.listingsApplicationPickUpAddress || listing.applicationPickUpAddressType
            ? t("t.yes")
            : t("t.no")}
        </FieldValue>
        {listing.applicationPickUpAddressType && (
          <FieldValue
            id="applicationPickUpAddressType"
            className="seeds-grid-span-2"
            label={t("listings.wherePickupQuestion")}
          >
            {t("listings.leasingAgentAddress")}
          </FieldValue>
        )}
      </Grid.Row>

      {listing.listingsApplicationPickUpAddress && (
        <>
          {getDetailAddress(
            listing.listingsApplicationPickUpAddress,
            "applicationPickUpAddress",
            t("listings.pickupAddress")
          )}
          <Grid.Row columns={3}>
            <FieldValue
              id="applicationPickUpAddressOfficeHours"
              className="seeds-grid-span-2"
              label={t("leasingAgent.officeHours")}
            >
              {getDetailFieldString(listing.applicationPickUpAddressOfficeHours)}
            </FieldValue>
          </Grid.Row>
        </>
      )}

      <hr />

      <Grid.Row columns={3}>
        <FieldValue
          id="applicationDropOffQuestion"
          label={t("listings.applicationDropOffQuestion")}
        >
          {listing.listingsApplicationDropOffAddress || listing.applicationDropOffAddressType
            ? t("t.yes")
            : t("t.no")}
        </FieldValue>
        {listing.applicationDropOffAddressType && (
          <FieldValue
            id="applicationDropOffAddressType"
            className="seeds-grid-span-2"
            label={t("listings.whereDropOffQuestion")}
          >
            {t("listings.leasingAgentAddress")}
          </FieldValue>
        )}
      </Grid.Row>

      {listing.listingsApplicationDropOffAddress && (
        <>
          {getDetailAddress(
            listing.listingsApplicationDropOffAddress,
            "applicationDropOffAddress",
            t("listings.dropOffAddress")
          )}
          <Grid.Row columns={3}>
            <FieldValue
              id="applicationDropOffAddressOfficeHours"
              className="seeds-grid-span-2"
              label={t("leasingAgent.officeHours")}
            >
              {getDetailFieldString(listing.applicationDropOffAddressOfficeHours)}
            </FieldValue>
          </Grid.Row>
        </>
      )}

      <hr />

      <Grid.Row>
        <FieldValue
          id="postmarksConsideredQuestion"
          label={t("listings.postmarksConsideredQuestion")}
        >
          {listing.postmarkedApplicationsReceivedByDate ? t("t.yes") : t("t.no")}
        </FieldValue>
      </Grid.Row>

      {listing.postmarkedApplicationsReceivedByDate && (
        <Grid.Row columns={2}>
          <FieldValue
            id="postmarkedApplicationsReceivedByDate"
            label={t("listings.receivedByDate")}
            testId={"postmark-date"}
          >
            {postMarkDateFormat(listing.postmarkedApplicationsReceivedByDate)}
          </FieldValue>

          <FieldValue
            id="postmarkedApplicationsReceivedByDateTime"
            label={t("listings.receivedByTime")}
            testId={"postmark-time"}
          >
            {getDetailFieldTime(listing.postmarkedApplicationsReceivedByDate)}
          </FieldValue>
        </Grid.Row>
      )}

      <Grid.Row>
        <FieldValue
          id="additionalApplicationSubmissionNotes"
          label={t("listings.additionalApplicationSubmissionNotes")}
        >
          {getDetailFieldString(listing.additionalApplicationSubmissionNotes)}
        </FieldValue>
      </Grid.Row>
    </SectionWithGrid>
  )
}

export default DetailApplicationAddress

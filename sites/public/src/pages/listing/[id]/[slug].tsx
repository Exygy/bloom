import React, { useEffect, useContext } from "react"
import Head from "next/head"
import axios from "axios"
import { t } from "@bloom-housing/ui-components"
import {
  imageUrlFromListing,
  ListingDetail,
  pushGtmEvent,
  AuthContext,
} from "@bloom-housing/shared-helpers"
import { UserStatus } from "../../../lib/constants"
import Layout from "../../../layouts/application"
import { ListingView } from "../../../components/listing/ListingView"
import { MetaTags } from "../../../components/shared/MetaTags"
import { ErrorPage } from "../../_error"
import dayjs from "dayjs"
import { fetchJurisdictionByName } from "../../../lib/hooks"
import { Jurisdiction, Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ListingDetailView } from "../../../components/new_listing/ListingDetailView"

interface ListingProps {
  listing: Listing
  jurisdiction: Jurisdiction
}

export default function ListingPage(props: ListingProps) {
  const { listing } = props

  const pageTitle = `${listing.name} - ${t("nav.siteTitle")}`
  const { profile } = useContext(AuthContext)

  useEffect(() => {
    if (!listing.id) return
    pushGtmEvent<ListingDetail>({
      event: "pageView",
      pageTitle: `${listing.name} - Housing Portal`,
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
      listingStartDate: dayjs(listing.applicationOpenDate).format("YYYY-MM-DD"),
      listingStatus: listing.status,
      listingType: listing.reviewOrderType,
      listingID: listing.id,
      applicationDueDate: dayjs(listing.applicationDueDate).format("YYYY-MM-DD"),
      digitalApplication: listing.digitalApplication,
      paperApplication: listing.paperApplication,
    })
  }, [
    listing.applicationDueDate,
    listing.applicationOpenDate,
    listing.digitalApplication,
    listing.id,
    listing.name,
    listing.paperApplication,
    listing.reviewOrderType,
    listing.status,
    profile,
  ])

  if (!listing) {
    return <ErrorPage />
  }

  const metaDescription = t("pageDescription.listing", {
    regionName: t("region.name"),
    listingName: listing.name,
  })
  const metaImage = imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize))[0]

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <MetaTags title={listing.name} image={metaImage} description={metaDescription} />
      {process.env.showNewListingDetailPage ? (
        <ListingDetailView listing={listing} jurisdiction={props.jurisdiction} />
      ) : (
        <ListingView listing={listing} jurisdiction={props.jurisdiction} />
      )}
    </Layout>
  )
}
/**
 *
 * getStaticPaths and getStaticProps with revalidation isn't actually working on netflify, so we have to use getServerSideProps until it does
 */
/* export async function getStaticPaths(context: { locales: Array<string> }) {
  try {
    const response = await axios.get(process.env.listingServiceUrl, {
      params: {
        view: "base",
        limit: "all",
        filter: [
          {
            $comparison: "<>",
            status: "pending",
          },
        ],
      },
      paramsSerializer: (params) => {
        return qs.stringify(params)
      },
    })

    return {
      paths: response?.data?.items
        ? context.locales.flatMap((locale: string) =>
            response.data.items.map((listing) => ({
              params: { id: listing.id, slug: listing.urlSlug },
              locale: locale,
            }))
          )
        : [],
      fallback: "blocking",
    }
  } catch (error) {
    console.error("listings getStaticPaths error = ", error)
    return {
      paths: [],
      fallback: "blocking",
    }
  }
} */

export async function getServerSideProps(context: {
  params: Record<string, string>
  locale: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any
}) {
  let response
  try {
    response = await axios.get(`${process.env.backendApiBase}/listings/${context.params.id}`, {
      headers: {
        language: context.locale,
        passkey: process.env.API_PASS_KEY,
        "x-forwarded-for":
          context.req.headers["x-forwarded-for"] ?? context.req.socket.remoteAddress,
      },
    })
  } catch (e) {
    return { notFound: true }
  }
  const jurisdiction = fetchJurisdictionByName(context.req)

  return { props: { listing: response.data, jurisdiction: await jurisdiction } }
}

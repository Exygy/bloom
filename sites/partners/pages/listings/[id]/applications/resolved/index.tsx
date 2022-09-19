import React from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import {
  AgTable,
  t,
  useAgTable,
  Breadcrumbs,
  BreadcrumbLink,
  NavigationHeader,
} from "@bloom-housing/ui-components"
import { useSingleListingData, useFlaggedApplicationsList } from "../../../../../lib/hooks"
import { ListingStatusBar } from "../../../../../src/listings/ListingStatusBar"
import Layout from "../../../../../layouts"
import { ApplicationsSideNav } from "../../../../../src/applications/ApplicationsSideNav"
import { getLinkCellFormatter } from "../../../../../src/applications/helpers"
import { Application, ApplicationReviewStatus } from "@bloom-housing/backend-core"

const ApplicationsList = () => {
  const router = useRouter()
  const listingId = router.query.id as string

  const tableOptions = useAgTable()

  /* Data Fetching */
  const { listingDto } = useSingleListingData(listingId)
  const listingName = listingDto?.name
  const { data: flaggedAppsData, loading: flaggedAppsLoading } = useFlaggedApplicationsList({
    listingId,
    page: 1,
    limit: 1,
    view: "resolved",
  })

  const columns = [
    {
      headerName: t("applications.duplicates.duplicateGroup"),
      field: "id",
      cellRenderer: "formatLinkCell",
      valueGetter: ({ data }) => {
        if (!data?.applications?.length) return ""
        const applicant = data.applications[0]?.applicant

        return `${applicant.firstName} ${applicant.lastName}: ${data.rule}`
      },
      flex: 1,
      minWidth: 250,
    },
    {
      headerName: t("applications.duplicates.primaryApplicant"),
      field: "",
      valueGetter: ({ data }) => {
        if (!data?.applications?.length) return ""
        const applicant = data.applications[0]?.applicant

        return `${applicant.firstName} ${applicant.lastName}`
      },
    },
    {
      headerName: t("applications.duplicates.duplicateApplications"),
      field: "",
      valueGetter: ({ data }) => {
        return data?.applications?.filter(
          (app: Application) => app.reviewStatus === ApplicationReviewStatus.duplicate
        ).length
      },
      type: "rightAligned",
    },
    {
      headerName: t("applications.duplicates.validApplications"),
      field: "",
      valueGetter: ({ data }) => {
        return data?.applications?.filter(
          (app: Application) => app.reviewStatus === ApplicationReviewStatus.valid
        ).length
      },
      type: "rightAligned",
    },
  ]

  return (
    <Layout>
      <Head>
        <title>{t("nav.siteTitlePartners")}</title>
      </Head>

      <NavigationHeader
        title={listingName}
        listingId={listingId}
        tabs={{
          show: true,
          flagsQty: flaggedAppsData?.meta?.totalFlagged,
          listingLabel: t("t.listingSingle"),
          applicationsLabel: t("nav.applications"),
        }}
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbLink href="/">{t("t.listing")}</BreadcrumbLink>
            <BreadcrumbLink href={`/listings/${listingId}`}>{listingName}</BreadcrumbLink>
            <BreadcrumbLink href={`/listings/${listingId}/applications`}>
              {t("nav.applications")}
            </BreadcrumbLink>
            <BreadcrumbLink href={`/listings/${listingId}/applications/resolved`} current>
              {t("t.resolved")}
            </BreadcrumbLink>
          </Breadcrumbs>
        }
      />

      <ListingStatusBar status={listingDto?.status} />

      <section className={"bg-gray-200 pt-4"}>
        <article className="flex flex-col md:flex-row items-start gap-x-8 relative max-w-screen-xl mx-auto pb-8 px-4 mt-2">
          <ApplicationsSideNav className="w-full md:w-72" listingId={listingId} />

          <div className="w-full">
            <AgTable
              id="applications-table"
              className="w-full"
              pagination={{
                perPage: tableOptions.pagination.itemsPerPage,
                setPerPage: tableOptions.pagination.setItemsPerPage,
                currentPage: tableOptions.pagination.currentPage,
                setCurrentPage: tableOptions.pagination.setCurrentPage,
              }}
              config={{
                gridComponents: { formatLinkCell: getLinkCellFormatter(router) },
                columns: columns,
                totalItemsLabel: t("applications.totalApplications"),
              }}
              data={{
                items: flaggedAppsData?.items ?? [],
                loading: flaggedAppsLoading,
                totalItems: flaggedAppsData?.meta?.totalItems ?? 0,
                totalPages: flaggedAppsData?.meta?.totalPages ?? 0,
              }}
              search={{
                setSearch: tableOptions.filter.setFilterValue,
              }}
              sort={{
                setSort: tableOptions.sort.setSortOptions,
              }}
            />
          </div>
        </article>
      </section>
    </Layout>
  )
}

export default ApplicationsList

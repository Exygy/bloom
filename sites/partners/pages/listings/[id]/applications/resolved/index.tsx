import React from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import {
  AgTable,
  t,
  Button,
  SiteAlert,
  useAgTable,
  Breadcrumbs,
  BreadcrumbLink,
  NavigationHeader,
} from "@bloom-housing/ui-components"
import {
  useSingleListingData,
  useFlaggedApplicationsList,
  useApplicationsExport,
} from "../../../../../lib/hooks"
import { ListingStatusBar } from "../../../../../src/listings/ListingStatusBar"
import Layout from "../../../../../layouts"
import { ApplicationsSideNav } from "../../../../../src/applications/ApplicationsSideNav"

const ApplicationsList = () => {
  const router = useRouter()
  const listingId = router.query.id as string

  const { onExport, csvExportLoading, csvExportError } = useApplicationsExport(listingId)

  const tableOptions = useAgTable()

  /* Data Fetching */
  const { listingDto } = useSingleListingData(listingId)
  const listingName = listingDto?.name
  const { data: flaggedApps } = useFlaggedApplicationsList({
    listingId,
    page: 1,
    limit: 1,
    view: "resolved",
  })

  const columns = [
    {
      headerName: t("applications.duplicates.duplicateGroup"),
      field: "id",
      sortable: false,
      filter: false,
      pinned: "left",
      cellRenderer: "formatLinkCell",
      valueGetter: ({ data }) => {
        if (!data?.applications?.length) return ""
        const applicant = data.applications[0]?.applicant

        return `${applicant.firstName} ${applicant.lastName}: ${data.rule}`
      },
    },
    {
      headerName: t("applications.duplicates.primaryApplicant"),
      field: "",
      sortable: false,
      filter: false,
      pinned: "left",
      valueGetter: ({ data }) => {
        if (!data?.applications?.length) return ""
        const applicant = data.applications[0]?.applicant

        return `${applicant.firstName} ${applicant.lastName}`
      },
    },
    {
      headerName: t("applications.pendingReview"),
      field: "",
      sortable: false,
      filter: false,
      pinned: "left",
      valueGetter: ({ data }) => {
        return `${data?.applications?.length ?? 0}`
      },
    },
    {
      headerName: t("t.rule"),
      field: "rule",
      sortable: false,
      filter: false,
      pinned: "left",
    },
  ]

  class formatLinkCell {
    linkWithId: HTMLSpanElement

    init(params) {
      const applicationId = params.data.id

      this.linkWithId = document.createElement("button")
      this.linkWithId.classList.add("text-blue-700")
      this.linkWithId.innerText = params.value

      this.linkWithId.addEventListener("click", function () {
        void router.push(`/application/${applicationId}`)
      })
    }

    getGui() {
      return this.linkWithId
    }
  }

  const gridComponents = {
    formatLinkCell,
  }

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
          flagsQty: flaggedApps?.meta?.totalFlagged,
          listingLabel: t("t.listingSingle"),
          applicationsLabel: t("nav.applications"),
          flagsLabel: t("nav.flags"),
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
      >
        {csvExportError && (
          <div className="flex top-4 right-4 absolute z-50 flex-col items-center">
            <SiteAlert type="alert" timeout={5000} dismissable />
          </div>
        )}
      </NavigationHeader>

      <ListingStatusBar status={listingDto?.status} />

      <section>
        <article className="flex items-start gap-x-8 relative max-w-screen-xl mx-auto pb-8 px-4 mt-2">
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
                gridComponents,
                columns,
                totalItemsLabel: t("applications.totalApplications"),
              }}
              data={{
                items: flaggedApps?.items ?? [],
                loading: false,
                totalItems: flaggedApps?.meta?.totalItems ?? 0,
                totalPages: flaggedApps?.meta?.totalPages ?? 0,
              }}
              search={{
                setSearch: tableOptions.filter.setFilterValue,
              }}
              sort={{
                setSort: tableOptions.sort.setSortOptions,
              }}
              headerContent={
                <div className="flex-row">
                  <Button className="mx-1" onClick={() => onExport()} loading={csvExportLoading}>
                    {t("t.export")}
                  </Button>
                </div>
              }
            />
          </div>
        </article>
      </section>
    </Layout>
  )
}

export default ApplicationsList

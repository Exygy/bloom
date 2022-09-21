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
  AlertBox,
} from "@bloom-housing/ui-components"
import { useSingleListingData, useFlaggedApplicationsList } from "../../../../../lib/hooks"
import { ListingStatusBar } from "../../../../../src/listings/ListingStatusBar"
import Layout from "../../../../../layouts"
import { ApplicationsSideNav } from "../../../../../src/applications/ApplicationsSideNav"
import { formatDateTime } from "@bloom-housing/shared-helpers/src/DateFormat"

const ApplicationsList = () => {
  const router = useRouter()
  const listingId = router.query.id as string
  const type = router.query.type as string

  const tableOptions = useAgTable()

  /* Data Fetching */
  const { listingDto } = useSingleListingData(listingId)
  const listingName = listingDto?.name
  const isListingOpen = listingDto?.status === "active"
  let view = "pending"
  if (type && type === "name_dob") {
    view = "pendingNameAndDoB"
  } else if (type && type === "email") {
    view = "pendingEmail"
  }

  const { data: flaggedAppsData, loading: flaggedAppsLoading } = useFlaggedApplicationsList({
    listingId,
    page: tableOptions.pagination.currentPage,
    limit: tableOptions.pagination.itemsPerPage,
    view,
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
      headerName: t("t.rule"),
      field: "rule",
      width: 150,
    },
    {
      headerName: t("applications.pendingReview"),
      field: "",
      valueGetter: ({ data }) => {
        return `${data?.applications?.length ?? 0}`
      },
      type: "rightAligned",
      width: 100,
    },
  ]

  class formatEnabledCell {
    linkWithId: HTMLSpanElement
    init(params) {
      const applicationId = params.data.id
      this.linkWithId = document.createElement("button")
      this.linkWithId.innerText = params.value
      this.linkWithId.classList.add("text-blue-700")
      this.linkWithId.addEventListener("click", function () {
        void router.push(`/application/${applicationId}/review`)
      })
    }
    getGui() {
      return this.linkWithId
    }
  }
  class formatDisabledCell {
    disabledLink: HTMLSpanElement
    init(params) {
      this.disabledLink = document.createElement("button")
      this.disabledLink.innerText = params.value
      this.disabledLink.classList.add("text-gray-750")
      this.disabledLink.classList.add("cursor-default")
    }
    getGui() {
      return this.disabledLink
    }
  }

  const gridComponents = {
    formatLinkCell: isListingOpen ? formatDisabledCell : formatEnabledCell,
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
            <BreadcrumbLink href={`/listings/${listingId}/applications/pending`} current>
              {t("t.pending")}
            </BreadcrumbLink>
          </Breadcrumbs>
        }
      />

      <ListingStatusBar status={listingDto?.status} />

      <section className={"bg-gray-200 pt-4"}>
        <article className="flex flex-col md:flex-row items-start gap-x-8 relative max-w-screen-xl mx-auto pb-8 px-4 mt-2">
          {listingDto && (
            <>
              <ApplicationsSideNav
                className="w-full md:w-72"
                listingId={listingId}
                listingOpen={isListingOpen}
              />

              <div className="w-full">
                {isListingOpen && (
                  <AlertBox type="notice" className="mb-3" customIcon={"lock"} closeable>
                    Preview applications that are pending review. Duplicates can be resolved when
                    applications close
                    {listingDto?.applicationDueDate &&
                      ` on ${formatDateTime(listingDto.applicationDueDate, true)}`}
                    .
                  </AlertBox>
                )}
                <AgTable
                  id="applications-table"
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
            </>
          )}
        </article>
      </section>
    </Layout>
  )
}

export default ApplicationsList

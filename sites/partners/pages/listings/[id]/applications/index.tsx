import React, { useContext, useMemo } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import {
  AgTable,
  t,
  Button,
  LocalizedLink,
  SiteAlert,
  useAgTable,
  Breadcrumbs,
  BreadcrumbLink,
  NavigationHeader,
} from "@bloom-housing/ui-components"
import { AuthContext } from "@bloom-housing/shared-helpers"
import {
  useSingleListingData,
  useFlaggedApplicationsList,
  useApplicationsData,
  useApplicationsExport,
} from "../../../../lib/hooks"
import { ListingStatusBar } from "../../../../src/listings/ListingStatusBar"
import Layout from "../../../../layouts"
import { getColDefs } from "../../../../src/applications/ApplicationsColDefs"
import {
  EnumApplicationsApiExtraModelOrder,
  EnumApplicationsApiExtraModelOrderBy,
} from "@bloom-housing/backend-core/types"
import { ApplicationsSideNav } from "../../../../src/applications/ApplicationsSideNav"

const ApplicationsList = () => {
  const { profile } = useContext(AuthContext)
  const router = useRouter()
  const listingId = router.query.id as string

  const tableOptions = useAgTable()

  const { onExport, csvExportLoading, csvExportError } = useApplicationsExport(
    listingId,
    profile?.roles?.isAdmin ?? false
  )

  /* Data Fetching */
  const { listingDto } = useSingleListingData(listingId)
  const countyCode = listingDto?.countyCode
  const listingName = listingDto?.name
  const isListingOpen = listingDto?.status === "active"
  const { data: flaggedApps } = useFlaggedApplicationsList({
    listingId,
    page: 1,
    limit: 1,
  })

  const { applications, appsMeta, appsLoading, appsError } = useApplicationsData(
    tableOptions.pagination.currentPage,
    tableOptions.filter.filterValue,
    tableOptions.pagination.itemsPerPage,
    listingId,
    tableOptions.sort.sortOptions?.[0]?.orderBy as EnumApplicationsApiExtraModelOrderBy,
    tableOptions.sort.sortOptions?.[0]?.orderDir as EnumApplicationsApiExtraModelOrder
  )

  class formatLinkCell {
    linkWithId: HTMLSpanElement

    init(params) {
      const applicationId = params.data.id

      this.linkWithId = document.createElement("button")
      this.linkWithId.classList.add("text-blue-700")
      this.linkWithId.innerText = params.value

      !isListingOpen &&
        this.linkWithId.addEventListener("click", function () {
          void router.push(`/application/${applicationId}`)
        })
    }

    getGui() {
      return this.linkWithId
    }
  }

  // get the highest value from householdSize and limit to 6
  const maxHouseholdSize = useMemo(() => {
    let max = 1

    applications?.forEach((item) => {
      if (item.householdSize > max) {
        max = item.householdSize
      }
    })

    return max < 6 ? max : 6
  }, [applications])

  const columnDefs = useMemo(() => {
    return getColDefs(maxHouseholdSize, countyCode)
  }, [maxHouseholdSize, countyCode])

  const gridComponents = {
    formatLinkCell,
  }

  if (!applications || appsError) return "An error has occurred."

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
            <BreadcrumbLink href={`/listings/${listingId}/applications`} current>
              {t("nav.applications")}
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
          {listingDto && (
            <>
              <ApplicationsSideNav
                className="w-full md:w-72"
                listingId={listingId}
                listingOpen={isListingOpen}
              />

              <AgTable
                className="w-full"
                id="applications-table"
                pagination={{
                  perPage: tableOptions.pagination.itemsPerPage,
                  setPerPage: tableOptions.pagination.setItemsPerPage,
                  currentPage: tableOptions.pagination.currentPage,
                  setCurrentPage: tableOptions.pagination.setCurrentPage,
                }}
                config={{
                  gridComponents,
                  columns: columnDefs,
                  totalItemsLabel: t("applications.totalApplications"),
                }}
                data={{
                  items: applications,
                  loading: appsLoading,
                  totalItems: appsMeta?.totalItems,
                  totalPages: appsMeta?.totalPages,
                }}
                search={{
                  setSearch: tableOptions.filter.setFilterValue,
                }}
                sort={{
                  setSort: tableOptions.sort.setSortOptions,
                }}
                headerContent={
                  <div className="flex-row">
                    <LocalizedLink href={`/listings/${listingId}/applications/add`}>
                      <Button
                        className="mx-1"
                        onClick={() => false}
                        dataTestId={"addApplicationButton"}
                      >
                        {t("applications.addApplication")}
                      </Button>
                    </LocalizedLink>

                    <Button className="mx-1" onClick={() => onExport()} loading={csvExportLoading}>
                      {t("t.export")}
                    </Button>
                  </div>
                }
              />
            </>
          )}
        </article>
      </section>
    </Layout>
  )
}

export default ApplicationsList

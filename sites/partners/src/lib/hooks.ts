import { useCallback, useContext, useState } from "react"
import useSWR from "swr"
import qs from "qs"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import tz from "dayjs/plugin/timezone"
import { AuthContext, MessageContext } from "@bloom-housing/shared-helpers"
import { t } from "@bloom-housing/ui-components"
import {
  ApplicationOrderByKeys,
  EnumListingFilterParamsComparison,
  EnumMultiselectQuestionFilterParamsComparison,
  ListingViews,
  MultiselectQuestionFilterParams,
  MultiselectQuestionsApplicationSectionEnum,
  OrderByEnum,
  UserRole,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"

dayjs.extend(utc)
dayjs.extend(tz)

export interface PaginationProps {
  page?: number
  limit: number | "all"
}

export interface ColumnOrder {
  orderBy: string
  orderDir: string
}

interface UseSingleApplicationDataProps extends PaginationProps {
  listingId: string
}

interface UseSingleFlaggedApplicationDataProps extends UseSingleApplicationDataProps {
  view?: string
  limit: number
  search?: string
}

type UseUserListProps = PaginationProps & {
  search?: string
}

type UseListingsDataProps = PaginationProps & {
  userId?: string
  search?: string
  sort?: ColumnOrder[]
  roles?: UserRole
  userJurisidctionIds?: string[]
}

export function useSingleListingData(listingId: string) {
  const { listingsService } = useContext(AuthContext)
  const fetcher = () => listingId && listingsService.retrieve({ id: listingId })

  const { data, error } = useSWR(`/api/adapter/listings/${listingId}`, fetcher)

  return {
    listingDto: data,
    listingLoading: !error && !data,
    listingError: error,
  }
}

export function useListingsData({
  page,
  limit,
  userId,
  search = "",
  sort,
  roles,
  userJurisidctionIds,
}: UseListingsDataProps) {
  const params = {
    page,
    limit,
    filter: [],
    search,
    view: ListingViews.base,
  }

  if (sort) {
    Object.assign(params, {
      orderBy: sort?.filter((item) => item.orderBy).map((item) => item.orderBy),
    })
    Object.assign(params, {
      orderDir: sort?.filter((item) => item.orderDir).map((item) => item.orderDir),
    })
  }

  // filter if logged user is an agent
  if (roles?.isPartner) {
    params.filter.push({
      $comparison: EnumListingFilterParamsComparison["="],
      leasingAgent: userId,
    })
  } else if (roles?.isJurisdictionalAdmin) {
    params.filter.push({
      $comparison: EnumListingFilterParamsComparison.IN,
      jurisdiction: userJurisidctionIds[0],
    })
  }

  if (search?.length < 3) {
    delete params.search
  } else {
    Object.assign(params, { search })
  }

  const { listingsService } = useContext(AuthContext)

  const fetcher = () => listingsService.list(params)

  const paramsString = qs.stringify(params)

  const { data, error } = useSWR(`/api/adapter/listings?${paramsString}`, fetcher)

  return {
    listingDtos: data,
    listingsLoading: !error && !data,
    listingsError: error,
  }
}

export const useListingExport = () => {
  const { listingsService } = useContext(AuthContext)
  const { addToast } = useContext(MessageContext)

  const [csvExportLoading, setCsvExportLoading] = useState(false)

  const onExport = useCallback(async () => {
    setCsvExportLoading(true)

    try {
      const content = await listingsService.listAsCsv(
        { timeZone: dayjs.tz.guess() },
        { responseType: "arraybuffer" }
      )
      const blob = new Blob([new Uint8Array(content)], { type: "application/zip" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const now = new Date()
      const dateString = dayjs(now).format("YYYY-MM-DD_HH-mm")
      link.setAttribute("download", `${dateString}-complete-listing-data.zip`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      addToast(t("t.exportSuccess"), { variant: "success" })
    } catch (err) {
      console.log(err)
      addToast(t("account.settings.alerts.genericError"), { variant: "alert" })
    }

    setCsvExportLoading(false)
  }, [])

  return {
    onExport,
    csvExportLoading,
  }
}

export function useSingleApplicationData(applicationId: string) {
  const { applicationsService } = useContext(AuthContext)
  const backendSingleApplicationsEndpointUrl = `/api/adapter/applications/${applicationId}`

  const fetcher = () => applicationsService.retrieve({ applicationId: applicationId })
  const { data, error } = useSWR(backendSingleApplicationsEndpointUrl, fetcher)

  return {
    application: data,
    applicationLoading: !error && !data,
    applicationError: error,
  }
}

export function useFlaggedApplicationsList({
  listingId,
  page,
  limit,
  view,
  search = "",
}: UseSingleFlaggedApplicationDataProps) {
  const { applicationFlaggedSetsService } = useContext(AuthContext)

  const params = {
    listingId,
    page,
    limit,
    search,
  }

  if (view) {
    Object.assign(params, { view })
  }

  if (search?.length < 3) {
    delete params.search
  } else {
    Object.assign(params, { search })
  }

  const paramString = qs.stringify(params)

  const endpoint = `/api/adapter/applicationFlaggedSets?${paramString}`

  const fetcher = () => applicationFlaggedSetsService.list(params)

  const { data, error } = useSWR(endpoint, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useApplicationsData(
  currentPage: number,
  delayedFilterValue: string,
  limit: number,
  listingId: string,
  orderBy?: ApplicationOrderByKeys,
  order?: OrderByEnum
) {
  const { applicationsService } = useContext(AuthContext)

  const params = {
    listingId,
    page: currentPage,
    limit,
  }

  if (delayedFilterValue) {
    Object.assign(params, { search: delayedFilterValue })
  }

  if (orderBy) {
    Object.assign(params, { orderBy, order: order || OrderByEnum.asc })
  }

  const paramsString = qs.stringify(params)

  const endpoint = `/api/adapter/applications?${paramsString}`

  const fetcher = () => applicationsService.list(params)
  const { data, error } = useSWR(endpoint, fetcher)

  const applications = data?.items
  const appsMeta = data?.meta

  return {
    applications: applications ?? [],
    appsMeta,
    appsLoading: !error && !data,
    appsError: error,
  }
}

export function useFlaggedApplicationsMeta(listingId: string) {
  const { applicationFlaggedSetsService } = useContext(AuthContext)

  const params = {
    listingId,
  }

  const queryParams = new URLSearchParams()
  queryParams.append("listingId", listingId)

  const endpoint = `/api/adapter/applicationFlaggedSetsMeta?${queryParams.toString()}`

  const fetcher = () => applicationFlaggedSetsService.meta(params)

  const { data, error } = useSWR(endpoint, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}
export function useSingleFlaggedApplication(afsId: string) {
  const { applicationFlaggedSetsService } = useContext(AuthContext)

  const fetcher = () =>
    applicationFlaggedSetsService.retrieve({
      afsId,
    })

  const cacheKey = `/api/adapter/applicationFlaggedSets/${afsId}`

  const { data, error } = useSWR(cacheKey, fetcher)

  return {
    cacheKey,
    data,
    error,
    loading: !error && !data,
  }
}

export function useSingleAmiChartData(amiChartId: string) {
  const { amiChartsService } = useContext(AuthContext)
  const fetcher = () => amiChartsService.retrieve({ amiChartId })

  const { data, error } = useSWR(`/api/adapter/amiCharts/${amiChartId}`, fetcher)

  return {
    data,
    error,
  }
}

export function useAmiChartList(jurisdiction: string) {
  const { amiChartsService } = useContext(AuthContext)
  const fetcher = () => amiChartsService.list({ jurisdictionId: jurisdiction })

  const { data, error } = useSWR(`/api/adapter/amiCharts/${jurisdiction}`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useSingleAmiChart(amiChartId: string) {
  const { amiChartsService } = useContext(AuthContext)
  const fetcher = () => amiChartsService.retrieve({ amiChartId })

  const { data, error } = useSWR(`/api/adapter/amiCharts/${amiChartId}`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useUnitPriorityList() {
  const { unitPriorityService } = useContext(AuthContext)
  const fetcher = () => unitPriorityService.list()

  const { data, error } = useSWR(`/api/adapter/unitAccessibilityPriorityTypes`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useUnitTypeList() {
  const { unitTypesService } = useContext(AuthContext)
  const fetcher = () => unitTypesService.list()

  const { data, error } = useSWR(`/api/adapter/unitTypes`, fetcher)

  const sortedData = data?.sort((a, b) => a.numBedrooms - b.numBedrooms)

  return {
    data: sortedData,
    loading: !error && !data,
    error,
  }
}

export function useJurisdiction(jurisdictionId: string) {
  const { jurisdictionsService } = useContext(AuthContext)
  const fetcher = () =>
    jurisdictionsService.retrieve({
      jurisdictionId,
    })

  const { data, error } = useSWR(`/api/adapter/jurisdictions/${jurisdictionId}`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useMultiselectQuestionList() {
  const { multiselectQuestionsService } = useContext(AuthContext)
  const fetcher = () => multiselectQuestionsService.list()

  const { data, error } = useSWR(`/api/adapter/multiselectQuestions`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useJurisdictionalMultiselectQuestionList(
  jurisdictionId: string,
  applicationSection?: MultiselectQuestionsApplicationSectionEnum
) {
  const { multiselectQuestionsService } = useContext(AuthContext)

  const params: {
    filter: MultiselectQuestionFilterParams[]
  } = {
    filter: [],
  }
  params.filter.push({
    $comparison: EnumMultiselectQuestionFilterParamsComparison["IN"],
    jurisdiction: jurisdictionId && jurisdictionId !== "" ? jurisdictionId : undefined,
  })
  if (applicationSection) {
    params.filter.push({
      $comparison: EnumMultiselectQuestionFilterParamsComparison["="],
      applicationSection,
    })
  }

  const paramsString = qs.stringify(params)

  const fetcher = () => multiselectQuestionsService.list(params)

  const cacheKey = `/api/adapter/multiselectQuestions/list?${paramsString}`

  const { data, error } = useSWR(cacheKey, fetcher)

  return {
    cacheKey,
    data: data,
    loading: !error && !data,
    error,
  }
}

export function useListingsMultiselectQuestionList(multiselectQuestionId: string) {
  const { listingsService } = useContext(AuthContext)

  const fetcher = () =>
    listingsService.retrieveListings({
      multiselectQuestionId,
    })

  const { data, error } = useSWR(
    `/api/adapter/muliselectQuestions/listings/${multiselectQuestionId}`,
    fetcher
  )

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useReservedCommunityTypeList() {
  const { reservedCommunityTypeService } = useContext(AuthContext)
  const fetcher = () => reservedCommunityTypeService.list()

  const { data, error } = useSWR(`/api/adapter/reservedCommunityTypes`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useUserList({ page, limit, search = "" }: UseUserListProps) {
  const params = {
    page,
    limit,
    filter: [
      {
        isPortalUser: true,
        $comparison: EnumListingFilterParamsComparison["="],
      },
    ],
    search,
  }

  if (search?.length < 3) {
    delete params.search
  } else {
    Object.assign(params, { search })
  }

  const paramsString = qs.stringify(params)

  const { userService } = useContext(AuthContext)

  const fetcher = () => userService.list(params)

  const cacheKey = `/api/adapter/user/list?${paramsString}`

  const { data, error } = useSWR(cacheKey, fetcher)

  return {
    cacheKey,
    data,
    loading: !error && !data,
    error,
  }
}

export const createDateStringFromNow = (format = "YYYY-MM-DD_HH:mm:ss"): string => {
  const now = new Date()
  return dayjs(now).format(format)
}

export const useZipExport = (
  listingId: string,
  includeDemographics: boolean,
  isLottery: boolean,
  isSpreadsheet = false
) => {
  const { applicationsService, lotteryService } = useContext(AuthContext)
  const [exportLoading, setExportLoading] = useState(false)
  const { addToast } = useContext(MessageContext)

  const onExport = useCallback(async () => {
    setExportLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let content: any
      if (isLottery) {
        content = await lotteryService.lotteryResults(
          { id: listingId, includeDemographics, timeZone: dayjs.tz.guess() },
          { responseType: "arraybuffer" }
        )
      } else {
        if (isSpreadsheet) {
          content = await applicationsService.listAsSpreadsheet(
            { id: listingId, includeDemographics, timeZone: dayjs.tz.guess() },
            { responseType: "arraybuffer" }
          )
        } else {
          content = await applicationsService.listAsCsv(
            { id: listingId, includeDemographics, timeZone: dayjs.tz.guess() },
            { responseType: "arraybuffer" }
          )
        }
      }

      const blob = new Blob([new Uint8Array(content)], { type: "application/zip" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute(
        "download",
        `${isLottery ? "lottery" : "applications"}-${listingId}-${createDateStringFromNow(
          "YYYY-MM-DD_HH-mm"
        )}.zip`
      )
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      addToast(t("t.exportSuccess"), { variant: "success" })
    } catch (err) {
      console.log(err)
      addToast(t("account.settings.alerts.genericError"), { variant: "alert" })
    }
    setExportLoading(false)
  }, [])

  return {
    onExport,
    exportLoading,
  }
}

export const useUsersExport = () => {
  const { userService } = useContext(AuthContext)

  return useCsvExport(
    () => userService.listAsCsv(),
    `users-${createDateStringFromNow("YYYY-MM-DD_HH:mm")}.csv`
  )
}

const useCsvExport = (
  endpoint: () => Promise<string>,
  fileName: string,
  exportedAsSpreadsheet = false
) => {
  const [csvExportLoading, setCsvExportLoading] = useState(false)
  const { addToast } = useContext(MessageContext)

  const onExport = useCallback(async () => {
    setCsvExportLoading(true)

    try {
      const content = await endpoint()
      const blob = new Blob([content], { type: exportedAsSpreadsheet ? "text/xlsx" : "text/csv" })
      const fileLink = document.createElement("a")
      fileLink.setAttribute("download", fileName)
      fileLink.href = URL.createObjectURL(blob)
      fileLink.click()
      addToast(t("t.exportSuccess"), { variant: "success" })
    } catch (err) {
      console.log(err)
      addToast(t("account.settings.alerts.genericError"), { variant: "alert" })
    }

    setCsvExportLoading(false)
  }, [endpoint, fileName, addToast])

  return {
    onExport,
    csvExportLoading,
  }
}

export function useMapLayersList(jurisdictionId?: string) {
  const { mapLayersService } = useContext(AuthContext)
  const backendMapLayersUrl = `/api/adapter/mapLayers/${jurisdictionId}`

  const fetcher = () => mapLayersService.list({ jurisdictionId })
  const { data, error } = useSWR(backendMapLayersUrl, fetcher)

  return {
    mapLayers: data,
    mapLayersLoading: !error && !data,
    mapLayersError: error,
  }
}

export function useLotteryActivityLog(listingId: string) {
  const { lotteryService } = useContext(AuthContext)
  const fetcher = () => listingId && lotteryService.lotteryActivityLog({ id: listingId })

  const { data, error } = useSWR(`/api/adapter/lottery/lotteryActivityLog/${listingId}`, fetcher)

  return {
    lotteryActivityLogData: data,
    lotteryActivityLogLoading: !error && !data,
    lotteryError: error,
  }
}

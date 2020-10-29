import * as React from "react"

import { Apply } from "./Apply"
import Archer from "@bloom-housing/listings-service/listings/archer.json"
import {
  ApplicationMethodDto,
  EnumApplicationMethodDtoType,
} from "@bloom-housing/core"

export default {
  title: "Listing Sidebar/Apply",
}

const listing = Object.assign({}, Archer) as any
const internalFormRoute = "/applications/start/choose-language"

export const hardApplicationDeadline = () => {
  listing.applicationDueDate = "2021-11-30T15:22:57.000-07:00"
  listing.applicationMethods[0].acceptsPostmarkedApplications = false

  /* eslint-disable @typescript-eslint/ban-ts-ignore */
  // @ts-ignore
  return <Apply listing={listing} internalFormRoute={internalFormRoute} />
  /* eslint-enable @typescript-eslint/ban-ts-ignore */
}

export const acceptsPostmarkedApplications = () => {
  listing.applicationDueDate = "2021-11-30T15:22:57.000-07:00"
  listing.applicationMethods[0].acceptsPostmarkedApplications = true
  listing.postmarkedApplicationsReceivedByDate = "2021-12-05"

  /* eslint-disable @typescript-eslint/ban-ts-ignore */
  // @ts-ignore
  return <Apply listing={listing} internalFormRoute={internalFormRoute} />
  /* eslint-enable @typescript-eslint/ban-ts-ignore */
}

export const showsMultipleDownloadURLs = () => {
  const listingWithDownloadMethods = Object.assign({}, listing)

  const testMethod1: ApplicationMethodDto = {
    acceptsPostmarkedApplications: false,
    createdAt: new Date(),
    id: "",
    updatedAt: new Date(),
    label: "English",
    externalReference: "#english",
    type: EnumApplicationMethodDtoType.FileDownload,
  }
  const testMethod2: ApplicationMethodDto = {
    acceptsPostmarkedApplications: false,
    createdAt: new Date(),
    id: "",
    updatedAt: new Date(),
    label: "Spanish",
    externalReference: "#spanish",
    type: EnumApplicationMethodDtoType.FileDownload,
  }

  listingWithDownloadMethods.applicationMethods = listingWithDownloadMethods.applicationMethods.concat(
    [testMethod1, testMethod2]
  )

  /* eslint-disable @typescript-eslint/ban-ts-ignore */
  // @ts-ignore
  return <Apply listing={listingWithDownloadMethods} internalFormRoute={internalFormRoute} />
  /* eslint-enable @typescript-eslint/ban-ts-ignore */
}

export const linkDirectlyToInternalApplication = () => {
  const listingWithInternalLink = Object.assign({}, listing)

  const internalMethod: ApplicationMethodDto = {
    acceptsPostmarkedApplications: false,
    createdAt: new Date(),
    externalReference: "",
    id: "",
    label: "",
    updatedAt: new Date(),
    type: EnumApplicationMethodDtoType.Internal,
  }

  listingWithInternalLink.applicationMethods = listingWithInternalLink.applicationMethods.concat([
    internalMethod,
  ])

  /* eslint-disable @typescript-eslint/ban-ts-ignore */
  // @ts-ignore
  return <Apply listing={listingWithInternalLink} internalFormRoute={internalFormRoute} />
  /* eslint-enable @typescript-eslint/ban-ts-ignore */
}

export const linkToInternalApplicationAndDownloads = () => {
  const listingWithInternalAndDownload = Object.assign({}, listing)

  const internalMethod: ApplicationMethodDto = {
    acceptsPostmarkedApplications: false,
    createdAt: new Date(),
    externalReference: "",
    id: "",
    label: "",
    updatedAt: new Date(),
    type: EnumApplicationMethodDtoType.Internal,
  }

  const downloadMethod: ApplicationMethodDto = {
    acceptsPostmarkedApplications: false,
    createdAt: new Date(),
    id: "",
    updatedAt: new Date(),
    label: "English",
    externalReference: "#english",
    type: EnumApplicationMethodDtoType.FileDownload,
  }

  listingWithInternalAndDownload.applicationMethods = listingWithInternalAndDownload.applicationMethods.concat(
    [internalMethod, downloadMethod]
  )

  /* eslint-disable @typescript-eslint/ban-ts-ignore */
  // @ts-ignore
  return <Apply listing={listingWithInternalAndDownload} internalFormRoute={internalFormRoute} />
  /* eslint-enable @typescript-eslint/ban-ts-ignore */
}

export const linkDirectlyToExternalApplication = () => {
  const listingWithMethodLinks = Object.assign({}, listing)

  const externalMethod: ApplicationMethodDto = {
    acceptsPostmarkedApplications: false,
    createdAt: new Date(),
    id: "",
    updatedAt: new Date(),
    label: "External",
    externalReference: "https://icann.org",
    type: ApplicationMethodType.ExternalLink,
  }

  listingWithMethodLinks.applicationMethods = listingWithMethodLinks.applicationMethods.concat([
    externalMethod,
  ])

  /* eslint-disable @typescript-eslint/ban-ts-ignore */
  // @ts-ignore
  return <Apply listing={listingWithMethodLinks} internalFormRoute={internalFormRoute} />
  /* eslint-enable @typescript-eslint/ban-ts-ignore */
}

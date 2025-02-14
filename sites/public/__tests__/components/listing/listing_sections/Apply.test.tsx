import React from "react"
import dayjs from "dayjs"
import { render, cleanup, fireEvent } from "@testing-library/react"
import {
  ApplicationMethodsTypeEnum,
  LanguagesEnum,
  ListingsStatusEnum,
  User,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { listing } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import { Apply } from "../../../../src/components/listing/listing_sections/Apply"
import { getDateString } from "../../../../src/components/listing/ListingViewSeedsHelpers"

afterEach(cleanup)

describe("<Apply>", () => {
  it("does not render if only application method is referral", () => {
    const { queryByText } = render(
      <Apply
        listing={{
          ...listing,
          applicationDueDate: dayjs(new Date()).add(5, "days").toDate(),
          applicationMethods: [
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.Referral,
              acceptsPostmarkedApplications: null,
              externalReference: "Referral summary description",
              paperApplications: [],
              phoneNumber: "(123) 456-7890",
            },
          ],
        }}
        preview={false}
        setShowDownloadModal={() => null}
      />
    )
    expect(queryByText("How to Apply")).toBeNull()
  })

  it("does not render if due date is in the past", () => {
    const { queryByText } = render(
      <Apply
        listing={{
          ...listing,
          applicationDueDate: dayjs(new Date()).subtract(5, "days").toDate(),
          applicationMethods: [
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.Internal,
              acceptsPostmarkedApplications: null,
              externalReference: null,
              paperApplications: [],
              phoneNumber: null,
            },
          ],
        }}
        preview={false}
        setShowDownloadModal={() => null}
      />
    )
    expect(queryByText("How to Apply")).toBeNull()
  })

  it("does not render if listing is closed", () => {
    const { queryByText } = render(
      <Apply
        listing={{
          ...listing,
          applicationDueDate: dayjs(new Date()).add(5, "days").toDate(),
          status: ListingsStatusEnum.closed,
          applicationMethods: [
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.Internal,
              acceptsPostmarkedApplications: null,
              externalReference: null,
              paperApplications: [],
              phoneNumber: null,
            },
          ],
        }}
        preview={false}
        setShowDownloadModal={() => null}
      />
    )
    expect(queryByText("How to Apply")).toBeNull()
  })

  it("shows apply online button for internal online application", () => {
    const { getByText, getByRole, queryByText } = render(
      <Apply
        listing={{
          ...listing,
          applicationDueDate: dayjs(new Date()).add(5, "days").toDate(),
          applicationMethods: [
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.Internal,
              acceptsPostmarkedApplications: null,
              externalReference: null,
              paperApplications: [],
              phoneNumber: null,
            },
          ],
        }}
        preview={false}
        setShowDownloadModal={() => null}
      />
    )
    expect(getByText("How to Apply")).toBeDefined()
    expect(getByText("Apply Online")).toBeDefined()
    expect(getByRole("link", { name: "Apply Online" })).toHaveAttribute(
      "href",
      `/applications/start/choose-language?listingId=${listing.id}`
    )

    expect(queryByText("Download Application")).toBeNull()
  })

  it("shows redirected apply online button for internal online application with mandated accounts on while signed out", () => {
    process.env.showMandatedAccounts = "TRUE"
    const { getByText, getByRole, queryByText } = render(
      <AuthContext.Provider value={{ initialStateLoaded: true, profile: null }}>
        <Apply
          listing={{
            ...listing,
            applicationDueDate: dayjs(new Date()).add(5, "days").toDate(),
            applicationMethods: [
              {
                id: "id",
                createdAt: new Date(),
                updatedAt: new Date(),
                type: ApplicationMethodsTypeEnum.Internal,
                acceptsPostmarkedApplications: null,
                externalReference: null,
                paperApplications: [],
                phoneNumber: null,
              },
            ],
          }}
          preview={false}
          setShowDownloadModal={() => null}
        />
      </AuthContext.Provider>
    )
    expect(getByText("How to Apply")).toBeDefined()
    expect(getByText("Apply Online")).toBeDefined()
    expect(getByRole("link", { name: "Apply Online" })).toHaveAttribute(
      "href",
      `/sign-in?redirectUrl=/applications/start/choose-language&listingId=${listing.id}`
    )

    expect(queryByText("Download Application")).toBeNull()
  })

  it("shows not-redirected apply online button for internal online application with mandated accounts on while signed in", () => {
    process.env.showMandatedAccounts = "TRUE"
    const mockUser: User = {
      id: "123",
      email: "test@test.com",
      firstName: "Test",
      lastName: "User",
      dob: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      jurisdictions: [],
      mfaEnabled: false,
      passwordUpdatedAt: new Date(),
      passwordValidForDays: 180,
      agreedToTermsOfService: true,
      listings: [],
    }
    const { getByText, getByRole, queryByText } = render(
      <AuthContext.Provider value={{ initialStateLoaded: true, profile: mockUser }}>
        <Apply
          listing={{
            ...listing,
            applicationDueDate: dayjs(new Date()).add(5, "days").toDate(),
            applicationMethods: [
              {
                id: "id",
                createdAt: new Date(),
                updatedAt: new Date(),
                type: ApplicationMethodsTypeEnum.Internal,
                acceptsPostmarkedApplications: null,
                externalReference: null,
                paperApplications: [],
                phoneNumber: null,
              },
            ],
          }}
          preview={false}
          setShowDownloadModal={() => null}
        />
      </AuthContext.Provider>
    )
    expect(getByText("How to Apply")).toBeDefined()
    expect(getByText("Apply Online")).toBeDefined()
    expect(getByRole("link", { name: "Apply Online" })).toHaveAttribute(
      "href",
      `/applications/start/choose-language?listingId=${listing.id}`
    )

    expect(queryByText("Download Application")).toBeNull()
  })

  it("shows apply online button for external online application", () => {
    const { getByText, getByRole, queryByText } = render(
      <Apply
        listing={{
          ...listing,
          applicationDueDate: dayjs(new Date()).add(5, "days").toDate(),
          applicationMethods: [
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.ExternalLink,
              acceptsPostmarkedApplications: null,
              externalReference: "https://www.exygy.com",
              paperApplications: [],
              phoneNumber: null,
            },
          ],
        }}
        preview={false}
        setShowDownloadModal={() => null}
      />
    )
    expect(getByText("How to Apply")).toBeDefined()
    expect(getByText("Apply Online")).toBeDefined()
    expect(getByRole("link", { name: "Apply Online" })).toHaveAttribute(
      "href",
      "https://www.exygy.com"
    )

    expect(queryByText("Download Application")).toBeNull()
  })

  it("shows download application button and opens modal for multiple paper applications", () => {
    const showDownloadModalSpy = jest.fn()
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => Promise.resolve(new Response()))
    const { getByText, queryByText } = render(
      <Apply
        listing={{
          ...listing,
          applicationDueDate: dayjs(new Date()).add(5, "days").toDate(),
          applicationMethods: [
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.FileDownload,
              acceptsPostmarkedApplications: null,
              externalReference: null,
              paperApplications: [
                {
                  id: "id",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  language: LanguagesEnum.en,
                  assets: {
                    id: "id",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    fileId: "id",
                    label: "Asset label",
                  },
                },
                {
                  id: "id",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  language: LanguagesEnum.es,
                  assets: {
                    id: "id",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    fileId: "id",
                    label: "Asset label",
                  },
                },
              ],
              phoneNumber: null,
            },
          ],
        }}
        preview={false}
        setShowDownloadModal={showDownloadModalSpy}
      />
    )
    expect(getByText("How to Apply")).toBeDefined()
    expect(getByText("Download Application")).toBeDefined()
    fireEvent.click(getByText("Download Application"))
    expect(showDownloadModalSpy).toHaveBeenCalled()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(queryByText("Apply Online")).toBeNull()
  })

  it("shows download application button and does not open modal for one paper application", () => {
    const showDownloadModalSpy = jest.fn()
    global.URL.createObjectURL = jest.fn()
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => Promise.resolve(new Response()))
    process.env.cloudinaryCloudName = "exygy"

    const { getByText, queryByText } = render(
      <Apply
        listing={{
          ...listing,
          applicationDueDate: dayjs(new Date()).add(5, "days").toDate(),
          applicationMethods: [
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.FileDownload,
              acceptsPostmarkedApplications: null,
              externalReference: null,
              paperApplications: [
                {
                  id: "id",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  language: LanguagesEnum.en,
                  assets: {
                    id: "id",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    fileId: "paper-application-id",
                    label: "Asset label",
                  },
                },
              ],
              phoneNumber: null,
            },
          ],
        }}
        preview={false}
        setShowDownloadModal={showDownloadModalSpy}
      />
    )
    expect(getByText("How to Apply")).toBeDefined()
    expect(getByText("Download Application")).toBeDefined()
    fireEvent.click(getByText("Download Application"))
    expect(fetchMock).toHaveBeenCalledWith(
      "https://res.cloudinary.com/exygy/image/upload/paper-application-id.pdf",
      { headers: { "Content-Type": "application/pdf" }, method: "GET" }
    )

    expect(queryByText("Apply Online")).toBeNull()
    expect(showDownloadModalSpy).not.toHaveBeenCalled()
  })

  it("shows apply online and download application button for online and paper", () => {
    const { getByText } = render(
      <Apply
        listing={{
          ...listing,
          applicationDueDate: dayjs(new Date()).add(5, "days").toDate(),
          applicationMethods: [
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.Internal,
              acceptsPostmarkedApplications: null,
              externalReference: null,
              paperApplications: [],
              phoneNumber: null,
            },
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.FileDownload,
              acceptsPostmarkedApplications: null,
              externalReference: null,
              paperApplications: [
                {
                  id: "id",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  language: LanguagesEnum.en,
                  assets: {
                    id: "id",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    fileId: "paper-application-id",
                    label: "Asset label",
                  },
                },
              ],
              phoneNumber: null,
            },
          ],
        }}
        preview={false}
        setShowDownloadModal={() => null}
      />
    )
    expect(getByText("How to Apply")).toBeDefined()
    expect(getByText("Apply Online")).toBeDefined()
    expect(getByText("Download Application")).toBeDefined()
  })

  it("shows paper application and mailing / drop off / pick up addresses", () => {
    const { getByText, queryByText, getAllByText } = render(
      <Apply
        listing={{
          ...listing,
          applicationDueDate: dayjs(new Date()).add(5, "days").toDate(),
          applicationMethods: [
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.FileDownload,
              acceptsPostmarkedApplications: null,
              externalReference: null,
              paperApplications: [
                {
                  id: "id",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  language: LanguagesEnum.en,
                  assets: {
                    id: "id",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    fileId: "paper-application-id",
                    label: "Asset label",
                  },
                },
              ],
              phoneNumber: null,
            },
          ],
          listingsApplicationPickUpAddress: {
            id: "id",
            createdAt: new Date(),
            updatedAt: new Date(),
            city: "Pick up address city",
            street: "Pick up address street",
            street2: "Pick up address unit",
            zipCode: "67890",
            state: "CA",
            latitude: 1,
            longitude: 2,
          },
          listingsApplicationMailingAddress: {
            id: "id",
            createdAt: new Date(),
            updatedAt: new Date(),
            city: "Mailing address city",
            street: "Mailing address street",
            street2: "Mailing address unit",
            zipCode: "12345",
            state: "CO",
            latitude: 1,
            longitude: 2,
          },
          listingsApplicationDropOffAddress: {
            id: "id",
            createdAt: new Date(),
            updatedAt: new Date(),
            city: "Drop off address city",
            street: "Drop off address street",
            street2: "Drop off address unit",
            zipCode: "45678",
            state: "CT",
            latitude: 1,
            longitude: 2,
          },
          applicationDropOffAddressOfficeHours: "Drop off address office hours",
          applicationPickUpAddressOfficeHours: "Pick up address office hours",
        }}
        preview={false}
        setShowDownloadModal={() => null}
      />
    )
    expect(getByText("How to Apply")).toBeDefined()
    expect(getByText("Download Application")).toBeDefined()
    expect(getByText("Pick up an application")).toBeDefined()
    expect(getByText("Pick up address street, Pick up address unit")).toBeDefined()
    expect(getByText("Pick up address city, CA 67890")).toBeDefined()
    expect(getByText("Pick up address office hours")).toBeDefined()
    expect(getByText("Submit a Paper Application")).toBeDefined()
    expect(getByText("Send Application by US Mail")).toBeDefined()
    expect(getByText("Mailing address street, Mailing address unit")).toBeDefined()
    expect(getByText("Mailing address city, CO 12345")).toBeDefined()
    expect(getByText("Drop Off Application")).toBeDefined()
    expect(getByText("Drop off address street, Drop off address unit")).toBeDefined()
    expect(getByText("Drop off address city, CT 45678")).toBeDefined()
    expect(getByText("Drop off address office hours")).toBeDefined()
    expect(getAllByText("Get Directions").length).toBe(2)

    expect(queryByText("Apply Online")).toBeNull()
  })

  it("shows mailing address with postmark", () => {
    const dueDate = dayjs(new Date()).add(5, "days").toDate()
    const postmarkDate = dayjs(new Date()).add(10, "days").toDate()
    const { getByText, queryByText } = render(
      <Apply
        listing={{
          ...listing,
          applicationDueDate: dueDate,
          applicationMethods: [
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.FileDownload,
              acceptsPostmarkedApplications: null,
              externalReference: null,
              paperApplications: [
                {
                  id: "id",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  language: LanguagesEnum.en,
                  assets: {
                    id: "id",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    fileId: "paper-application-id",
                    label: "Asset label",
                  },
                },
              ],
              phoneNumber: null,
            },
          ],
          listingsApplicationMailingAddress: {
            id: "id",
            createdAt: new Date(),
            updatedAt: new Date(),
            city: "Mailing address city",
            street: "Mailing address street",
            street2: "Mailing address unit",
            zipCode: "12345",
            state: "CO",
            latitude: 1,
            longitude: 2,
          },
          postmarkedApplicationsReceivedByDate: postmarkDate,
        }}
        preview={false}
        setShowDownloadModal={() => null}
      />
    )
    expect(getByText("How to Apply")).toBeDefined()
    const dueDateString = getDateString(dueDate, `MMM DD, YYYY [${t("t.at")}] hh:mm A`)
    const postmarkString = getDateString(postmarkDate, `MMM DD, YYYY [${t("t.at")}] hh:mm A`)
    expect(
      getByText(
        `Applications must be received by the deadline. If sending by U.S. Mail, the application must be postmarked by ${dueDateString} and received by mail no later than ${postmarkString}. Applications received after ${postmarkString} via mail will not be accepted even if they are postmarked by ${dueDateString}. ${listing.developer} is not responsible for lost or delayed mail.`
      )
    )

    expect(queryByText("Apply Online")).toBeNull()
  })

  it("shows mailing address with no postmark", () => {
    const dueDate = dayjs(new Date()).add(5, "days").toDate()
    const { getByText, queryByText } = render(
      <Apply
        listing={{
          ...listing,
          applicationDueDate: dueDate,
          applicationMethods: [
            {
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              type: ApplicationMethodsTypeEnum.FileDownload,
              acceptsPostmarkedApplications: null,
              externalReference: null,
              paperApplications: [
                {
                  id: "id",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  language: LanguagesEnum.en,
                  assets: {
                    id: "id",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    fileId: "paper-application-id",
                    label: "Asset label",
                  },
                },
              ],
              phoneNumber: null,
            },
          ],
          listingsApplicationMailingAddress: {
            id: "id",
            createdAt: new Date(),
            updatedAt: new Date(),
            city: "Mailing address city",
            street: "Mailing address street",
            street2: "Mailing address unit",
            zipCode: "12345",
            state: "CO",
            latitude: 1,
            longitude: 2,
          },
          postmarkedApplicationsReceivedByDate: null,
        }}
        preview={false}
        setShowDownloadModal={() => null}
      />
    )
    expect(getByText("How to Apply")).toBeDefined()
    const dueDateString = getDateString(dueDate, `MMM DD, YYYY [${t("t.at")}] hh:mm A`)
    expect(
      getByText(
        `Applications must be received by the deadline. If sending by U.S. Mail, the application must be postmarked by ${dueDateString}. ${listing.developer} is not responsible for lost or delayed mail.`
      )
    )

    expect(queryByText("Apply Online")).toBeNull()
  })
})

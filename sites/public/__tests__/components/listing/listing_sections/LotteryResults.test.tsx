import React from "react"
import dayjs from "dayjs"
import { render, cleanup } from "@testing-library/react"
import {
  ListingEventsTypeEnum,
  ListingsStatusEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { LotteryResults } from "../../../../src/components/listing/listing_sections/LotteryResults"

afterEach(cleanup)

describe("<LotteryResults>", () => {
  it("shows nothing if no url", () => {
    const { queryByText } = render(
      <LotteryResults
        listingStatus={ListingsStatusEnum.closed}
        lotteryResultsEvent={{
          id: "id",
          createdAt: new Date(),
          updatedAt: new Date(),
          type: ListingEventsTypeEnum.lotteryResults,
          startDate: dayjs(new Date()).add(5, "days").toDate(),
          startTime: dayjs(new Date()).add(5, "days").add(30, "minutes").toDate(),
        }}
        lotteryResultsPdfUrl={null}
      />
    )
    expect(queryByText("Lottery Results")).toBeNull()
  })
  it("shows nothing status is not closed", () => {
    const { queryByText } = render(
      <LotteryResults
        listingStatus={ListingsStatusEnum.active}
        lotteryResultsEvent={{
          id: "id",
          createdAt: new Date(),
          updatedAt: new Date(),
          type: ListingEventsTypeEnum.lotteryResults,
          startDate: dayjs(new Date()).add(5, "days").toDate(),
          startTime: dayjs(new Date()).add(5, "days").add(30, "minutes").toDate(),
        }}
        lotteryResultsPdfUrl={"pdfUrl"}
      />
    )
    expect(queryByText("Lottery Results")).toBeNull()
  })
  it("shows button if status is closed and link is present", () => {
    const lotteryDate = dayjs(new Date()).add(5, "days").add(30, "minutes").toDate()
    const { getByText, getByRole } = render(
      <LotteryResults
        listingStatus={ListingsStatusEnum.closed}
        lotteryResultsEvent={{
          id: "id",
          createdAt: new Date(),
          updatedAt: new Date(),
          type: ListingEventsTypeEnum.lotteryResults,
          startDate: lotteryDate,
          startTime: lotteryDate,
        }}
        lotteryResultsPdfUrl={"pdfUrl"}
      />
    )
    expect(getByText("Lottery Results")).toBeDefined()
    expect(getByText("Download Results")).toBeDefined()
    expect(getByText(dayjs(lotteryDate).format("MMMM D, YYYY"))).toBeDefined()
    expect(getByRole("link", { name: "Download Results" })).toHaveAttribute("href", "pdfUrl")
  })
  it("shows button if status is closed and link is present with no date", () => {
    const { getByText, getByRole } = render(
      <LotteryResults
        listingStatus={ListingsStatusEnum.closed}
        lotteryResultsEvent={{
          id: "id",
          createdAt: new Date(),
          updatedAt: new Date(),
          type: ListingEventsTypeEnum.lotteryResults,
        }}
        lotteryResultsPdfUrl={"pdfUrl"}
      />
    )
    expect(getByText("Lottery Results")).toBeDefined()
    expect(getByText("Download Results")).toBeDefined()
    expect(getByRole("link", { name: "Download Results" })).toHaveAttribute("href", "pdfUrl")
  })
  it("shows button if status is closed and link is present with no event", () => {
    const { getByText, getByRole } = render(
      <LotteryResults
        listingStatus={ListingsStatusEnum.closed}
        lotteryResultsEvent={null}
        lotteryResultsPdfUrl={"pdfUrl"}
      />
    )
    expect(getByText("Lottery Results")).toBeDefined()
    expect(getByText("Download Results")).toBeDefined()
    expect(getByRole("link", { name: "Download Results" })).toHaveAttribute("href", "pdfUrl")
  })
})

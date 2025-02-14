import React from "react"
import { render, cleanup } from "@testing-library/react"
import { DateSection } from "../../../../src/components/listing/listing_sections/DateSection"
import { ListingEventsTypeEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import dayjs from "dayjs"
import { getTimeRangeString } from "@bloom-housing/shared-helpers"

afterEach(cleanup)

describe("<DateSection>", () => {
  it("shows nothing if no events", () => {
    const { queryByText } = render(<DateSection events={[]} heading={"Date heading"} />)
    expect(queryByText("Date heading")).toBeNull()
  })
  it("shows one event", () => {
    const startDate = dayjs(new Date()).add(5, "days").toDate()
    const startTime = dayjs(new Date()).add(5, "days").add(30, "minutes").toDate()
    const endTime = dayjs(new Date()).add(5, "days").add(60, "minutes").toDate()
    const { getByText, getByRole } = render(
      <DateSection
        events={[
          {
            type: ListingEventsTypeEnum.openHouse,
            startDate,
            startTime,
            endTime,
            label: "Link label",
            url: "https://www.exygy.com",
            note: "Event note",
          },
        ]}
        heading={"Date heading"}
      />
    )
    expect(getByText("Date heading")).toBeDefined()
    expect(getByText(dayjs(startDate).format("MMMM D, YYYY"))).toBeDefined()
    expect(getByText(getTimeRangeString(startTime, endTime))).toBeDefined()
    expect(getByRole("link", { name: "Link label" })).toHaveAttribute(
      "href",
      "https://www.exygy.com"
    )
    expect(getByText("Event note")).toBeDefined()
  })
  it("shows multiple events", () => {
    const startDate1 = dayjs(new Date()).add(5, "days").toDate()
    const startTime1 = dayjs(new Date()).add(5, "days").add(10, "minutes").toDate()
    const endTime1 = dayjs(new Date()).add(5, "days").add(20, "minutes").toDate()
    const startDate2 = dayjs(new Date()).add(6, "days").toDate()
    const startTime2 = dayjs(new Date()).add(6, "days").add(30, "minutes").toDate()
    const endTime2 = dayjs(new Date()).add(6, "days").add(40, "minutes").toDate()
    const { getByText, getByRole } = render(
      <DateSection
        events={[
          {
            type: ListingEventsTypeEnum.openHouse,
            startDate: startDate1,
            startTime: startTime1,
            endTime: endTime1,
            label: "Link label 1",
            url: "https://www.exygy1.com",
            note: "Event note 1",
          },
          {
            type: ListingEventsTypeEnum.openHouse,
            startDate: startDate2,
            startTime: startTime2,
            endTime: endTime2,
            label: "Link label 2",
            url: "https://www.exygy2.com",
            note: "Event note 2",
          },
        ]}
        heading={"Date heading"}
      />
    )
    expect(getByText("Date heading")).toBeDefined()
    expect(getByText(dayjs(startDate1).format("MMMM D, YYYY"))).toBeDefined()
    expect(getByText(getTimeRangeString(startTime1, endTime1))).toBeDefined()
    expect(getByRole("link", { name: "Link label 1" })).toHaveAttribute(
      "href",
      "https://www.exygy1.com"
    )
    expect(getByText("Event note 1")).toBeDefined()

    expect(getByText(dayjs(startDate2).format("MMMM D, YYYY"))).toBeDefined()
    expect(getByText(getTimeRangeString(startTime2, endTime2))).toBeDefined()
    expect(getByRole("link", { name: "Link label 2" })).toHaveAttribute(
      "href",
      "https://www.exygy2.com"
    )
    expect(getByText("Event note 2")).toBeDefined()
  })

  it("defaults link text", () => {
    const { getByText } = render(
      <DateSection
        events={[
          {
            type: ListingEventsTypeEnum.openHouse,
            url: "https://www.exygy.com",
          },
        ]}
        heading={"Date heading"}
      />
    )
    expect(getByText("Date heading")).toBeDefined()
    expect(getByText("See Video")).toBeDefined()
  })
})

import React from "react"
import { render, cleanup } from "@testing-library/react"
import { Availability } from "../../../../src/components/listing/listing_sections/Availability"
import {
  ListingsStatusEnum,
  ReviewOrderTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"

afterEach(cleanup)

describe("<Availability>", () => {
  it("shows nothing if listing is closed with no reserved community type", () => {
    const { queryByText } = render(
      <Availability
        reservedCommunityDescription={null}
        reservedCommunityType={null}
        reviewOrder={ReviewOrderTypeEnum.firstComeFirstServe}
        status={ListingsStatusEnum.closed}
        unitsAvailable={100}
        waitlistOpenSpots={null}
      />
    )
    expect(queryByText("Reserved Building")).toBeNull()
    expect(queryByText("Senior Building")).toBeNull()
    expect(queryByText("Vacant Units Available")).toBeNull()
    expect(queryByText("Waitlist is open")).toBeNull()
  })
  it("shows senior reserved community type while listing is closed", () => {
    const { getByText } = render(
      <Availability
        reservedCommunityDescription={null}
        reservedCommunityType={{ id: "id", name: "senior" }}
        reviewOrder={ReviewOrderTypeEnum.firstComeFirstServe}
        status={ListingsStatusEnum.closed}
        unitsAvailable={100}
        waitlistOpenSpots={null}
      />
    )
    expect(getByText("Senior Building")).toBeDefined()
    expect(getByText("Seniors")).toBeDefined()
  })
  it("shows reserved community type while listing is closed", () => {
    const { getByText, queryByText } = render(
      <Availability
        reservedCommunityDescription={null}
        reservedCommunityType={{ id: "id", name: "veteran" }}
        reviewOrder={ReviewOrderTypeEnum.firstComeFirstServe}
        status={ListingsStatusEnum.closed}
        unitsAvailable={100}
        waitlistOpenSpots={null}
      />
    )
    expect(getByText("Reserved Building")).toBeDefined()
    expect(getByText("Veteran")).toBeDefined()
    expect(queryByText("Vacant Units Available")).toBeNull()
    expect(queryByText("Waitlist is open")).toBeNull()
  })
  it("shows reserved community type, description, availability while listing is open with fcfs type", () => {
    const { getByText, queryByText } = render(
      <Availability
        reservedCommunityDescription={"Reserved community type description"}
        reservedCommunityType={{ id: "id", name: "veteran" }}
        reviewOrder={ReviewOrderTypeEnum.firstComeFirstServe}
        status={ListingsStatusEnum.active}
        unitsAvailable={100}
        waitlistOpenSpots={null}
      />
    )
    expect(getByText("Reserved Building")).toBeDefined()
    expect(getByText("Veteran")).toBeDefined()
    expect(getByText("Reserved community type description")).toBeDefined()
    expect(getByText("Vacant Units Available")).toBeDefined()
    expect(getByText("100 Vacant Units")).toBeDefined()
    expect(
      getByText(
        "Eligible applicants will be contacted on a first come first serve basis until vacancies are filled."
      )
    ).toBeDefined()
    expect(queryByText("Waitlist is open")).toBeNull()
  })

  it("shows availability with lottery type", () => {
    const { getByText, queryByText } = render(
      <Availability
        reservedCommunityDescription={null}
        reservedCommunityType={null}
        reviewOrder={ReviewOrderTypeEnum.lottery}
        status={ListingsStatusEnum.active}
        unitsAvailable={100}
        waitlistOpenSpots={null}
      />
    )
    expect(getByText("Vacant Units Available")).toBeDefined()
    expect(getByText("100 Vacant Units")).toBeDefined()
    expect(
      getByText("Applicants will be reviewed in lottery rank order until all vacancies are filled.")
    ).toBeDefined()
    expect(queryByText("Waitlist is open")).toBeNull()
    expect(queryByText("Reserved Building")).toBeNull()
  })
  it("shows availability for one unit with lottery type", () => {
    const { getByText, queryByText } = render(
      <Availability
        reservedCommunityDescription={null}
        reservedCommunityType={null}
        reviewOrder={ReviewOrderTypeEnum.lottery}
        status={ListingsStatusEnum.active}
        unitsAvailable={1}
        waitlistOpenSpots={null}
      />
    )
    expect(getByText("Vacant Units Available")).toBeDefined()
    expect(getByText("1 Vacant Unit")).toBeDefined()
    expect(
      getByText("Applicants will be reviewed in lottery rank order until all vacancies are filled.")
    ).toBeDefined()
    expect(queryByText("Waitlist is open")).toBeNull()
    expect(queryByText("Reserved Building")).toBeNull()
  })
  it("shows availability with waitlist type and spots", () => {
    const { getByText, queryByText } = render(
      <Availability
        reservedCommunityDescription={null}
        reservedCommunityType={null}
        reviewOrder={ReviewOrderTypeEnum.waitlist}
        status={ListingsStatusEnum.active}
        unitsAvailable={null}
        waitlistOpenSpots={100}
      />
    )
    expect(getByText("Waitlist is open")).toBeDefined()
    expect(getByText("100 Open Waitlist Slots")).toBeDefined()
    expect(getByText("Submit an application for an open slot on the waitlist.")).toBeDefined()
    expect(queryByText("Vacant Units Available")).toBeNull()
  })
  it("shows availability while listing is open with no spots entered", () => {
    const { queryByText } = render(
      <Availability
        reservedCommunityDescription={null}
        reservedCommunityType={null}
        reviewOrder={ReviewOrderTypeEnum.waitlist}
        status={ListingsStatusEnum.active}
        unitsAvailable={null}
        waitlistOpenSpots={null}
      />
    )
    expect(queryByText("Waitlist Slot", { exact: false })).toBeNull()
    expect(queryByText("Vacant Unit", { exact: false })).toBeNull()
  })
})

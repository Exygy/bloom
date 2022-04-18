import React from "react"
import { render, cleanup } from "@testing-library/react"
import { ContactAddress } from "page_components/listing/listing_sidebar/ContactAddress"
import { ArcherListing } from "@bloom-housing/backend-core/types/src/archer-listing"

afterEach(cleanup)

describe("<SidebarAddress>", () => {
  it("renders with address", () => {
    const { getByText } = render(<ContactAddress address={ArcherListing.buildingAddress} />)
    expect(getByText(ArcherListing.buildingAddress?.street || "", { exact: false })).toBeTruthy()
    expect(getByText("Get Directions")).toBeTruthy()
  })
  it("renders with office hours and no address", () => {
    const { getByText, queryByText } = render(
      <ContactAddress officeHours={"These are my office hours"} />
    )
    expect(queryByText("Get Directions")).toBeNull()
    expect(getByText("These are my office hours")).toBeTruthy()
  })
})

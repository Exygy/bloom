import React from "react"
import { render } from "@testing-library/react"
import { listing, jurisdiction } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import { ListingViewSeeds } from "../../../src/components/listing/ListingViewSeeds"

describe("<ListingViewSeeds>", () => {
  it("shows error state if listing is null", () => {
    const view = render(<ListingViewSeeds listing={null} jurisdiction={jurisdiction} />)
    expect(view.getByText("Page Not Found")).toBeDefined()
    expect(view.queryByText(listing.name)).toBeNull()
  })

  it("shows listing name if listing is defined", () => {
    const view = render(<ListingViewSeeds listing={listing} jurisdiction={jurisdiction} />)
    expect(view.getByRole("heading", { level: 1 })).toHaveTextContent(listing.name)
  })
})

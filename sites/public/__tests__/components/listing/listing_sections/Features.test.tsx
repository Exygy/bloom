import React from "react"
import { render, cleanup } from "@testing-library/react"
import { Features } from "../../../../src/components/listing/listing_sections/Features"

afterEach(cleanup)

describe("<Features>", () => {
  it("shows children if no features", () => {
    const { getByText, getAllByText } = render(<Features features={[]}>{"Children"}</Features>)
    expect(getByText("Children")).toBeDefined()
    expect(getAllByText("Features").length).toBeGreaterThan(0)
    expect(getAllByText("Amenities, unit details and additional fees").length).toBeGreaterThan(0)
  })
  it("shows features and children", () => {
    const { getByText, getAllByText } = render(
      <Features
        features={[
          { heading: "Heading 1", subheading: "Subheading 1" },
          { heading: "Heading 2", subheading: "Subheading 2" },
        ]}
      >
        {"Children"}
      </Features>
    )
    expect(getAllByText("Features").length).toBeGreaterThan(0)
    expect(getAllByText("Amenities, unit details and additional fees").length).toBeGreaterThan(0)
    expect(getByText("Children")).toBeDefined()
    expect(getByText("Heading 1")).toBeDefined()
    expect(getByText("Subheading 1")).toBeDefined()
    expect(getByText("Heading 2")).toBeDefined()
    expect(getByText("Subheading 2")).toBeDefined()
  })
})

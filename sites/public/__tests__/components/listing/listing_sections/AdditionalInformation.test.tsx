import React from "react"
import { render, cleanup } from "@testing-library/react"
import { AdditionalInformation } from "../../../../src/components/listing/listing_sections/AdditionalInformation"

afterEach(cleanup)

describe("<AdditionalInformation>", () => {
  it("shows all content", () => {
    const { getByText, getAllByText } = render(
      <AdditionalInformation
        additionalInformation={[
          {
            heading: "Additional information 1 heading",
            description: "Description for additional information 1",
          },
          {
            heading: "Additional information 2 heading",
            description: "Description for additional information 2",
          },
        ]}
      />
    )
    expect(getAllByText("Additional Information").length).toBeGreaterThan(0)
    expect(getAllByText("Required documents and selection criteria").length).toBeGreaterThan(0)
    expect(getByText("Additional information 1 heading")).toBeDefined()
    expect(getByText("Description for additional information 1")).toBeDefined()
    expect(getByText("Additional information 2 heading")).toBeDefined()
    expect(getByText("Description for additional information 2")).toBeDefined()
  })
  it("shows nothing if no additional information passed", () => {
    const { queryByText } = render(<AdditionalInformation additionalInformation={[]} />)
    expect(queryByText("Additional information")).toBeNull()
  })
})

import React from "react"
import { render, cleanup } from "@testing-library/react"
import { Eligibility } from "../../../../src/components/listing/listing_sections/Eligibility"

afterEach(cleanup)

describe("<Eligibility>", () => {
  it("shows nothing if no sections", () => {
    const { queryByText } = render(<Eligibility eligibilitySections={[]} />)
    expect(queryByText("Eligibility")).toBeNull()
  })
  it("shows multiple ordered sections", () => {
    const { getAllByText, getByText } = render(
      <Eligibility
        eligibilitySections={[
          {
            header: "Section One",
            subheader: "Subheader One",
            content: "Content One",
            note: "Note One",
          },
          {
            header: "Section Two",
            subheader: "Subheader Two",
            content: "Content Two",
            note: "Note Two",
          },
          {
            header: "Section Three",
            subheader: "Subheader Three",
            content: "Content Three",
            note: "Note Three",
          },
        ]}
      />
    )
    expect(getAllByText("Eligibility").length).toBeGreaterThan(0)
    expect(getAllByText("Income, occupancy, preferences, and subsidies").length).toBeGreaterThan(0)
    expect(getByText("1")).toBeDefined()
    expect(getByText("Section One")).toBeDefined()
    expect(getByText("Subheader One")).toBeDefined()
    expect(getByText("Content One")).toBeDefined()
    expect(getByText("Note One")).toBeDefined()
    expect(getByText("2")).toBeDefined()
    expect(getByText("Section Two")).toBeDefined()
    expect(getByText("Subheader Two")).toBeDefined()
    expect(getByText("Content Two")).toBeDefined()
    expect(getByText("Note Two")).toBeDefined()
    expect(getByText("3")).toBeDefined()
    expect(getByText("Section Three")).toBeDefined()
    expect(getByText("Subheader Three")).toBeDefined()
    expect(getByText("Content Three")).toBeDefined()
    expect(getByText("Note Three")).toBeDefined()
  })
})

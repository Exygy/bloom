import React from "react"
import { render, cleanup } from "@testing-library/react"
import { DueDate } from "../../../../src/components/listing/listing_sections/DueDate"

afterEach(cleanup)

describe("<DueDate>", () => {
  it("shows nothing if no content", () => {
    const { queryByText } = render(<DueDate content={[]} />)
    expect(queryByText("Application Due Date")).toBeNull()
    expect(queryByText("First Come First Serve")).toBeNull()
  })
  it("shows multiple content rows", () => {
    const { getByText } = render(<DueDate content={["Row 1", "Row 2"]} />)
    expect(getByText("Row 1")).toBeDefined()
    expect(getByText("Row 2")).toBeDefined()
  })
})

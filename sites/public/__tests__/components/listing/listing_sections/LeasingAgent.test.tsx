import React from "react"
import { render, cleanup } from "@testing-library/react"

import { LeasingAgent } from "../../../../src/components/listing/listing_sections/LeasingAgent"

afterEach(cleanup)

describe("<LeasingAgent>", () => {
  it("shows nothing if no content passed", () => {
    const { queryByText } = render(<LeasingAgent />)
    expect(queryByText("Leasing Agent")).toBeNull()
  })
  it("shows all content", () => {
    const phoneNumber = "(123) 456-7890"
    const { getByText, getByRole } = render(
      <LeasingAgent
        address={{
          id: "id",
          createdAt: new Date(),
          updatedAt: new Date(),
          city: "Address city",
          street: "Address street",
          street2: "Address unit",
          zipCode: "67890",
          state: "CA",
          latitude: 1,
          longitude: 2,
        }}
        email={"leasing@agent.com"}
        name={"Agent Name"}
        officeHours={"Leasing office hours"}
        phone={phoneNumber}
        title={"Agent title"}
      />
    )
    expect(getByText("Contact Leasing Agent")).toBeDefined()
    expect(getByText("Agent Name")).toBeDefined()
    expect(getByText("Agent title")).toBeDefined()
    expect(getByRole("link", { name: `Call ${phoneNumber}` })).toHaveAttribute(
      "href",
      "tel:123 4567890"
    )
    expect(getByRole("link", { name: "Email" })).toHaveAttribute("href", "mailto:leasing@agent.com")
    expect(getByText("Due to high call volume you may hear a message.")).toBeDefined()
    expect(getByText("Address street, Address unit")).toBeDefined()
    expect(getByText("Address city, CA 67890")).toBeDefined()
    expect(getByRole("link", { name: "Get Directions" })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/place/Address street, Address unit, Address city, CA 67890"
    )
    expect(getByText("Office Hours")).toBeDefined()
    expect(getByText("Leasing office hours")).toBeDefined()
  })
})

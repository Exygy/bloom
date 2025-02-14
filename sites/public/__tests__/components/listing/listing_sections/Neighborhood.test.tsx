import React from "react"
import { render, cleanup } from "@testing-library/react"
import { Neighborhood } from "../../../../src/components/listing/listing_sections/Neighborhood"

afterEach(cleanup)

describe("<Neighborhood>", () => {
  it("shows all content", () => {
    const { getByText, getAllByText } = render(
      <Neighborhood
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
        name={"Listing name"}
      />
    )
    expect(getAllByText("Neighborhood").length).toBeGreaterThan(0)
    expect(getAllByText("Location and transportation").length).toBeGreaterThan(0)
    expect(getByText("Get Directions")).toBeDefined()
  })
})

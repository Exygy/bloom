import React from "react"
import { render, cleanup } from "@testing-library/react"
import { FurtherInformation } from "../../../../src/components/listing/listing_sections/FurtherInformation"

afterEach(cleanup)

describe("<FurtherInformation>", () => {
  it("shows both content and phone number", () => {
    const phoneNumber = "(123) 456-7890"
    const { getByText } = render(
      <FurtherInformation instructions={"Further instructions"} phoneNumber={"(123) 456-7890"} />
    )
    expect(getByText("For further information")).toBeDefined()
    expect(getByText(`Call ${phoneNumber}`)).toBeDefined()
    expect(getByText("Further instructions")).toBeDefined()
  })
  it("shows default instructions", () => {
    const { getByText } = render(<FurtherInformation />)
    expect(getByText("For further information")).toBeDefined()
    expect(
      getByText(
        "The permanent supportive housing units are referred directly through <JURISDICTION> Coordinated Entry System. Households experiencing homelessness can call <PHONE_NUMBER> in order to get connected to an Access Point to learn more about the coordinated entry system and access housing-related resources and information."
      )
    ).toBeDefined()
  })
})

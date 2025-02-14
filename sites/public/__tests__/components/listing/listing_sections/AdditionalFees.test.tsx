import React from "react"
import { render, cleanup } from "@testing-library/react"
import { AdditionalFees } from "../../../../src/components/listing/listing_sections/AdditionalFees"

afterEach(cleanup)

describe("<AdditionalFees>", () => {
  it("shows nothing if no content", () => {
    const { queryByText } = render(
      <AdditionalFees
        applicationFee={null}
        costsNotIncluded={null}
        depositHelperText={null}
        depositMax={null}
        depositMin={null}
        utilitiesIncluded={[]}
      />
    )
    expect(queryByText("Additional Fees")).toBeNull()
  })
  it("renders all content", () => {
    const { getByText } = render(
      <AdditionalFees
        applicationFee={"50"}
        costsNotIncluded={"Costs not included"}
        depositHelperText={"Deposit helper text"}
        depositMax={"200"}
        depositMin={"100"}
        utilitiesIncluded={["Water, Electricity"]}
      />
    )
    expect(getByText("Additional Fees")).toBeDefined()
    expect(getByText("Application Fee")).toBeDefined()
    expect(getByText("per applicant age 18 and over")).toBeDefined()
    expect(getByText("Due at interview")).toBeDefined()
    expect(getByText("$50")).toBeDefined()
    expect(getByText("Deposit")).toBeDefined()
    expect(getByText("$100 – $200", { exact: false })).toBeDefined()
    expect(getByText("Utilities Included")).toBeDefined()
    expect(getByText("Water, Electricity")).toBeDefined()
  })
  it("renders all content except utilities included", () => {
    const { getByText, queryByText } = render(
      <AdditionalFees
        applicationFee={"50"}
        costsNotIncluded={"Costs not included"}
        depositHelperText={"Deposit helper text"}
        depositMax={"200"}
        depositMin={"100"}
        utilitiesIncluded={[]}
      />
    )
    expect(getByText("Additional Fees")).toBeDefined()
    expect(getByText("Application Fee")).toBeDefined()
    expect(getByText("per applicant age 18 and over")).toBeDefined()
    expect(getByText("Due at interview")).toBeDefined()
    expect(getByText("$50")).toBeDefined()
    expect(getByText("Deposit")).toBeDefined()
    expect(getByText("$100 – $200", { exact: false })).toBeDefined()
    expect(queryByText("Utilities Included")).toBeNull()
  })
  it("renders just deposit min", () => {
    const { getByText } = render(
      <AdditionalFees
        applicationFee={null}
        costsNotIncluded={null}
        depositHelperText={null}
        depositMax={null}
        depositMin={"100"}
        utilitiesIncluded={[]}
      />
    )
    expect(getByText("Additional Fees")).toBeDefined()
    expect(getByText("Deposit")).toBeDefined()
    expect(getByText("$100", { exact: false })).toBeDefined()
  })
  it("renders just deposit max", () => {
    const { getByText } = render(
      <AdditionalFees
        applicationFee={null}
        costsNotIncluded={null}
        depositHelperText={null}
        depositMax={"200"}
        depositMin={null}
        utilitiesIncluded={[]}
      />
    )
    expect(getByText("Additional Fees")).toBeDefined()
    expect(getByText("Deposit")).toBeDefined()
    expect(getByText("$200", { exact: false })).toBeDefined()
  })
})

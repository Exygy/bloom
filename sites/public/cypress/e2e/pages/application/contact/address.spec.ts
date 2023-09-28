describe("applications/contact/address", function () {
  const route = "/applications/contact/address"

  beforeEach(() => {
    cy.visit(route)
  })

  // TODO: unskip after applications are implemented on the front end
  it.skip("should render the primary applicant address sub-form", function () {
    cy.get("form").should("be.visible")
    cy.location("pathname").should("include", route)
  })

  // TODO: unskip after applications are implemented on the front end
  it.skip("should require form input", function () {
    cy.goNext()
    cy.checkErrorAlert("be.visible")
    cy.checkErrorMessages("be.visible")
  })

  // TODO: unskip after applications are implemented on the front end
  it.skip("should disable phone number & phone number type fields when user indicates they have no phone number", function () {
    cy.getByTestId("app-primary-no-phone").check()
    cy.getPhoneFieldByTestId("app-primary-phone-number").should("be.disabled")
    cy.getByTestId("app-primary-phone-number-type").should("be.disabled")
    cy.getByTestId("app-primary-additional-phone").should("be.disabled")
    cy.reload()
  })

  // TODO: unskip after applications are implemented on the front end
  it.skip("should provide a way to validate address via API", function () {
    // fake the address call to the mocked data
    cy.intercept("GET", "/geocoding/v5/**", { fixture: "address" })
    cy.getByTestId("app-primary-no-phone").check()

    cy.getByTestId("app-primary-address-street").type("600 Mongomery St")
    cy.getByTestId("app-primary-address-city").type("San Francisco")
    cy.getByTestId("app-primary-address-state").select("CA")
    cy.getByTestId("app-primary-address-zip").type("94112")

    cy.getByTestId("app-primary-contact-preference").eq(0).check()
    cy.getByTestId("app-primary-work-in-region-no").check()

    cy.goNext()
    cy.getByTestId("app-found-address-label").should("be.visible")
    cy.getByTestId("app-found-address-label").should("include.text", "Montgomery St")
    cy.getByTestId("app-found-address-label").should("include.text", "94111")
    cy.reload()
  })

  // TODO: unskip after applications are implemented on the front end
  it.skip("should handle garbage input", function () {
    // fake the address call to the mocked data
    cy.intercept("GET", "/geocoding/v5/**", { fixture: "address-bad" })
    cy.getByTestId("app-primary-no-phone").check()

    // Let's add gibberish
    cy.getByTestId("app-primary-address-street").type("l;iaj;ewlijvlij")
    cy.getByTestId("app-primary-address-city").type("San Francisco")
    cy.getByTestId("app-primary-address-state").select("CA")
    cy.getByTestId("app-primary-address-zip").type("oqr8buoi@@hn")

    cy.getByTestId("app-primary-contact-preference").eq(0).check()
    cy.getByTestId("app-primary-work-in-region-no").check()

    cy.goNext()

    cy.checkErrorAlert("not.exist")
    cy.checkErrorMessages("not.exist")
    cy.get(`[data-testid="app-found-address-label"]`).should("not.exist")

    // Let's go back and add other weirdness
    cy.getByTestId("app-edit-original-address").click()
    cy.getByTestId("app-primary-address-street").clear().type("98765 NW 10")
    cy.getByTestId("app-primary-address-zip").clear().type("54321")

    cy.goNext()

    cy.checkErrorAlert("not.exist")
    cy.checkErrorMessages("not.exist")
    cy.get(`[data-testid="app-found-address-label"]`).should("not.exist")
  })
})

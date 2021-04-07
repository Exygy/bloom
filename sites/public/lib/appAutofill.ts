import {
  Address,
  Application,
  ApplicationStatus,
  ApplicationSubmissionType,
  Language,
} from "@bloom-housing/backend-core/types"

class AutofillCleaner {
  application: Application = null

  constructor(application: Application) {
    this.application = application
  }

  clean() {
    // prettier-ignore
    this.
      addDefaults().
      removeAdditionalKeys().
      removeLiveWorkAddresses()

    console.info("Behold!", this.application)
    return this.application
  }

  addDefaults() {
    ;["id", "createdAt", "updatedAt", "deletedAt", "listing", "submissionDate"].forEach((key) => {
      delete this.application[key]
    })

    this.application["completedSections"] = 0 // only used on frontend
    this.application["wasAutofilled"] = true // only used on frontend
    this.application.submissionType = ApplicationSubmissionType.electronical
    this.application.language = Language.en
    this.application.acceptedTerms = false
    this.application.status = ApplicationStatus.submitted
    this.application.preferences = []

    return this
  }

  removeAdditionalKeys() {
    const unsetIdentifiers = (obj: { id: string; createdAt: Date; updatedAt: Date }) => {
      delete obj.id
      delete obj.createdAt
      delete obj.updatedAt
    }

    unsetIdentifiers(this.application.accessibility)
    unsetIdentifiers(this.application.applicant)
    unsetIdentifiers(this.application.mailingAddress)

    if (this.application.alternateAddress) unsetIdentifiers(this.application.alternateAddress)

    this.application.householdMembers.forEach((member, index) => {
      unsetIdentifiers(member)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      member.id = index // id is a string on the server but we need an integer here
      if (member.address) unsetIdentifiers(member.address)
      if (member.workAddress) unsetIdentifiers(member.workAddress)
    })
    unsetIdentifiers(this.application.demographics)

    if (this.application.alternateContact) {
      unsetIdentifiers(this.application.alternateContact)
      if (this.application.alternateContact.mailingAddress) {
        unsetIdentifiers(this.application.alternateContact.mailingAddress)
      }
    }

    return this
  }

  removeLiveWorkAddresses() {
    this.application.applicant.workInRegion = null
    this.application.applicant.workAddress = {
      street: "",
      street2: "",
      city: "",
      state: "",
      zipCode: "",
      county: "",
      latitude: null,
      longitude: null,
    } as Address

    return this
  }
}

export default AutofillCleaner

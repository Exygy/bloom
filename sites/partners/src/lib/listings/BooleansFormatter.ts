import { YesNoEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import Formatter from "./Formatter"
import { addressTypes } from "./formTypes"

export default class BooleansFormatter extends Formatter {
  /** Format all of the Yes/No questions in the form */
  process() {
    this.processBoolean("applicationDropOffAddressType", {
      when:
        this.data.canApplicationsBeDroppedOff === YesNoEnum.yes &&
        addressTypes[this.data.whereApplicationsDroppedOff] !== addressTypes.anotherAddress,
      trueCase: () => addressTypes[this.data.whereApplicationsDroppedOff],
    })
    this.processBoolean("applicationPickUpAddressType", {
      when:
        this.data.canPaperApplicationsBePickedUp === YesNoEnum.yes &&
        addressTypes[this.data.whereApplicationsPickedUp] !== addressTypes.anotherAddress,
      trueCase: () => addressTypes[this.data.whereApplicationsPickedUp],
    })
    this.processBoolean("applicationMailingAddressType", {
      when:
        this.data.canApplicationsBeMailedIn === YesNoEnum.yes &&
        addressTypes[this.data.whereApplicationsMailedIn] !== addressTypes.anotherAddress,
      trueCase: () => addressTypes[this.data.whereApplicationsMailedIn],
    })
    this.processBoolean("listingsApplicationDropOffAddress", {
      when:
        this.data.canApplicationsBeDroppedOff === YesNoEnum.yes &&
        this.data.whereApplicationsDroppedOff === addressTypes.anotherAddress,
      trueCase: () => this.data.listingsApplicationDropOffAddress,
    })
    this.processBoolean("listingsApplicationPickUpAddress", {
      when:
        this.data.canPaperApplicationsBePickedUp === YesNoEnum.yes &&
        this.data.whereApplicationsPickedUp === addressTypes.anotherAddress,
      trueCase: () => this.data.listingsApplicationPickUpAddress,
    })
    this.processBoolean("listingsApplicationMailingAddress", {
      when:
        this.data.canApplicationsBeMailedIn === YesNoEnum.yes &&
        this.data.whereApplicationsMailedIn === addressTypes.anotherAddress,
      trueCase: () => this.data.listingsApplicationMailingAddress,
    })
    this.processBoolean("listingImages", {
      when:
        this.data.listingImages?.length &&
        !!this.data.listingImages[0].assets.fileId &&
        !!this.data.listingImages[0].assets.label,
      trueCase: () => {
        return this.data.listingImages.map((listingImages) => {
          return { ordinal: listingImages.ordinal, assets: listingImages.assets }
        })
      },
    })
    // assets are no longer needed and should be removed https://github.com/bloom-housing/bloom/issues/3747
    this.data.assets = []
    this.processBoolean("digitalApplication", {
      when: this.data.digitalApplicationChoice === YesNoEnum.yes,
      falseCase: () => (this.data.digitalApplicationChoice === YesNoEnum.no ? false : null),
    })
    this.data.commonDigitalApplication = this.data.commonDigitalApplicationChoice === YesNoEnum.yes

    this.processBoolean("paperApplication", {
      when: this.data.paperApplicationChoice === YesNoEnum.yes,
      falseCase: () => (this.data.paperApplicationChoice === YesNoEnum.no ? false : null),
    })

    this.processBoolean("referralOpportunity", {
      when: this.data.referralOpportunityChoice === YesNoEnum.yes,
      falseCase: () => (this.data.referralOpportunityChoice === YesNoEnum.no ? false : null),
    })

    if (
      this.data.reviewOrderQuestion !== "reviewOrderLottery" ||
      this.data.listingAvailabilityQuestion === "openWaitlist"
    ) {
      this.data.lotteryOptIn = null
    } else {
      this.processBoolean("lotteryOptIn", {
        when: this.data.lotteryOptInQuestion === YesNoEnum.yes,
        falseCase: () => (this.data.lotteryOptInQuestion === YesNoEnum.no ? false : null),
      })
      if (this.data.lotteryOptIn === null) delete this.data.lotteryOptIn
    }

    this.processBoolean("includeCommunityDisclaimer", {
      when: this.data.includeCommunityDisclaimerQuestion === YesNoEnum.yes,
      falseCase: () =>
        this.data.includeCommunityDisclaimerQuestion === YesNoEnum.no ? false : null,
    })

    this.processBoolean("section8Acceptance", {
      when: this.data.listingSection8Acceptance === YesNoEnum.yes,
      falseCase: () => (this.data.listingSection8Acceptance === YesNoEnum.no ? false : null),
    })
  }
}

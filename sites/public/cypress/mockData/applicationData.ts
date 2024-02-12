import {
  Application,
  ApplicationStatus,
  ApplicationSubmissionType,
  IncomePeriod,
  Language,
} from "@bloom-housing/backend-core/types"

const idDefaults = {
  id: "abcd1234",
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const contactPreferencesCheckboxesOrder = ["email", "phone", "letter", "text"]
export const alternateContactTypeRadioOrder = [
  "familyMember",
  "friend",
  "caseManager",
  "other",
  "dontHave",
]

export const preferredUnitCheckboxesOrder = [
  "Studio",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "3+ Bedroom",
]

export const howDidYouHearCheckboxesOrder = [
  "jurisdictionWebsite",
  "developerWebsite",
  "flyer",
  "emailAlert",
  "friend",
  "housingCounselor",
  "radioAd",
  "busAd",
  "other",
]

export const raceCheckboxesOrder = [
  "americanIndianAlaskanNative",
  "asian",
  "asian-asianIndian",
  "asian-chinese",
  "asian-filipino",
  "asian-korean",
  "asian-vietnamese",
  "asian-otherAsian",
  "blackAfricanAmerican",
  "nativeHawaiianOtherPacificIslander",
  "nativeHawaiianOtherPacificIslander-nativeHawaiian",
  "nativeHawaiianOtherPacificIslander-guamanianOrChamorro",
  "nativeHawaiianOtherPacificIslander-samoan",
  "white",
  "otherMultiracial",
  "declineToRespond",
]

export const coliseumApplication: Application = {
  markedAsDuplicate: false,
  ...idDefaults,
  listing: {
    id: "abcd1234",
  },
  applicant: {
    ...idDefaults,
    phoneNumber: "(444) 444-4444",
    noPhone: false,
    phoneNumberType: "work",
    workInRegion: "yes",
    address: {
      ...idDefaults,
      street: "600 Montgomery St",
      street2: "Unit",
      city: "San Francisco",
      state: "CA",
      zipCode: "94111",
      county: "",
      latitude: null,
      longitude: null,
    },
    workAddress: {
      ...idDefaults,
      street: "Work Street",
      street2: "Work Unit",
      city: "Work City",
      state: "AL",
      zipCode: "90221",
      county: "",
      latitude: null,
      longitude: null,
    },
    firstName: "First Name",
    middleName: "Middle Name",
    lastName: "Last Name",
    birthMonth: "07",
    birthDay: "17",
    birthYear: "1996",
    emailAddress: "test@bloom.com",
    noEmail: false,
  },
  additionalPhone: true,
  additionalPhoneNumber: "(555) 555-5555",
  additionalPhoneNumberType: "home",
  contactPreferences: ["email"],
  householdSize: 2,
  housingStatus: "",
  sendMailToMailingAddress: true,
  householdExpectingChanges: true,
  householdStudent: true,
  mailingAddress: {
    ...idDefaults,
    street: "Mailing Street",
    street2: "Mailing Unit",
    city: "Mailing City",
    state: "AK",
    zipCode: "90220",
  },
  alternateAddress: {
    ...idDefaults,
    street: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
  },
  alternateContact: {
    ...idDefaults,
    type: "other",
    firstName: "Alternate Name",
    lastName: "Alternate Last Name",
    agency: "Agency Name",
    phoneNumber: "(333) 333-3333",
    otherType: "Other Relationship",
    emailAddress: "test2@bloom.com",
    mailingAddress: {
      ...idDefaults,
      street: "Contact Street",
      street2: "Contact Street 2",
      city: "Contact City",
      state: "AK",
      zipCode: "90222",
    },
  },
  accessibility: {
    ...idDefaults,
    mobility: true,
    vision: false,
    hearing: false,
  },
  incomeVouchers: false,
  income: "3000.00",
  incomePeriod: IncomePeriod.perMonth,
  householdMembers: [
    {
      ...idDefaults,
      firstName: "Member Name",
      middleName: "Member Middle Name",
      lastName: "Member Last Name",
      birthMonth: "07",
      birthDay: "17",
      birthYear: "1996",
      emailAddress: "",
      noEmail: null,
      phoneNumber: "",
      phoneNumberType: "",
      noPhone: null,
      address: {
        ...idDefaults,
        street: "Member Street",
        street2: "Member Unit",
        city: "Member City",
        state: "AZ",
        zipCode: "90223",
      },
      workAddress: {
        ...idDefaults,
        street: "Member Work Street",
        street2: "Member Work Unit",
        city: "Member Work City",
        state: "AR",
        zipCode: "90224",
      },
      sameAddress: "no",
      relationship: "spouse",
      workInRegion: "yes",
    },
  ],
  preferredUnit: [
    {
      ...idDefaults,
      id: "dff3ff70-7085-4dab-afd9-de4b33e0ec1e",
      name: "1 Bedroom",
      numBedrooms: 1,
    },
  ],
  demographics: {
    ...idDefaults,
    race: ["race-white"],
    ethnicity: "hispanicLatino",
    gender: "",
    sexualOrientation: "",
    spokenLanguage: "",
    howDidYouHear: ["governmentWebsite", "propertyWebsite"],
  },
  preferences: [
    {
      key: "liveWork",
      claimed: true,
      options: [
        {
          key: "live",
          checked: true,
          extraData: [],
        },
        {
          key: "work",
          checked: true,
          extraData: [],
        },
      ],
    },
    {
      key: "PBV",
      claimed: true,
      options: [
        {
          key: "residency",
          checked: true,
        },
        {
          key: "family",
          checked: true,
        },
        {
          key: "veteran",
          checked: false,
        },
        {
          key: "homeless",
          checked: true,
        },
        {
          key: "noneApplyButConsider",
          checked: false,
        },
        {
          key: "doNotConsider",
          checked: false,
        },
      ],
    },
    {
      key: "HOPWA",
      claimed: true,
      options: [
        {
          key: "hopwa",
          checked: true,
        },
        {
          key: "doNotConsider",
          checked: false,
        },
      ],
    },
    {
      key: "displaceeHousing",
      claimed: false,
      options: [
        {
          key: "mission",
          checked: false,
        },
        {
          key: "general",
          checked: false,
        },
      ],
    },
  ],
  programs: [
    {
      claimed: true,
      key: "servedInMilitary",
      options: [
        {
          key: "servedInMilitary",
          checked: true,
        },
        {
          key: "doNotConsider",
          checked: false,
        },
        {
          key: "preferNotToSay",
          checked: false,
        },
      ],
    },
    {
      key: "tay",
      claimed: true,
      options: [
        {
          key: "tay",
          checked: true,
        },
        {
          key: "doNotConsider",
          checked: false,
        },
        {
          key: "preferNotToSay",
          checked: false,
        },
      ],
    },
  ],
  confirmationCode: "",
  status: ApplicationStatus.draft,
  submissionType: ApplicationSubmissionType.electronical,
  language: Language.en,
}

export const minimalDataApplication: Application = {
  markedAsDuplicate: false,
  ...idDefaults,
  listing: {
    id: "abcd1234",
  },
  applicant: {
    ...idDefaults,
    phoneNumber: null,
    noPhone: true,
    phoneNumberType: null,
    workInRegion: "no",
    address: {
      ...idDefaults,
      street: "600 Montgomery St",
      street2: "Unit",
      city: "San Francisco",
      state: "CA",
      zipCode: "94111",
      county: "",
    },
    workAddress: {
      ...idDefaults,
      street: "",
      street2: "",
      city: "",
      state: "",
      zipCode: "",
    },
    firstName: "First Name",
    middleName: null,
    lastName: "Last Name",
    birthMonth: "07",
    birthDay: "17",
    birthYear: "1996",
    emailAddress: null,
    noEmail: true,
  },
  additionalPhone: false,
  additionalPhoneNumber: "",
  additionalPhoneNumberType: "",
  contactPreferences: ["letter"],
  householdSize: 1,
  housingStatus: "",
  sendMailToMailingAddress: false,
  householdExpectingChanges: false,
  householdStudent: false,
  mailingAddress: {
    ...idDefaults,
    street: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
  },
  alternateAddress: {
    ...idDefaults,
    street: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
  },
  alternateContact: {
    ...idDefaults,
    type: "dontHave",
    firstName: "",
    lastName: "",
    agency: "",
    phoneNumber: "",
    otherType: "",
    emailAddress: "",
    mailingAddress: {
      ...idDefaults,
      street: "",
      street2: "",
      city: "",
      state: "",
      zipCode: "",
    },
  },
  accessibility: {
    ...idDefaults,
    mobility: false,
    vision: false,
    hearing: false,
  },
  incomeVouchers: false,
  income: "50000",
  incomePeriod: IncomePeriod.perYear,
  householdMembers: [],
  preferredUnit: [
    {
      ...idDefaults,
      id: "dff3ff70-7085-4dab-afd9-de4b33e0ec1e",
      name: "2 Bedroom",
      numBedrooms: 2,
    },
  ],
  demographics: {
    ...idDefaults,
    howDidYouHear: [],
    race: [],
  },
  preferences: [],
  programs: [
    {
      claimed: false,
      key: "servedInMilitary",
      options: [
        {
          key: "servedInMilitary",
          checked: false,
        },
        {
          key: "doNotConsider",
          checked: false,
        },
        {
          key: "preferNotToSay",
          checked: false,
        },
      ],
    },
    {
      key: "tay",
      claimed: false,
      options: [
        {
          key: "tay",
          checked: false,
        },
        {
          key: "doNotConsider",
          checked: false,
        },
        {
          key: "preferNotToSay",
          checked: false,
        },
      ],
    },
    {
      key: "disabilityOrMentalIllness",
      claimed: false,
      options: [
        {
          key: "disabilityOrMentalIllness",
          checked: false,
        },
        {
          key: "doNotConsider",
          checked: false,
        },
        {
          key: "preferNotToSay",
          checked: false,
        },
      ],
    },
    {
      key: "housingSituation",
      claimed: false,
      options: [
        {
          key: "notPermanent",
          checked: false,
        },
        {
          key: "homeless",
          checked: false,
        },
        {
          key: "doNotConsider",
          checked: false,
        },
        {
          key: "preferNotToSay",
          checked: false,
        },
      ],
    },
    {
      key: "rentBasedOnIncome",
      claimed: true,
      options: [
        {
          key: "flatRent",
          checked: true,
        },
        {
          key: "30Percent",
          checked: true,
        },
      ],
    },
  ],
  confirmationCode: "",
  status: ApplicationStatus.draft,
  submissionType: ApplicationSubmissionType.electronical,
  language: Language.en,
}

export const applicationStepOrder = [
  { name: "chooseLanguage", route: "/applications/start/choose-language" },
  { name: "whatToExpect", route: "/applications/start/what-to-expect" },
  { name: "primaryApplicantName", route: "/applications/contact/name" },
  { name: "primaryApplicantAddress", route: "/applications/contact/address" },
  { name: "alternateContactType", route: "/applications/contact/alternate-contact-type" },
  { name: "alternateContactName", route: "/applications/contact/alternate-contact-name" },
  { name: "alternateContactInfo", route: "/applications/contact/alternate-contact-contact" },
  { name: "liveAlone", route: "/applications/household/live-alone" },
  { name: "householdMemberInfo", route: "/applications/household/members-info" },
  { name: "addMembers", route: "/applications/household/add-members" },
  { name: "preferredUnitSize", route: "/applications/household/preferred-units" },
  { name: "adaHouseholdMembers", route: "/applications/household/ada" },
  { name: "householdExpectingChanges", route: "/applications/household/changes" },
  { name: "householdStudent", route: "/applications/household/student" },
  { name: "programs", route: "/applications/programs/programs" },
  { name: "vouchersSubsidies", route: "/applications/financial/vouchers" },
  { name: "income", route: "/applications/financial/income" },
  { name: "preferencesAll", route: "/applications/preferences/all" },
  { name: "generalPool", route: "/applications/preferences/general" },
  { name: "demographics", route: "/applications/review/demographics" },
  { name: "summary", route: "/applications/review/summary" },
  { name: "terms", route: "/applications/review/terms" },
]

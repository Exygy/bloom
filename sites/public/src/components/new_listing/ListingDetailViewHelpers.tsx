import React, { useState } from "react"
import {
  ListingMultiselectQuestion,
  MultiselectQuestionsApplicationSectionEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"

export const getFilteredMultiselectQuestions = (
  multiselectQuestions: ListingMultiselectQuestion[],
  section: MultiselectQuestionsApplicationSectionEnum
) => {
  return multiselectQuestions.filter(
    (elem) =>
      elem.multiselectQuestions.applicationSection === section &&
      !elem.multiselectQuestions.hideFromListing
  )
}

export const getMultiselectQuestionData = (multiselectQuestions: ListingMultiselectQuestion[]) => {
  return multiselectQuestions.map((listingMultiselectQuestion, index) => {
    return {
      ordinal: index + 1,
      links: listingMultiselectQuestion?.multiselectQuestions?.links,
      title: listingMultiselectQuestion?.multiselectQuestions?.text,
      description: listingMultiselectQuestion?.multiselectQuestions?.description,
    }
  })
}

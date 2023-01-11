import React from "react"
import { ApplicationSection } from "@bloom-housing/backend-core/types"
import ApplicationMultiselectQuestionStep from "../../../components/applications/ApplicationMultiselectQuestionStep"

const ApplicationPrograms = () => {
  return (
    <ApplicationMultiselectQuestionStep
      applicationSection={ApplicationSection.programs}
      applicationStep={"programs"}
      applicationSectionNumber={3}
    />
  )
}

export default ApplicationPrograms

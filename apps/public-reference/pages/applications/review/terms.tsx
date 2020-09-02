/*
5.3 Terms
View of application terms with checkbox
*/
import Link from "next/link"
import Router from "next/router"
import {
  Button,
  FormCard,
  ProgressNav,
  t,
  UserContext,
  ApiClientContext,
  ErrorMessage,
  FieldGroup,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import { AppSubmissionContext } from "../../../lib/AppSubmissionContext"
import ApplicationConductor from "../../../lib/ApplicationConductor"
import React, { useContext, useMemo } from "react"
import Markdown from "markdown-to-jsx"

export default () => {
  const { conductor, application, listing } = useContext(AppSubmissionContext)
  const { applicationsService } = useContext(ApiClientContext)
  const { profile } = useContext(UserContext)

  const currentPageStep = 5
  const applicationDueDate = new Date(listing?.applicationDueDate).toDateString()

  /* Form Handler */
  const { register, handleSubmit, errors } = useForm()
  const onSubmit = (data) => {
    application.completedStep = 5
    applicationsService
      .create({
        body: {
          application,
          listing: {
            id: listing.id,
          },
          ...(profile && {
            user: {
              id: profile.id,
            },
          }),
        },
      })
      .then((result) => {
        conductor.sync()
        Router.push("/applications/review/confirmation").then(() => window.scrollTo(0, 0))
      })
  }

  const agreeField = [
    {
      id: "agree",
      label: t("application.review.terms.confirmCheckboxText"),
    },
  ]

  return (
    <FormsLayout>
      <FormCard header={listing?.name}>
        <ProgressNav
          currentPageStep={currentPageStep}
          completedSteps={application.completedStep}
          labels={["You", "Household", "Income", "Preferences", "Review"]}
        />
      </FormCard>

      <FormCard>
        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">{t("application.review.terms.title")}</h2>
        </div>
        <form id="review-terms" className="mt-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-card__pager-row">
            <Markdown options={{ disableParsingRawHTML: false }}>
              {t("application.review.terms.text", { applicationDueDate: applicationDueDate })}
            </Markdown>

            <div className="mt-4">
              <FieldGroup
                name="agree"
                type="checkbox"
                fields={agreeField}
                register={register}
                validation={{ required: true }}
                error={errors.agree}
                errorMessage={t("application.review.terms.agreeError")}
              />
            </div>
          </div>
          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button filled={true} onClick={() => false}>
                {t("application.review.terms.submit")}
              </Button>
            </div>
          </div>
        </form>
      </FormCard>
    </FormsLayout>
  )
}

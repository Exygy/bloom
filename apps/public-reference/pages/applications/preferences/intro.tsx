/*
4.1 Preferences Introduction
Instructions on how preferences work and their value
*/
import Link from "next/link"
import Router from "next/router"
import { Button, FormCard, ProgressNav, t } from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import { AppSubmissionContext } from "../../../lib/AppSubmissionContext"
import ApplicationConductor from "../../../lib/ApplicationConductor"
import { useContext, useMemo } from "react"

export default () => {
  const { conductor, application, listing } = useContext(AppSubmissionContext)
  const currentPageStep = 4

  /* Form Handler */
  const { register, handleSubmit, errors } = useForm()
  const onSubmit = (data) => {
    console.log(data)

    Router.push("/applications/preferences/live-or-work").then(() => window.scrollTo(0, 0))
  }

  return (
    <FormsLayout>
      <FormCard>
        <h5 className="font-alt-sans text-center mb-5">LISTING</h5>

        <ProgressNav
          currentPageStep={currentPageStep}
          completedSteps={application.completedStep}
          labels={["You", "Household", "Income", "Preferences", "Review"]}
        />
      </FormCard>

      <FormCard>
        <p className="text-bold">
          <strong>
            <Link href="/applications/financial/income">
              <a>{t("t.back")}</a>
            </Link>
          </strong>
        </p>

        <h2 className="form-card__title is-borderless">Preferences Introduction</h2>

        <hr />

        <form className="mt-10" onSubmit={handleSubmit(onSubmit)}>
          (FORM)
          <div className="text-center mt-6">
            <Button
              filled={true}
              onClick={() => {
                //
              }}
            >
              Next
            </Button>
          </div>
        </form>
      </FormCard>
    </FormsLayout>
  )
}

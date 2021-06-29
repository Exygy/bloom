import React from "react"
import { useFormContext } from "react-hook-form"
import {
  t,
  GridSection,
  Textarea,
  Field,
  GridCell,
  Select,
  stateKeys,
  ViewItem,
  DateField,
  FieldGroup,
} from "@bloom-housing/ui-components"
import { YesNoAnswer } from "../../../applications/PaperApplicationForm/FormTypes"

const ApplicationAddress = () => {
  const formMethods = useFormContext()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch } = formMethods
  const postmarksConsidered: YesNoAnswer = watch("applicationAddress.postmarksConsidered")
  const applicationsPickedUp: YesNoAnswer = watch("applicationAddress.applicationsPickedUp")
  const applicationsPickedUpAddress = watch("applicationAddress.applicationsPickedUpAddress")
  const paperMailedToAnotherAddress = watch("applicationAddress.differentPaperAddress")
  const applicationsDroppedOff: YesNoAnswer = watch("applicationAddress.applicationsDroppedOff")
  const droppedOffAtAnotherAddress = watch("applicationAddress.applicationsDroppedOffAddress")

  const yesNoRadioOptions = [
    {
      label: t("t.yes"),
      value: YesNoAnswer.Yes,
    },
    {
      label: t("t.no"),
      value: YesNoAnswer.No,
    },
  ]

  const locationRadioOptions = [
    {
      label: t("listings.atLeasingAgentAddress"),
      value: "leasingAgentAddress",
    },
    {
      label: t("listings.atMailingAddress"),
      value: "mailingAddress",
    },
    {
      label: t("listings.atAnotherAddress"),
      value: "anotherAddress",
    },
  ]

  return (
    <div>
      <hr className="mt-6 mb-6" />
      <span className="form-section__title">{t("listings.sections.applicationAddressTitle")}</span>
      <span className="form-section__description">
        {t("listings.sections.applicationAddressSubtitle")}
      </span>
      <GridSection grid={false} subtitle={t("listings.leasingAgentAddress")}>
        <GridSection columns={3}>
          <Field
            label={t("listings.streetAddressOrPOBox")}
            name={"applicationAddress.street"}
            id={"applicationAddress.street"}
            register={register}
            placeholder={t("application.contact.streetAddress")}
          />
          <Field
            label={t("application.contact.apt")}
            name={"applicationAddress.street2"}
            id={"applicationAddress.street2"}
            register={register}
            placeholder={t("application.contact.apt")}
          />
        </GridSection>
        <GridSection columns={6}>
          <GridCell span={2}>
            <Field
              label={t("application.contact.city")}
              name={"applicationAddress.city"}
              id={"applicationAddress.city"}
              register={register}
              placeholder={t("application.contact.city")}
            />
          </GridCell>
          <ViewItem label={t("application.contact.state")} className="mb-0">
            <Select
              id={`applicationAddress.state`}
              name={`applicationAddress.state`}
              label={t("application.contact.state")}
              labelClassName="sr-only"
              register={register}
              controlClassName="control"
              options={stateKeys}
              keyPrefix="states"
              errorMessage={t("errors.stateError")}
            />
          </ViewItem>
          <Field
            label={t("application.contact.zip")}
            name={"applicationAddress.zipCode"}
            id={"applicationAddress.zipCode"}
            placeholder={t("application.contact.zip")}
            errorMessage={t("errors.zipCodeError")}
            register={register}
          />
        </GridSection>
        <GridSection columns={1}>
          <Field
            id="applicationAddress.differentPaperAddress"
            name="applicationAddress.differentPaperAddress"
            type="checkbox"
            label={t("listings.paperDifferentAddress")}
            register={register}
          />
        </GridSection>
        {paperMailedToAnotherAddress && (
          <GridSection grid={false} subtitle={t("application.contact.mailingAddress")}>
            <GridSection columns={3}>
              <Field
                label={t("listings.streetAddressOrPOBox")}
                name={"applicationMailingAddress.street"}
                id={"applicationMailingAddress.street"}
                register={register}
                placeholder={t("application.contact.streetAddress")}
              />
              <Field
                label={t("application.contact.apt")}
                name={"applicationMailingAddress.street2"}
                id={"applicationMailingAddress.street2"}
                register={register}
                placeholder={t("application.contact.apt")}
              />
            </GridSection>
            <GridSection columns={6}>
              <GridCell span={2}>
                <Field
                  label={t("application.contact.city")}
                  name={"applicationMailingAddress.city"}
                  id={"applicationMailingAddress.city"}
                  register={register}
                  placeholder={t("application.contact.city")}
                />
              </GridCell>
              <ViewItem label={t("application.contact.state")} className="mb-0">
                <Select
                  id={`applicationMailingAddress.state`}
                  name={`applicationMailingAddress.state`}
                  label={t("application.contact.state")}
                  labelClassName="sr-only"
                  register={register}
                  controlClassName="control"
                  options={stateKeys}
                  keyPrefix="states"
                  errorMessage={t("errors.stateError")}
                />
              </ViewItem>
              <Field
                label={t("application.contact.zip")}
                name={"applicationMailingAddress.zipCode"}
                id={"applicationMailingAddress.zipCode"}
                placeholder={t("application.contact.zip")}
                errorMessage={t("errors.zipCodeError")}
                register={register}
              />
            </GridSection>
          </GridSection>
        )}
        <hr className="mt-6 mb-6" />
        <GridSection columns={8} className={"flex items-center"}>
          <GridCell span={2}>
            <p className="field-label m-4 ml-0">{t("listings.applicationPickupQuestion")}</p>
          </GridCell>
          <FieldGroup
            name="applicationAddress.applicationsPickedUp"
            type="radio"
            register={register}
            fields={[
              { ...yesNoRadioOptions[0], id: "applicationAddress.applicationsPickedUpYes" },
              { ...yesNoRadioOptions[1], id: "applicationAddress.applicationsPickedUpNo" },
            ]}
          />
        </GridSection>
        {applicationsPickedUp === YesNoAnswer.Yes && (
          <GridSection columns={4}>
            <p className="field-label m-4 ml-0">{t("listings.wherePickupQuestion")}</p>
            <FieldGroup
              name="applicationAddress.applicationsPickedUpAddress"
              type="radio"
              register={register}
              fields={[
                { ...locationRadioOptions[0], id: "pickUpAddressLeasingAgent" },
                { ...locationRadioOptions[1], id: "pickUpAddressMailingAddress" },
                { ...locationRadioOptions[2], id: "pickUpAddressAnotherAddress" },
              ]}
            />
          </GridSection>
        )}
        {applicationsPickedUpAddress === "anotherAddress" && (
          <GridSection grid={false} subtitle={t("listings.pickupAddress")}>
            <GridSection columns={3}>
              <Field
                label={t("listings.streetAddressOrPOBox")}
                name={"applicationPickUpAddress.street"}
                id={"applicationPickUpAddress.street"}
                register={register}
                placeholder={t("application.contact.streetAddress")}
              />
              <Field
                label={t("application.contact.apt")}
                name={"applicationPickUpAddress.street2"}
                id={"applicationPickUpAddress.street2"}
                register={register}
                placeholder={t("application.contact.apt")}
              />
            </GridSection>
            <GridSection columns={6}>
              <GridCell span={2}>
                <Field
                  label={t("application.contact.city")}
                  name={"applicationPickUpAddress.city"}
                  id={"applicationPickUpAddress.city"}
                  register={register}
                  placeholder={t("application.contact.city")}
                />
              </GridCell>
              <ViewItem label={t("application.contact.state")} className="mb-0">
                <Select
                  id={`applicationPickUpAddress.state`}
                  name={`applicationPickUpAddress.state`}
                  label={t("application.contact.state")}
                  labelClassName="sr-only"
                  register={register}
                  controlClassName="control"
                  options={stateKeys}
                  keyPrefix="states"
                  errorMessage={t("errors.stateError")}
                />
              </ViewItem>
              <Field
                label={t("application.contact.zip")}
                name={"applicationPickUpAddress.zipCode"}
                id={"applicationPickUpAddress.zipCode"}
                placeholder={t("application.contact.zip")}
                errorMessage={t("errors.zipCodeError")}
                register={register}
              />
            </GridSection>
            <GridSection columns={3}>
              <GridCell span={2}>
                <Textarea
                  label={t("leasingAgent.officeHours")}
                  name={"applicationPickUpAddressOfficeHours"}
                  id={"applicationPickUpAddressOfficeHours"}
                  fullWidth={true}
                  register={register}
                  placeholder={t("leasingAgent.officeHoursPlaceholder")}
                />
              </GridCell>
            </GridSection>
          </GridSection>
        )}
        <hr className="mt-6 mb-6" />
        <GridSection columns={8} className={"flex items-center"}>
          <GridCell span={2}>
            <p className="field-label m-4 ml-0">{t("listings.applicationDropOffQuestion")}</p>
          </GridCell>
          <FieldGroup
            name="applicationAddress.applicationsDroppedOff"
            type="radio"
            register={register}
            fields={[
              { ...yesNoRadioOptions[0], id: "applicationAddress.applicationsDroppedOffYes" },
              { ...yesNoRadioOptions[1], id: "applicationAddress.applicationsDroppedOffNo" },
            ]}
          />
        </GridSection>
        {applicationsDroppedOff === YesNoAnswer.Yes && (
          <GridSection columns={4}>
            <p className="field-label m-4 ml-0">{t("listings.whereDropOffQuestion")}</p>
            <FieldGroup
              name="applicationAddress.applicationsDroppedOffAddress"
              type="radio"
              register={register}
              fields={[
                { ...locationRadioOptions[0], id: "dropOffAddressLeasingAgent" },
                { ...locationRadioOptions[1], id: "dropOffAddressMailingAddress" },
                { ...locationRadioOptions[2], id: "dropOffAddressAnotherAddress" },
              ]}
            />
          </GridSection>
        )}
        {droppedOffAtAnotherAddress === "anotherAddress" && (
          <GridSection grid={false} subtitle={t("listings.dropOffAddress")}>
            <GridSection columns={3}>
              <Field
                label={t("listings.streetAddressOrPOBox")}
                name={"applicationDropOffAddress.street"}
                id={"applicationDropOffAddress.street"}
                register={register}
                placeholder={t("application.contact.streetAddress")}
              />
              <Field
                label={t("application.contact.apt")}
                name={"applicationDropOffAddress.street2"}
                id={"applicationDropOffAddress.street2"}
                register={register}
                placeholder={t("application.contact.apt")}
              />
            </GridSection>
            <GridSection columns={6}>
              <GridCell span={2}>
                <Field
                  label={t("application.contact.city")}
                  name={"applicationDropOffAddress.city"}
                  id={"applicationDropOffAddress.city"}
                  register={register}
                  placeholder={t("application.contact.city")}
                />
              </GridCell>
              <ViewItem label={t("application.contact.state")} className="mb-0">
                <Select
                  id={`applicationDropOffAddress.state`}
                  name={`applicationDropOffAddress.state`}
                  label={t("application.contact.state")}
                  labelClassName="sr-only"
                  register={register}
                  controlClassName="control"
                  options={stateKeys}
                  keyPrefix="states"
                  errorMessage={t("errors.stateError")}
                />
              </ViewItem>
              <Field
                label={t("application.contact.zip")}
                name={"applicationDropOffAddress.zipCode"}
                id={"applicationDropOffAddress.zipCode"}
                placeholder={t("application.contact.zip")}
                errorMessage={t("errors.zipCodeError")}
                register={register}
              />
            </GridSection>
            <GridSection columns={3}>
              <GridCell span={2}>
                <Textarea
                  label={t("leasingAgent.officeHours")}
                  name={"applicationDropOffAddressOfficeHours"}
                  id={"applicationDropOffAddressOfficeHours"}
                  fullWidth={true}
                  register={register}
                  placeholder={t("leasingAgent.officeHoursPlaceholder")}
                />
              </GridCell>
            </GridSection>
          </GridSection>
        )}
        <hr className="mt-6 mb-6" />

        <GridSection columns={8} className={"flex items-center"}>
          <GridCell span={2}>
            <p className="field-label m-4 ml-0">{t("listings.postmarksConsideredQuestion")}</p>
          </GridCell>
          <FieldGroup
            name="applicationAddress.postmarksConsidered"
            type="radio"
            register={register}
            fields={[
              { ...yesNoRadioOptions[0], id: "applicationAddress.postmarksConsideredYes" },
              { ...yesNoRadioOptions[1], id: "applicationAddress.postmarksConsideredNo" },
            ]}
          />
        </GridSection>
        {postmarksConsidered === YesNoAnswer.Yes && (
          <GridSection columns={4}>
            <GridCell span={2}>
              <ViewItem label={t("listings.postmarkByDate")} className="mb-0">
                <DateField
                  label={""}
                  name={"postmarkedApplicationsReceivedByDate"}
                  id={"postmarkedApplicationsReceivedByDate"}
                  register={register}
                  watch={watch}
                />
              </ViewItem>
            </GridCell>
          </GridSection>
        )}
        <hr className="mt-6 mb-6" />
        {/* This is not currently shown on any listing?
        <GridSection columns={3}>
          <GridCell span={2}>
            <Textarea
              label={t("listings.additionalApplicationSubmissionNotes")}
              name={"additionalApplicationSubmissionNotes"}
              id={"additionalApplicationSubmissionNotes"}
              fullWidth={true}
              register={register}
              placeholder={t("t.addNotes")}
            />
          </GridCell>
        </GridSection> */}
      </GridSection>
    </div>
  )
}

export default ApplicationAddress

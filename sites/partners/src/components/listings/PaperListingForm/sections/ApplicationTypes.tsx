import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import {
  t,
  AppearanceStyleType,
  Button,
  Drawer,
  Dropzone,
  FieldGroup,
  Field,
  MinimalTable,
  Select,
  Textarea,
  PhoneField,
  PhoneMask,
  StandardTableData,
  AppearanceSizeType,
} from "@bloom-housing/ui-components"
import { Card, Grid } from "@bloom-housing/ui-seeds"
import {
  cloudinaryFileUploader,
  fieldMessage,
  fieldHasError,
  YesNoAnswer,
} from "../../../../lib/helpers"
import { FormListing } from "../../../../lib/listings/formTypes"
import {
  ApplicationMethodCreate,
  ApplicationMethodsTypeEnum,
  LanguagesEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import SectionWithGrid from "../../../shared/SectionWithGrid"

interface Methods {
  digital: ApplicationMethodCreate
  paper: ApplicationMethodCreate
  referral: ApplicationMethodCreate
}

const ApplicationTypes = ({ listing }: { listing: FormListing }) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, setValue, watch, errors, getValues } = useFormContext()
  // watch fields
  const digitalApplicationChoice = watch("digitalApplicationChoice")
  const commonDigitalApplicationChoice = watch("commonDigitalApplicationChoice")
  const paperApplicationChoice = watch("paperApplicationChoice")
  const referralOpportunityChoice = watch("referralOpportunityChoice")
  /*
    Set state for methods, drawer, upload progress, and more
  */
  const [methods, setMethods] = useState<Methods>({
    digital: null,
    paper: null,
    referral: null,
  })
  const [selectedLanguage, setSelectedLanguage] = useState(LanguagesEnum.en)
  const [drawerState, setDrawerState] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [cloudinaryData, setCloudinaryData] = useState({
    id: "",
    url: "",
  })
  const resetDrawerState = () => {
    setProgressValue(0)
    setCloudinaryData({
      id: "",
      url: "",
    })
    setDrawerState(false)
  }

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

  const paperApplicationsTableHeaders = {
    fileName: "t.fileName",
    language: "t.language",
    actions: "",
  }

  const savePaperApplication = () => {
    const paperApplications = methods.paper?.paperApplications ?? []
    paperApplications.push({
      assets: {
        fileId: cloudinaryData.id,
        label: selectedLanguage,
      },
      language: selectedLanguage,
    })
    setMethods({
      ...methods,
      paper: {
        ...methods.paper,
        paperApplications,
      },
    })
  }

  /*
    Pass the file for the dropzone callback along to the uploader
  */
  const pdfUploader = async (file: File) => {
    void (await cloudinaryFileUploader({ file, setCloudinaryData, setProgressValue }))
  }

  /*
    Show a preview of the uploaded file within the drawer
  */
  const previewPaperApplicationsTableRows: StandardTableData = []
  if (cloudinaryData.url != "") {
    previewPaperApplicationsTableRows.push({
      fileName: { content: `${cloudinaryData.id.split("/").slice(-1).join()}.pdf` },
      language: { content: t(`languages.${selectedLanguage}`) },
      actions: {
        content: (
          <Button
            type="button"
            className="font-semibold uppercase text-alert my-0"
            onClick={() => {
              setCloudinaryData({
                id: "",
                url: "",
              })
              setProgressValue(0)
            }}
            unstyled
          >
            {t("t.delete")}
          </Button>
        ),
      },
    })
  }

  /**
   * set initial methods
   */
  useEffect(() => {
    // set methods here
    const temp: Methods = {
      digital: null,
      paper: null,
      referral: null,
    }
    const applicationMethods =
      getValues()?.applicationMethods?.length > 0
        ? getValues().applicationMethods
        : listing?.applicationMethods

    applicationMethods?.forEach((method) => {
      switch (method.type) {
        case ApplicationMethodsTypeEnum.Internal:
        case ApplicationMethodsTypeEnum.ExternalLink:
          temp["digital"] = method
          break
        case ApplicationMethodsTypeEnum.FileDownload:
          temp["paper"] = method
          break
        case ApplicationMethodsTypeEnum.Referral:
          temp["referral"] = method
          break
        default:
          break
      }
    })
    setMethods(temp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * set application methods value when any of the methods change
   */
  useEffect(() => {
    const applicationMethods = []
    for (const key in methods) {
      if (methods[key]) {
        applicationMethods.push(methods[key])
      }
    }
    setValue("applicationMethods", applicationMethods)
  }, [methods, setValue])
  // register applicationMethods so we can set a value for it
  register("applicationMethods")
  return (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid
        heading={t("listings.sections.applicationTypesTitle")}
        subheading={t("listings.sections.applicationTypesSubtitle")}
      >
        <Grid.Row columns={2}>
          <Grid.Cell>
            <p
              className={`field-label m-4 ml-0 ${
                fieldHasError(errors?.digitalApplication) &&
                digitalApplicationChoice === null &&
                "text-alert"
              }`}
            >
              {t("listings.isDigitalApplication")}
            </p>

            <FieldGroup
              name="digitalApplicationChoice"
              type="radio"
              register={register}
              error={fieldHasError(errors?.digitalApplication) && digitalApplicationChoice === null}
              errorMessage={fieldMessage(errors?.digitalApplication)}
              groupSubNote={t("listings.requiredToPublish")}
              fields={[
                {
                  ...yesNoRadioOptions[0],
                  id: "digitalApplicationChoiceYes",
                  defaultChecked: listing?.digitalApplication === true ?? null,
                  inputProps: {
                    onChange: () => {
                      setMethods({
                        ...methods,
                        digital: {
                          ...methods.digital,
                          type: ApplicationMethodsTypeEnum.Internal,
                        },
                      })
                    },
                  },
                },
                {
                  ...yesNoRadioOptions[1],
                  id: "digitalApplicationChoiceNo",
                  defaultChecked: listing?.digitalApplication === false ?? null,
                  inputProps: {
                    onChange: () => {
                      setMethods({
                        ...methods,
                        digital: null,
                      })
                    },
                  },
                },
              ]}
            />
          </Grid.Cell>
          {digitalApplicationChoice === YesNoAnswer.Yes && (
            <Grid.Cell>
              <p className="field-label m-4 ml-0">{t("listings.usingCommonDigitalApplication")}</p>

              <FieldGroup
                name="commonDigitalApplicationChoice"
                type="radio"
                register={register}
                fields={[
                  {
                    ...yesNoRadioOptions[0],
                    id: "commonDigitalApplicationChoiceYes",
                    defaultChecked:
                      methods?.digital?.type === ApplicationMethodsTypeEnum.Internal ?? null,
                    inputProps: {
                      onChange: () => {
                        setMethods({
                          ...methods,
                          digital: {
                            ...methods.digital,
                            type: ApplicationMethodsTypeEnum.Internal,
                          },
                        })
                      },
                    },
                  },
                  {
                    ...yesNoRadioOptions[1],
                    id: "commonDigitalApplicationChoiceNo",
                    defaultChecked:
                      methods?.digital?.type === ApplicationMethodsTypeEnum.ExternalLink ?? null,
                    inputProps: {
                      onChange: () => {
                        setMethods({
                          ...methods,
                          digital: {
                            ...methods.digital,
                            type: ApplicationMethodsTypeEnum.ExternalLink,
                          },
                        })
                      },
                    },
                  },
                ]}
              />
            </Grid.Cell>
          )}
        </Grid.Row>
        {((commonDigitalApplicationChoice &&
          commonDigitalApplicationChoice === YesNoAnswer.No &&
          digitalApplicationChoice === YesNoAnswer.Yes) ||
          (digitalApplicationChoice === YesNoAnswer.Yes &&
            !commonDigitalApplicationChoice &&
            listing?.commonDigitalApplication === false)) && (
          <Grid.Row columns={1}>
            <Grid.Cell>
              <Field
                label={t("listings.customOnlineApplicationUrl")}
                name="customOnlineApplicationUrl"
                id="customOnlineApplicationUrl"
                placeholder="https://"
                inputProps={{
                  value: methods.digital?.externalReference
                    ? methods.digital.externalReference
                    : "",
                  onChange: (e) => {
                    setMethods({
                      ...methods,
                      digital: {
                        ...methods.digital,
                        externalReference: e.target.value,
                      },
                    })
                  },
                }}
                error={fieldHasError(errors?.applicationMethods?.[0]?.externalReference)}
                errorMessage={fieldMessage(errors?.applicationMethods?.[0]?.externalReference)}
              />
            </Grid.Cell>
          </Grid.Row>
        )}

        <Grid.Row columns={2}>
          <Grid.Cell>
            <p
              className={`field-label m-4 ml-0 ${
                fieldHasError(errors?.paperApplication) &&
                paperApplicationChoice === null &&
                "text-alert"
              }`}
            >
              {t("listings.isPaperApplication")}
            </p>

            <FieldGroup
              name="paperApplicationChoice"
              type="radio"
              groupSubNote={t("listings.requiredToPublish")}
              error={fieldHasError(errors?.paperApplication) && paperApplicationChoice === null}
              errorMessage={fieldMessage(errors?.paperApplication)}
              register={register}
              fields={[
                {
                  ...yesNoRadioOptions[0],
                  id: "paperApplicationYes",
                  defaultChecked: listing?.paperApplication === true ?? null,
                  inputProps: {
                    onChange: () => {
                      setMethods({
                        ...methods,
                        paper: {
                          ...methods.paper,
                          type: ApplicationMethodsTypeEnum.FileDownload,
                        },
                      })
                    },
                  },
                },
                {
                  ...yesNoRadioOptions[1],
                  id: "paperApplicationNo",
                  defaultChecked: listing?.paperApplication === false ?? null,
                  inputProps: {
                    onChange: () => {
                      setMethods({
                        ...methods,
                        paper: null,
                      })
                    },
                  },
                },
              ]}
            />
          </Grid.Cell>
        </Grid.Row>
        {paperApplicationChoice === YesNoAnswer.Yes && (
          <Grid.Row columns={1}>
            <Grid.Cell>
              {methods.paper?.paperApplications?.length > 0 && (
                <MinimalTable
                  className="mb-8"
                  headers={paperApplicationsTableHeaders}
                  data={methods.paper.paperApplications.map((item) => ({
                    fileName: { content: `${item.assets.fileId.split("/").slice(-1).join()}.pdf` },
                    language: { content: t(`languages.${item.language}`) },
                    actions: {
                      content: (
                        <div className="flex">
                          <Button
                            type="button"
                            className="font-semibold uppercase text-alert my-0"
                            onClick={() => {
                              const items = methods.paper.paperApplications.filter(
                                (paperApp) => item !== paperApp
                              )

                              setMethods({
                                ...methods,
                                paper: {
                                  ...methods.paper,
                                  paperApplications: items,
                                },
                              })
                            }}
                            unstyled
                          >
                            {t("t.delete")}
                          </Button>
                        </div>
                      ),
                    },
                  }))}
                ></MinimalTable>
              )}
              <Button
                type="button"
                onClick={() => {
                  // default the application to English:
                  setSelectedLanguage(LanguagesEnum.en)
                  setDrawerState(true)
                }}
              >
                {t("listings.addPaperApplication")}
              </Button>
            </Grid.Cell>
          </Grid.Row>
        )}

        <Grid.Row columns={1}>
          <Grid.Cell>
            <p
              className={`field-label m-4 ml-0 ${
                fieldHasError(errors?.referralOpportunity) &&
                referralOpportunityChoice === null &&
                "text-alert"
              }`}
            >
              {t("listings.isReferralOpportunity")}
            </p>

            <FieldGroup
              name="referralOpportunityChoice"
              type="radio"
              register={register}
              groupSubNote={t("listings.requiredToPublish")}
              error={
                fieldHasError(errors?.referralOpportunity) && referralOpportunityChoice === null
              }
              errorMessage={fieldMessage(errors?.referralOpportunity)}
              fields={[
                {
                  ...yesNoRadioOptions[0],
                  id: "referralOpportunityYes",
                  defaultChecked: listing?.referralOpportunity === true ?? null,
                  inputProps: {
                    onChange: () => {
                      setMethods({
                        ...methods,
                        referral: {
                          ...methods.referral,
                          type: ApplicationMethodsTypeEnum.Referral,
                        },
                      })
                    },
                  },
                },
                {
                  ...yesNoRadioOptions[1],
                  id: "referralOpportunityNo",
                  defaultChecked: listing?.referralOpportunity === false ?? null,
                  inputProps: {
                    onChange: () => {
                      setMethods({
                        ...methods,
                        referral: null,
                      })
                    },
                  },
                },
              ]}
            />
          </Grid.Cell>
        </Grid.Row>
        {referralOpportunityChoice === YesNoAnswer.Yes && (
          <Grid.Row columns={3}>
            <Grid.Cell>
              <PhoneField
                label={t("listings.referralContactPhone")}
                name="referralContactPhone"
                id="referralContactPhone"
                placeholder={t("t.phoneNumberPlaceholder")}
                mask={() => (
                  <PhoneMask
                    name="referralContactPhone"
                    value={methods.referral ? methods.referral.phoneNumber : ""}
                    placeholder={t("t.phoneNumberPlaceholder")}
                    onChange={(e) => {
                      setMethods({
                        ...methods,
                        referral: {
                          ...methods.referral,
                          phoneNumber: e.target.value,
                        },
                      })
                    }}
                  />
                )}
                controlClassName={"control"}
              />
            </Grid.Cell>
            <Grid.Cell className="seeds-grid-span-2">
              <Textarea
                label={t("listings.referralSummary")}
                rows={3}
                fullWidth={true}
                placeholder={t("t.descriptionTitle")}
                name="referralSummary"
                id="referralSummary"
                maxLength={500}
                inputProps={{
                  value: methods.referral ? methods.referral.externalReference : "",
                  onChange: (e) => {
                    setMethods({
                      ...methods,
                      referral: {
                        ...methods.referral,
                        externalReference: e.target.value,
                      },
                    })
                  },
                }}
              />
            </Grid.Cell>
          </Grid.Row>
        )}
      </SectionWithGrid>

      <Drawer
        open={drawerState}
        title={t("listings.addPaperApplication")}
        onClose={() => resetDrawerState()}
        ariaDescription="Form with paper application upload dropzone"
        actions={[
          <Button
            key={0}
            onClick={() => {
              savePaperApplication()
              resetDrawerState()
            }}
            styleType={AppearanceStyleType.primary}
            size={AppearanceSizeType.small}
          >
            Save
          </Button>,
          <Button
            key={1}
            onClick={() => {
              resetDrawerState()
            }}
            size={AppearanceSizeType.small}
          >
            Cancel
          </Button>,
        ]}
      >
        <Card spacing="lg" className="spacer-section">
          <Card.Section>
            {cloudinaryData.url === "" && (
              <div className="field">
                <p className="mb-2">
                  <label className="label">{t("t.language")}</label>
                </p>
                <Select
                  name="paperApplicationLanguage"
                  options={Object.values(LanguagesEnum).map((item) => ({
                    label: t(`languages.${item}`),
                    value: item,
                  }))}
                  defaultValue={selectedLanguage}
                  inputProps={{
                    onChange: (e) => {
                      setSelectedLanguage(e.target.value)
                    },
                  }}
                />
              </div>
            )}
            <Dropzone
              id="listing-paper-application-upload"
              label={t("t.uploadFile")}
              helptext={t("listings.pdfHelperText")}
              uploader={pdfUploader}
              accept="application/pdf"
              progress={progressValue}
            />
            {cloudinaryData.url !== "" && (
              <MinimalTable
                headers={paperApplicationsTableHeaders}
                data={previewPaperApplicationsTableRows}
              ></MinimalTable>
            )}
          </Card.Section>
        </Card>
      </Drawer>
    </>
  )
}

export default ApplicationTypes

import React, { useState, useMemo, useCallback, useContext, useEffect } from "react"
import {
  t,
  MinimalTable,
  FieldGroup,
  StandardTableData,
  Select,
} from "@bloom-housing/ui-components"
import { Button, Dialog, Drawer, FieldValue, Grid, Tag } from "@bloom-housing/ui-seeds"
import {
  FeatureFlag,
  FeatureFlagEnum,
  HomeTypeEnum,
  ReviewOrderTypeEnum,
  YesNoEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { AuthContext, MessageContext } from "@bloom-housing/shared-helpers"
import UnitForm from "../UnitForm"
import { useFormContext, useWatch } from "react-hook-form"
import { TempUnit } from "../../../../lib/listings/formTypes"
import { fieldHasError, fieldMessage } from "../../../../lib/helpers"
import SectionWithGrid from "../../../shared/SectionWithGrid"

type UnitProps = {
  units: TempUnit[]
  setUnits: (units: TempUnit[]) => void
  disableUnitsAccordion: boolean
  featureFlags?: FeatureFlag[]
}

const FormUnits = ({ units, setUnits, disableUnitsAccordion, featureFlags }: UnitProps) => {
  const { addToast } = useContext(MessageContext)
  const [unitDrawerOpen, setUnitDrawerOpen] = useState(false)
  const [unitDeleteModal, setUnitDeleteModal] = useState<number | null>(null)
  const [defaultUnit, setDefaultUnit] = useState<TempUnit | null>(null)
  const [homeTypeEnabled, setHomeTypeEnabled] = useState(false)
  const { doJurisdictionsHaveFeatureFlagOn } = useContext(AuthContext)

  const formMethods = useFormContext()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, errors, clearErrors, getValues, control, setValue } = formMethods
  const listing = getValues()

  const listingAvailability = useWatch({
    control,
    name: "listingAvailabilityQuestion",
  })

  const homeTypes = [
    "",
    ...Object.values(HomeTypeEnum).map((val) => {
      return { value: val, label: t(`homeType.${val}`) }
    }),
  ]

  const nextId = units && units.length > 0 ? units[units.length - 1]?.tempId + 1 : 1

  const unitTableHeaders = {
    number: "listings.unit.number",
    unitType: "listings.unit.type",
    amiPercentage: "listings.unit.ami",
    monthlyRent: "listings.unit.rent",
    sqFeet: "listings.unit.sqft",
    unitAccessibilityPriorityTypes: "listings.unit.priorityType",
    action: "",
  }

  useEffect(() => {
    if (
      getValues("disableUnitsAccordion") === undefined ||
      getValues("disableUnitsAccordion") === null
    ) {
      setValue("disableUnitsAccordion", disableUnitsAccordion ? "true" : "false")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (units && units.length > 0 && !units[0].tempId) {
      units.forEach((unit, index) => {
        unit.tempId = index + 1
      })
    }
  }, [units])

  // If hometype feature flag is not turned on for selected jurisdiction we need to reset the value
  useEffect(() => {
    if (featureFlags) {
      const isHomeTypeEnabled = featureFlags.some(
        (flag) => flag.name === FeatureFlagEnum.enableHomeType
      )
      setHomeTypeEnabled(isHomeTypeEnabled)
      if (!isHomeTypeEnabled) {
        setValue("homeType", "")
      }
    }
  }, [featureFlags, setValue])

  const editUnit = useCallback(
    (tempId: number) => {
      setDefaultUnit(units.filter((unit) => unit.tempId === tempId)[0])
      setUnitDrawerOpen(true)
    },
    [units]
  )

  const deleteUnit = useCallback(
    (tempId: number) => {
      const updatedUnits = units
        .filter((unit) => unit.tempId !== tempId)
        .map((updatedUnit, index) => ({
          ...updatedUnit,
          tempId: index + 1,
        }))

      setUnits(updatedUnits)
      setUnitDeleteModal(null)
    },
    [setUnitDeleteModal, setUnits, units]
  )

  function saveUnit(newUnit: TempUnit) {
    const exists = units.some((unit) => unit.tempId === newUnit.tempId)
    if (exists) {
      const updateUnits = units.map((unit) => (unit.tempId === newUnit.tempId ? newUnit : unit))
      setUnits(updateUnits)
    } else {
      setUnits([...units, newUnit])
    }
  }

  const unitTableData: StandardTableData = useMemo(
    () =>
      units.map((unit) => ({
        number: { content: unit.number },
        unitType: { content: unit.unitTypes && t(`listings.unitTypes.${unit.unitTypes.name}`) },
        amiPercentage: { content: unit.amiPercentage },
        monthlyRent: { content: unit.monthlyRent },
        sqFeet: { content: unit.sqFeet },
        unitAccessibilityPriorityTypes: { content: unit.unitAccessibilityPriorityTypes?.name },
        action: {
          content: (
            <div className="flex gap-3">
              <Button
                type="button"
                className="font-semibold"
                onClick={() => editUnit(unit.tempId)}
                variant="text"
                size="sm"
              >
                {t("t.edit")}
              </Button>
              <Button
                type="button"
                className="font-semibold text-alert"
                onClick={() => setUnitDeleteModal(unit.tempId)}
                variant="text"
                size="sm"
              >
                {t("t.delete")}
              </Button>
            </div>
          ),
        },
      })),
    [editUnit, units]
  )

  const disableUnitsAccordionOptions = [
    {
      id: "unitTypes",
      label: t("listings.unit.unitTypes"),
      value: "true",
      dataTestId: "unit-types",
    },
    {
      id: "individualUnits",
      label: t("listings.unit.individualUnits"),
      value: "false",
      dataTestId: "individual-units",
    },
  ]

  const enableSection8Question = doJurisdictionsHaveFeatureFlagOn(
    FeatureFlagEnum.enableSection8Question,
    listing?.jurisdictions?.id
  )

  return (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid heading={t("listings.units")} subheading={t("listings.unitsDescription")}>
        {homeTypeEnabled && (
          <Grid.Row columns={2}>
            <FieldValue label={t("listings.homeType")}>
              {homeTypes && (
                <Select
                  id={`homeType`}
                  name={`homeType`}
                  label={t("listings.homeType")}
                  labelClassName="sr-only"
                  register={register}
                  controlClassName="control"
                  options={homeTypes}
                />
              )}
            </FieldValue>
          </Grid.Row>
        )}
        <Grid.Row columns={2}>
          <FieldValue label={t("listings.unitTypesOrIndividual")} className="mb-1">
            <FieldGroup
              name="disableUnitsAccordion"
              type="radio"
              register={register}
              fields={disableUnitsAccordionOptions}
              fieldClassName="m-0"
              fieldGroupClassName="flex h-12 items-center"
            />
          </FieldValue>
          <FieldValue label={t("listings.listingAvailabilityQuestion")} className={"mb-1"}>
            <FieldGroup
              name="listingAvailabilityQuestion"
              type="radio"
              register={register}
              groupSubNote={t("listings.requiredToPublish")}
              error={fieldHasError(errors?.listingAvailability) && listingAvailability === null}
              errorMessage={fieldMessage(errors?.listingAvailability)}
              fieldClassName="m-0"
              fieldGroupClassName="flex h-12 items-center"
              fields={[
                {
                  label: t("listings.availableUnits"),
                  value: "availableUnits",
                  id: "availableUnits",
                  dataTestId: "listingAvailability.availableUnits",
                  defaultChecked: listing?.reviewOrderType !== ReviewOrderTypeEnum.waitlist,
                },
                {
                  label: t("listings.waitlist.open"),
                  value: "openWaitlist",
                  id: "openWaitlist",
                  dataTestId: "listingAvailability.openWaitlist",
                  defaultChecked: listing?.reviewOrderType === ReviewOrderTypeEnum.waitlist,
                },
              ]}
            />
          </FieldValue>
        </Grid.Row>

        <SectionWithGrid.HeadingRow>{t("listings.units")}</SectionWithGrid.HeadingRow>
        <Grid.Row>
          <Grid.Cell className="grid-inset-section">
            {!!units.length && (
              <div className="mb-5">
                <MinimalTable headers={unitTableHeaders} data={unitTableData} />
              </div>
            )}
            <Button
              id="addUnitsButton"
              type="button"
              variant={fieldHasError(errors?.units) ? "alert" : "primary-outlined"}
              size="sm"
              onClick={() => {
                editUnit(units.length + 1)
                clearErrors("units")
              }}
            >
              {t("listings.unit.add")}
            </Button>
          </Grid.Cell>
        </Grid.Row>
        {enableSection8Question && (
          <Grid.Row>
            <FieldValue label={t("listings.section8Title")}>
              <FieldGroup
                name="listingSection8Acceptance"
                type="radio"
                register={register}
                fields={[
                  {
                    id: "listingSection8AcceptanceYes",
                    dataTestId: "listingSection8AcceptanceYes",
                    label: t("t.yes"),
                    value: YesNoEnum.yes,
                    defaultChecked: listing?.section8Acceptance,
                  },
                  {
                    id: "listingSection8AcceptanceNo",
                    dataTestId: "listingSection8AcceptanceNo",
                    label: t("t.no"),
                    value: YesNoEnum.no,
                    defaultChecked: !listing?.section8Acceptance,
                  },
                ]}
              />
            </FieldValue>
          </Grid.Row>
        )}
      </SectionWithGrid>

      <p className="field-sub-note">{t("listings.requiredToPublish")}</p>
      {fieldHasError(errors?.units) && (
        <span className={"text-xs text-alert"} id="units-error">
          {t("errors.requiredFieldError")}
        </span>
      )}

      <Drawer
        isOpen={unitDrawerOpen}
        onClose={() => setUnitDrawerOpen(false)}
        ariaLabelledBy="units-drawer-header"
      >
        <Drawer.Header id="units-drawer-header">
          {t("listings.unit.add")}
          <Tag
            variant={
              units.some((unit) => unit.tempId === defaultUnit?.tempId)
                ? "success-inverse"
                : undefined
            }
          >
            {units.some((unit) => unit.tempId === defaultUnit?.tempId)
              ? t("t.saved")
              : t("t.draft")}
          </Tag>
        </Drawer.Header>
        <UnitForm
          onSubmit={(unit) => {
            saveUnit(unit)
          }}
          onClose={(openNextUnit: boolean, openCurrentUnit: boolean, defaultUnit: TempUnit) => {
            setDefaultUnit(defaultUnit)
            if (openNextUnit) {
              if (defaultUnit) {
                addToast(t("listings.unit.unitCopied"), { variant: "success" })
              }
              editUnit(nextId)
            } else if (!openCurrentUnit) {
              setUnitDrawerOpen(false)
            } else {
              addToast(t("listings.unit.unitSaved"), { variant: "success" })
            }
          }}
          draft={!units.some((unit) => unit.tempId === defaultUnit?.tempId)}
          defaultUnit={defaultUnit}
          nextId={nextId}
        />
      </Drawer>

      <Dialog isOpen={!!unitDeleteModal} onClose={() => setUnitDeleteModal(null)}>
        <Dialog.Header>{t("listings.unit.delete")}</Dialog.Header>
        <Dialog.Content>{t("listings.unit.deleteConf")}</Dialog.Content>
        <Dialog.Footer>
          <Button variant="alert" onClick={() => deleteUnit(unitDeleteModal)} size="sm">
            {t("t.delete")}
          </Button>
          <Button
            onClick={() => {
              setUnitDeleteModal(null)
            }}
            variant="primary-outlined"
            size="sm"
          >
            {t("t.cancel")}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  )
}

export default FormUnits

import React, { useMemo, useContext, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import {
  Button,
  t,
  Form,
  GridSection,
  GridCell,
  ViewItem,
  Field,
  FieldGroup,
  Select,
  useMutate,
  AppearanceStyleType,
  AppearanceBorderType,
  emailRegex,
  setSiteAlertMessage,
  Tag,
  AppearanceSizeType,
  Modal,
} from "@bloom-housing/ui-components"
import { RoleOption, roleKeys, AuthContext } from "@bloom-housing/shared-helpers"
import { Listing, User, UserRolesCreate } from "@bloom-housing/backend-core/types"
import router from "next/router"

type FormUserManageProps = {
  mode: "add" | "edit"
  user?: User
  listings: Listing[]
  onDrawerClose: () => void
}

type FormUserManageValues = {
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  user_listings?: string[]
  jurisdiction_all?: boolean
  jurisdictions?: string[]
}

const determineUserRole = (roles: UserRolesCreate) => {
  if (roles?.isAdmin) {
    return RoleOption.Administrator
  } else if (roles?.isJurisdictionalAdmin) {
    return RoleOption.JurisdictionalAdmin
  }
  return RoleOption.Partner
}

const FormUserManage = ({ mode, user, listings, onDrawerClose }: FormUserManageProps) => {
  const { userService, profile } = useContext(AuthContext)
  const jurisdictionList = profile.jurisdictions

  const [isDeleteModalActive, setDeleteModalActive] = useState<boolean>(false)

  const defaultValues: FormUserManageValues =
    mode === "edit"
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: determineUserRole(user.roles),
          user_listings: user.leasingAgentInListings?.map((item) => item.id) ?? [],
          jurisdiction_all: jurisdictionList.length === user.jurisdictions.length,
          jurisdictions: user.jurisdictions.map((elem) => elem.id),
        }
      : {}

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, errors, getValues, trigger, setValue, watch } = useForm<FormUserManageValues>({
    defaultValues,
  })

  const jurisdictionOptions = useMemo(() => {
    // get jurisdictions from backend instead
    return jurisdictionList.map((juris) => ({
      id: juris.id,
      label: juris.name,
      value: juris.id,
      inputProps: {
        onChange: () => {
          if (getValues("jurisdictions").length === jurisdictionList.length) {
            setValue("jurisdiction_all", true)
          } else {
            setValue("jurisdiction_all", false)
          }
        },
      },
    }))
  }, [jurisdictionList, getValues, setValue])

  const listingsOptions = useMemo(() => {
    const jurisdictionalizedListings = {}
    jurisdictionList.forEach((juris) => {
      jurisdictionalizedListings[juris.id] = []
    })
    listings.forEach((listing) => {
      jurisdictionalizedListings[listing.jurisdiction.id].push({
        id: listing.id,
        label: listing.name,
        value: listing.id,
      })
    })

    Object.keys(jurisdictionalizedListings).forEach((key) => {
      const listingsInJurisdiction = jurisdictionalizedListings[key]
      listingsInJurisdiction.forEach((listing) => {
        listing.inputProps = {
          onChange: () => {
            let currValues = getValues("user_listings")
            if (currValues && !Array.isArray(currValues)) {
              currValues = [currValues]
            } else if (!currValues) {
              currValues = []
            }

            const temp = listingsInJurisdiction.every((elem) =>
              currValues.some((search) => elem.id === search)
            )

            if (temp) {
              setValue(`listings_all_${key}`, true)
            } else {
              setValue(`listings_all_${key}`, false)
            }
          },
        }
      })
    })
    return jurisdictionalizedListings
  }, [getValues, listings, setValue, jurisdictionList])

  /**
   * Control listing checkboxes on select/deselect all listings option
   */
  const updateAllCheckboxes = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const incomingListingIds = listingsOptions[key].map((option) => option.id)
    let currentListingIds = getValues("user_listings")

    if (e.target.checked) {
      const allListingIds = incomingListingIds.reduce(
        (accum, curr) => {
          if (!accum.includes(curr)) {
            // if we are adding listings, make sure we aren't double adding listings
            accum.push(curr)
          } else if (!e.target.checked && accum.includes(curr)) {
            // if we are removing listings
            accum = accum.filter((elem) => elem !== curr)
          }
          return accum
        },
        [...(currentListingIds || [])]
      )
      setValue("user_listings", allListingIds)
    } else {
      if (currentListingIds && !Array.isArray(currentListingIds)) {
        currentListingIds = [currentListingIds]
      } else if (!currentListingIds) {
        currentListingIds = []
      }
      const allListingIds = currentListingIds.filter((elem) => !incomingListingIds.includes(elem))

      setValue("user_listings", allListingIds.length === 0 ? null : allListingIds)
    }
  }

  const updateAllJurisdictionCheckboxes = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      setValue("jurisdictions", [])
    } else {
      const allJurisdictionIds = jurisdictionOptions.map((option) => option.id)
      setValue("jurisdictions", allJurisdictionIds)
    }
  }

  const { mutate: sendInvite, isLoading: isSendInviteLoading } = useMutate()
  const { mutate: resendConfirmation, isLoading: isResendConfirmationLoading } = useMutate()
  const { mutate: updateUser, isLoading: isUpdateUserLoading } = useMutate()
  const { mutate: deleteUser, isLoading: isDeleteUserLoading } = useMutate()

  const createUserBody = useCallback(async () => {
    const { firstName, lastName, email, role, jurisdictions } = getValues()

    /**
     * react-hook form returns:
     * - false if any option is selected
     * - string if only one option is selected
     * - array of strings if multiple checkboxes are selected
     */
    const user_listings = (() => {
      const value = getValues("user_listings") as string[] | boolean | string
      const valueInArray = Array.isArray(value)

      if (valueInArray) {
        return value
      } else if (typeof value === "string") {
        return [value]
      }

      return []
    })()

    const validation = await trigger()

    if (!validation) return

    const roles = (() => ({
      isAdmin: role.includes(RoleOption.Administrator),
      isPartner: role.includes(RoleOption.Partner),
      isJurisdictionalAdmin: role.includes(RoleOption.JurisdictionalAdmin),
    }))()

    const leasingAgentInListings = user_listings?.map((id) => ({ id })) || []

    let selectedJurisdictions = []
    if (Array.isArray(jurisdictions)) {
      selectedJurisdictions = jurisdictions.map((elem) => ({
        id: elem,
      }))
    } else if (jurisdictions) {
      selectedJurisdictions = [{ id: jurisdictions }]
    } else {
      selectedJurisdictions = jurisdictionOptions.map((elem) => ({ id: elem.id }))
    }

    const body = {
      firstName,
      lastName,
      email,
      roles,
      leasingAgentInListings: leasingAgentInListings,
      jurisdictions: selectedJurisdictions,
      agreedToTermsOfService: user?.agreedToTermsOfService ?? false,
    }

    return body
  }, [getValues, trigger, user?.agreedToTermsOfService, jurisdictionOptions])

  const onInvite = async () => {
    const body = await createUserBody()
    if (!body) return

    void sendInvite(() =>
      userService
        .invite({
          body,
        })
        .then(() => {
          setSiteAlertMessage(t(`users.inviteSent`), "success")
        })
        .catch((e) => {
          if (e?.response?.status === 409) {
            setSiteAlertMessage(t(`errors.alert.emailConflict`), "alert")
          } else {
            setSiteAlertMessage(t(`errors.alert.badRequest`), "alert")
          }
        })
        .finally(() => {
          onDrawerClose()
          void router.reload()
        })
    )
  }

  const onInviteResend = () => {
    const { email } = getValues()

    const body = { email, appUrl: window.location.origin }

    void resendConfirmation(() =>
      userService
        .resendPartnerConfirmation({ body })
        .then(() => {
          setSiteAlertMessage(t(`users.confirmationSent`), "success")
        })
        .catch(() => {
          setSiteAlertMessage(t(`errors.alert.badRequest`), "alert")
        })
        .finally(() => {
          onDrawerClose()
          void router.reload()
        })
    )
  }

  const onSave = useCallback(async () => {
    const form = await createUserBody()
    if (!form) return

    const body = {
      id: user.id,
      ...form,
    }

    void updateUser(() =>
      userService
        .update({
          body,
        })
        .then(() => {
          setSiteAlertMessage(t(`users.userUpdated`), "success")
        })
        .catch(() => {
          setSiteAlertMessage(t(`errors.alert.badRequest`), "alert")
        })
        .finally(() => {
          onDrawerClose()
          void router.reload()
        })
    )
  }, [createUserBody, onDrawerClose, updateUser, userService, user])

  const onDelete = () => {
    void deleteUser(() =>
      userService
        .delete({
          id: user.id,
        })
        .then(() => {
          setSiteAlertMessage(t(`users.userDeleted`), "success")
        })
        .catch(() => {
          setSiteAlertMessage(t(`errors.alert.badRequest`), "alert")
        })
        .finally(() => {
          onDrawerClose()
          setDeleteModalActive(false)
          void router.reload()
        })
    )
  }

  const selectedRoles = watch("role")
  const selectedJurisdictions = watch("jurisdictions")

  return (
    <>
      <Form onSubmit={() => false}>
        <div className="border rounded-md p-8 bg-white">
          <GridSection
            title={
              <div className="flex content-center">
                <span>{t("users.userDetails")}</span>

                {mode === "edit" && (
                  <div className="ml-2 mt-2">
                    <Tag
                      className="block"
                      size={AppearanceSizeType.small}
                      styleType={
                        user.confirmedAt ? AppearanceStyleType.success : AppearanceStyleType.primary
                      }
                      pillStyle
                    >
                      {user.confirmedAt ? t("users.confirmed") : t("users.unconfirmed")}
                    </Tag>
                  </div>
                )}
              </div>
            }
            columns={4}
          >
            <GridCell>
              <ViewItem label={t("authentication.createAccount.firstName")}>
                <Field
                  id="firstName"
                  name="firstName"
                  label={t("authentication.createAccount.firstName")}
                  placeholder={t("authentication.createAccount.firstName")}
                  error={!!errors?.firstName}
                  errorMessage={t("errors.requiredFieldError")}
                  validation={{ required: true }}
                  register={register}
                  type="text"
                  readerOnly
                />
              </ViewItem>
            </GridCell>

            <GridCell>
              <ViewItem label={t("authentication.createAccount.lastName")}>
                <Field
                  id="lastName"
                  name="lastName"
                  label={t("authentication.createAccount.lastName")}
                  placeholder={t("authentication.createAccount.lastName")}
                  error={!!errors?.lastName}
                  errorMessage={t("errors.requiredFieldError")}
                  validation={{ required: true }}
                  register={register}
                  type="text"
                  readerOnly
                />
              </ViewItem>
            </GridCell>

            <GridCell>
              <ViewItem label={t("t.email")}>
                <Field
                  id="email"
                  name="email"
                  label={t("t.email")}
                  placeholder={t("t.email")}
                  error={!!errors?.email}
                  errorMessage={t("errors.requiredFieldError")}
                  validation={{ required: true, pattern: emailRegex }}
                  register={register}
                  type="email"
                  readerOnly
                />
              </ViewItem>
            </GridCell>

            <GridCell>
              <ViewItem label={t("t.role")}>
                <Select
                  id="role"
                  name="role"
                  label={t("t.role")}
                  placeholder={t("t.role")}
                  labelClassName="sr-only"
                  register={register}
                  controlClassName="control"
                  keyPrefix="users"
                  options={roleKeys}
                  error={!!errors?.role}
                  errorMessage={t("errors.requiredFieldError")}
                  validation={{ required: true }}
                />
              </ViewItem>
            </GridCell>
          </GridSection>

          {selectedRoles === RoleOption.JurisdictionalAdmin && (
            <GridSection title={t("t.jurisdiction")} columns={4}>
              <GridCell>
                <ViewItem>
                  <Select
                    id="jurisdictions"
                    name="jurisdictions"
                    label={t("t.jurisdiction")}
                    placeholder={t("t.selectOne")}
                    labelClassName="sr-only"
                    register={register}
                    controlClassName="control"
                    keyPrefix="users"
                    options={jurisdictionOptions}
                    error={!!errors?.jurisdictions}
                    errorMessage={t("errors.requiredFieldError")}
                    validation={{ required: true }}
                  />
                </ViewItem>
              </GridCell>
            </GridSection>
          )}

          {selectedRoles !== RoleOption.Partner ? null : (
            <>
              <GridSection title={t("t.jurisdiction")} columns={4}>
                <GridCell>
                  <ViewItem>
                    <Field
                      id="jurisdiction_all"
                      name="jurisdiction_all"
                      label={t("users.allJurisdictions")}
                      register={register}
                      type="checkbox"
                      inputProps={{
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                          updateAllJurisdictionCheckboxes(e),
                      }}
                    />

                    <FieldGroup
                      name="jurisdictions"
                      fields={jurisdictionOptions}
                      type="checkbox"
                      register={register}
                      error={!!errors?.jurisdictions}
                      errorMessage={t("errors.requiredFieldError")}
                      validation={{ required: true }}
                      dataTestId={"jurisdictions"}
                    />
                  </ViewItem>
                </GridCell>
              </GridSection>
              {selectedJurisdictions && (
                <GridSection columns={4}>
                  {Object.keys(listingsOptions).map((key) => {
                    if (!selectedJurisdictions.includes(key)) {
                      return null
                    }
                    const jurisdictionLabel = jurisdictionOptions.find((elem) => elem.id === key)
                      ?.label
                    return (
                      <GridCell key={`listings_${key}`}>
                        <GridSection
                          title={t("users.jurisdictionalizedListings", {
                            jurisdiction: jurisdictionLabel,
                          })}
                          columns={1}
                        >
                          <GridCell>
                            <ViewItem>
                              <Field
                                id={`listings_all_${key}`}
                                name={`listings_all_${key}`}
                                label={t("users.alljurisdictionalizedListings", {
                                  jurisdiction: jurisdictionLabel,
                                })}
                                register={register}
                                type="checkbox"
                                inputProps={{
                                  onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                                    updateAllCheckboxes(e, key),
                                }}
                              />

                              <FieldGroup
                                name="user_listings"
                                fields={listingsOptions[key]}
                                type="checkbox"
                                register={register}
                                error={!!errors?.user_listings}
                                errorMessage={t("errors.requiredFieldError")}
                                validation={{ required: true }}
                                dataTestId={`listings_${jurisdictionLabel}`}
                              />
                            </ViewItem>
                          </GridCell>
                        </GridSection>
                      </GridCell>
                    )
                  })}
                </GridSection>
              )}
            </>
          )}
        </div>

        <div className="mt-6">
          {mode === "edit" && (
            <Button
              type="button"
              className="mx-1"
              onClick={() => onSave()}
              styleType={AppearanceStyleType.primary}
              loading={isUpdateUserLoading}
            >
              {t("t.save")}
            </Button>
          )}

          {mode === "add" && (
            <Button
              type="button"
              className="mx-1"
              onClick={() => onInvite()}
              styleType={AppearanceStyleType.primary}
              loading={isSendInviteLoading}
              dataTestId={"invite-user"}
            >
              {t("t.invite")}
            </Button>
          )}

          {!user?.confirmedAt && mode === "edit" && (
            <Button
              type="button"
              className="mx-1"
              onClick={() => onInviteResend()}
              styleType={AppearanceStyleType.secondary}
              loading={isResendConfirmationLoading}
            >
              {t("users.resendInvite")}
            </Button>
          )}

          {mode === "edit" && (
            <Button
              type="button"
              className="bg-opacity-0 text-red-700"
              onClick={() => setDeleteModalActive(true)}
              unstyled
            >
              {t("t.delete")}
            </Button>
          )}
        </div>
      </Form>

      <Modal
        open={!!isDeleteModalActive}
        title={t("t.areYouSure")}
        ariaDescription={t("users.doYouWantDeleteUser")}
        onClose={() => setDeleteModalActive(false)}
        actions={[
          <Button
            type="button"
            styleType={AppearanceStyleType.alert}
            loading={isDeleteUserLoading}
            onClick={() => {
              onDelete()
            }}
          >
            {t("t.delete")}
          </Button>,
          <Button
            type="button"
            styleType={AppearanceStyleType.secondary}
            border={AppearanceBorderType.borderless}
            onClick={() => {
              setDeleteModalActive(false)
            }}
          >
            {t("t.cancel")}
          </Button>,
        ]}
      >
        {t("users.doYouWantDeleteUser")}
      </Modal>
    </>
  )
}

export { FormUserManage as default, FormUserManage }

import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Address as AddressType } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { Link } from "@bloom-housing/ui-seeds"

interface AddressProps {
  address: AddressType
  getDirections?: boolean
}

export const oneLineAddress = (address: AddressType) => {
  return `${address.street}${address.street2 ? `, ${address.street2}` : ""}, ${address.city}, ${
    address.state
  } ${address.zipCode}`
}

export const multiLineAddress = (address: AddressType) => {
  return (
    <>
      {address.placeName && <span>{address.placeName}</span>}
      <span>{`${address.street}${address.street2 ? `, ${address.street2}` : ""}`}</span>
      <span>{`${address.city}, ${address.state} ${address.zipCode}`}</span>
    </>
  )
}

export const Address = ({ address, getDirections }: AddressProps) => {
  const googleMapsHref = "https://www.google.com/maps/place/" + oneLineAddress(address)

  return (
    <>
      <div>
        {address.placeName && <div>{address.placeName}</div>}
        <div>{`${address.street}${address.street2 ? `, ${address.street2}` : ""}`}</div>
        <div>{`${address.city}, ${address.state} ${address.zipCode}`}</div>
      </div>
      {getDirections && (
        <p className={"seeds-m-bs-text"}>
          <Link href={googleMapsHref}>{t("t.getDirections")}</Link>
        </p>
      )}
    </>
  )
}

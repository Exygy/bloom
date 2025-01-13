import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Address as AddressType } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { oneLineAddress } from "../lib/helpers"

interface AddressProps {
  address: AddressType
  getDirections?: boolean
}

export const Address = ({ address, getDirections }: AddressProps) => {
  const googleMapsHref = "https://www.google.com/maps/place/" + oneLineAddress(address)

  // todo what is the most accessible way for this to be read
  return (
    <>
      <div>
        {address.placeName && <div>{address.placeName}</div>}
        <div>{`${address.street}${address.street2 ? `, ${address.street2}` : ""}`}</div>
        <div>{`${address.city}, ${address.state} ${address.zipCode}`}</div>
      </div>
      {getDirections && (
        <p>
          <a href={googleMapsHref}>{t("t.getDirections")}</a>
        </p>
      )}
    </>
  )
}

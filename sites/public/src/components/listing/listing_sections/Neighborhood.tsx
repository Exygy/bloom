import * as React from "react"
import { ListingMap, t } from "@bloom-housing/ui-components"
import { Link } from "@bloom-housing/ui-seeds"
import { oneLineAddress } from "@bloom-housing/shared-helpers"
import { Address } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { getGenericAddress } from "../../../lib/helpers"
import { CollapsibleSection } from "../../../patterns/CollapsibleSection"
import styles from "../ListingViewSeeds.module.scss"

type NeighborhoodProps = {
  address: Address
  name: string
}

export const Neighborhood = ({ address, name }: NeighborhoodProps) => {
  const googleMapsHref = "https://www.google.com/maps/place/" + oneLineAddress(address)

  return (
    <CollapsibleSection
      title={t("t.neighborhood")}
      subtitle={t("listings.sections.neighborhoodSubtitle")}
      priority={2}
    >
      <div className={`${styles["mobile-inline-collapse-padding"]} seeds-m-bs-section`}>
        <ListingMap address={getGenericAddress(address)} listingName={name} />
        <Link href={googleMapsHref} newWindowTarget={true} className={"seeds-m-bs-4"}>
          {t("t.getDirections")}
        </Link>
      </div>
    </CollapsibleSection>
  )
}

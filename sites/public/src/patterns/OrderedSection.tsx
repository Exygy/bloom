import React from "react"
import { HeadingGroup } from "@bloom-housing/ui-seeds"
import styles from "./OrderedSection.module.scss"

interface OrderedSectionProps {
  /** Appears after the heading */
  children?: React.ReactNode
  /** Appears after the children */
  note?: string
  /** Number order, appears as a circle on the left */
  order: number
  /** Appears under the title */
  subtitle?: string
  /** Title of the section */
  title: string
}

export const OrderedSection = (props: OrderedSectionProps) => {
  return (
    <li>
      <div className={styles["ordered-section"]}>
        <div className={styles["number-container"]}>
          <div className={styles["number-circle"]}>{props.order}</div>
        </div>
        <div className={styles["content"]}>
          <HeadingGroup
            heading={props.title}
            subheading={props.subtitle}
            headingPriority={3}
            size={"lg"}
            className={`${styles["heading"]}`}
          />
          {props.children && <div className={"seeds-m-bs-content"}>{props.children}</div>}
          {props.note && <p className={styles["note"]}>{props.note}</p>}
        </div>
      </div>
    </li>
  )
}

import React from "react"
import { HeadingGroup } from "@bloom-housing/ui-seeds"
import styles from "./OrderedSection.module.scss"

interface OrderedSectionProps {
  order: number
  title: string
  subtitle?: string
  note?: string
  children?: React.ReactNode
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

import React, { useState } from "react"
import PlusIcon from "@heroicons/react/24/solid/PlusIcon"
import MinusIcon from "@heroicons/react/24/solid/MinusIcon"
import { Heading, Icon } from "@bloom-housing/ui-seeds"
import styles from "./CollapsibleSection.module.scss"

interface CollapsibleSectionProps {
  title: React.ReactNode
  priority?: 1 | 4 | 2 | 3 | 5 | 6
  subtitle?: string
  children: React.ReactNode
  contentClassName?: string
}

export const CollapsibleSection = (props: CollapsibleSectionProps) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={`${styles["collapsible-section"]} ${collapsed ? styles["collapsed-section"] : ""}`}
      aria-expanded={!collapsed}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Collapse section"
        aria-expanded={!collapsed}
        className={styles["collapsible-button"]}
      >
        <div className={styles["header"]}>
          <div className={styles["header-content"]}>
            <Heading priority={props.priority} size={"xl"} className={styles["heading"]}>
              {props.title}
            </Heading>
            {props.subtitle && <p>{props.subtitle}</p>}
          </div>
          <div className={styles["button-container"]}>
            <div className={styles["header-button"]} aria-label="Collapse section">
              {collapsed ? (
                <Icon size={"lg"} aria-label="Expand">
                  <PlusIcon />
                </Icon>
              ) : (
                <Icon size={"lg"} aria-label="Collapse">
                  <MinusIcon />
                </Icon>
              )}
            </div>
          </div>
        </div>
      </button>
      {!collapsed && (
        <div
          className={`${styles["content"]} ${props.contentClassName ? props.contentClassName : ""}`}
        >
          {props.children}
        </div>
      )}
    </div>
  )
}

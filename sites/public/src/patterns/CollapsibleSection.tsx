import React, { useState } from "react"
import PlusIcon from "@heroicons/react/24/solid/PlusIcon"
import MinusIcon from "@heroicons/react/24/solid/MinusIcon"
import { Heading, Icon } from "@bloom-housing/ui-seeds"
import styles from "./CollapsibleSection.module.scss"

interface CollapsibleSectionProps {
  title: string
  priority?: 1 | 4 | 2 | 3 | 5 | 6
  subtitle?: string
  children: React.ReactNode
}

export const CollapsibleSection = (props: CollapsibleSectionProps) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={styles["collapsible-section"]} aria-expanded={!collapsed}>
      <div className={styles["header"]}>
        <div className={styles["header-content"]}>
          <Heading priority={props.priority} size={"xl"} className={styles["heading"]}>
            {props.title}
          </Heading>
          {props.subtitle && <p>{props.subtitle}</p>}
        </div>
        <div className={styles["button-container"]}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={styles["header-button"]}
            aria-label="Collapse section"
            aria-expanded={!collapsed}
          >
            {/* todo change to icon */}
            {collapsed ? (
              <Icon size={"lg"} aria-label="Expand">
                <PlusIcon />
              </Icon>
            ) : (
              <Icon size={"lg"} aria-label="Collapse">
                <MinusIcon />
              </Icon>
            )}
          </button>
        </div>
      </div>
      {!collapsed && <div className={styles["content"]}>{props.children}</div>}
    </div>
  )
}

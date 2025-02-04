import React, { useState } from "react"
import PlusIcon from "@heroicons/react/24/solid/PlusIcon"
import MinusIcon from "@heroicons/react/24/solid/MinusIcon"
import { Heading, Icon } from "@bloom-housing/ui-seeds"
import styles from "./ExpandableTable.module.scss"

interface ExpandableTableProps {
  title: React.ReactNode
  priority?: 1 | 4 | 2 | 3 | 5 | 6
  children: React.ReactNode
  contentClassName?: string
  disableCollapse?: boolean
}

export const ExpandableTable = (props: ExpandableTableProps) => {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div
      className={styles["expandable-table"]}
      aria-expanded={!props.disableCollapse ? !collapsed : null}
    >
      <div className={styles["header"]}>
        <div className={styles["header-content"]}>
          <Heading priority={props.priority} size={"xl"} className={styles["heading"]}>
            {props.title}
          </Heading>
        </div>
        <div className={styles["button-container"]}>
          {!props.disableCollapse && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={styles["header-button"]}
              aria-label="Collapse section"
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <Icon size={"md"} aria-label="Expand">
                  <PlusIcon />
                </Icon>
              ) : (
                <Icon size={"md"} aria-label="Collapse">
                  <MinusIcon />
                </Icon>
              )}
            </button>
          )}
        </div>
      </div>
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

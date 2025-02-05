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

  const HeadingContent = (
    <>
      <Heading priority={props.priority} size={"xl"} className={styles["heading"]}>
        {props.title}
      </Heading>
      {props.subtitle && <p>{props.subtitle}</p>}
    </>
  )

  const sectionId = crypto.randomUUID()

  return (
    <div
      className={`${styles["collapsible-section"]} ${collapsed ? styles["collapsed-section"] : ""}`}
    >
      <div className={"sr-only"}>{HeadingContent}</div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={!collapsed ? "Collapse section" : "Expand section"}
        aria-expanded={!collapsed}
        aria-controls={sectionId}
        className={styles["collapsible-button"]}
      >
        <div className={styles["header"]}>
          <div className={styles["header-content"]}>{HeadingContent}</div>
          <div className={styles["button-container"]}>
            <div className={styles["header-button"]}>
              {collapsed ? (
                <Icon size={"lg"}>
                  <PlusIcon />
                </Icon>
              ) : (
                <Icon size={"lg"}>
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
          id={sectionId}
        >
          {props.children}
        </div>
      )}
    </div>
  )
}

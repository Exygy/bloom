import React, { useState } from "react"
import PlusIcon from "@heroicons/react/24/solid/PlusIcon"
import MinusIcon from "@heroicons/react/24/solid/MinusIcon"
import { Heading, Icon } from "@bloom-housing/ui-seeds"
import styles from "./ExpandableSection.module.scss"

interface ExpandableSectionProps {
  /** All content under the title */
  children: React.ReactNode
  /** Class name applied around children */
  contentClassName?: string
  /** Toggles if the sections should expand or not */
  disableCollapse?: boolean
  /** Heading priority level */
  priority?: 1 | 4 | 2 | 3 | 5 | 6
  /** Title within the expandable section */
  title: React.ReactNode
  /** Unique ID for accessibility */
  uniqueId: string
}

interface ButtonWrapperProps {
  children: React.ReactNode
  collapsed: boolean
  controlsId: string
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const ButtonWrapper = (props: ButtonWrapperProps) => {
  return (
    <button
      onClick={() => props.setCollapsed(!props.collapsed)}
      className={styles["button-wrapper"]}
      aria-label={!props.collapsed ? "Collapse section" : "Expand section"}
      aria-expanded={!props.collapsed}
      aria-controls={props.controlsId}
    >
      {props.children}
    </button>
  )
}

export const ExpandableSection = (props: ExpandableSectionProps) => {
  const [collapsed, setCollapsed] = useState(true)

  const HeadingContent = (
    <Heading priority={props.priority} size={"xl"} className={styles["heading"]}>
      {props.title}
    </Heading>
  )

  const SectionContent = (
    <div className={styles["expandable-section"]} id={props.uniqueId}>
      <div className={styles["header"]}>
        <div className={styles["header-content"]}>{HeadingContent}</div>
        <div className={styles["button-container"]}>
          {!props.disableCollapse && (
            <div className={styles["header-button"]}>
              <Icon size={"md"}>{collapsed ? <PlusIcon /> : <MinusIcon />}</Icon>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {!props.disableCollapse ? (
        <>
          <div className={"sr-only"}>{HeadingContent}</div>
          <ButtonWrapper
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            controlsId={props.uniqueId}
          >
            {SectionContent}
          </ButtonWrapper>
        </>
      ) : (
        <>{SectionContent}</>
      )}
      {!collapsed && (
        <div
          className={`${styles["content"]} ${props.contentClassName ? props.contentClassName : ""}`}
        >
          {props.children}
        </div>
      )}
    </>
  )
}

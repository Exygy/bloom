import React, { useState } from "react"
import PlusIcon from "@heroicons/react/24/solid/PlusIcon"
import MinusIcon from "@heroicons/react/24/solid/MinusIcon"
import { Heading, Icon } from "@bloom-housing/ui-seeds"
import styles from "./ExpandableSection.module.scss"

interface ExpandableSectionProps {
  title: React.ReactNode
  priority?: 1 | 4 | 2 | 3 | 5 | 6
  children: React.ReactNode
  contentClassName?: string
  disableCollapse?: boolean
}

interface ButtonWrapperProps {
  children: React.ReactNode
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const ButtonWrapper = (props: ButtonWrapperProps) => {
  return (
    <button
      onClick={() => props.setCollapsed(!props.collapsed)}
      className={styles["button-wrapper"]}
      aria-label="Collapse section"
      aria-expanded={!props.collapsed}
    >
      {props.children}
    </button>
  )
}

export const ExpandableSection = (props: ExpandableSectionProps) => {
  const [collapsed, setCollapsed] = useState(true)

  const SectionContent = (
    <div
      className={styles["expandable-section"]}
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
            <div className={styles["header-button"]}>
              {collapsed ? (
                <Icon size={"md"} aria-label="Expand">
                  <PlusIcon />
                </Icon>
              ) : (
                <Icon size={"md"} aria-label="Collapse">
                  <MinusIcon />
                </Icon>
              )}
            </div>
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

  return (
    <>
      {!props.disableCollapse ? (
        <ButtonWrapper collapsed={collapsed} setCollapsed={setCollapsed}>
          {SectionContent}
        </ButtonWrapper>
      ) : (
        <>{SectionContent}</>
      )}
    </>
  )
}

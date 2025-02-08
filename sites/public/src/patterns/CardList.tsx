import React from "react"
import { Heading, Card } from "@bloom-housing/ui-seeds"
import styles from "./CardList.module.scss"

export interface ContentCardProps {
  /** Content within the card */
  children?: React.ReactNode
  /** Description below the heading */
  description?: React.ReactNode
  /** Heading priority */
  priority?: 1 | 2 | 3 | 4 | 5 | 6
  /** Heading at the top of the card */
  heading: string
}

export const ContentCard = (props: ContentCardProps) => {
  return (
    <Card spacing="sm" className={styles["content-card"]}>
      <Card.Section>
        <Heading size="md" priority={props.priority ?? 4} className={styles["header"]}>
          {props.heading}
        </Heading>
        {props.description && <div className={styles.description}>{props.description}</div>}
        {props.children && <div>{props.children}</div>}
      </Card.Section>
    </Card>
  )
}

export interface CardListProps {
  /** An array of ContentCards */
  cardContent: ContentCardProps[]
  /** Heading priority level for each card */
  priority?: 1 | 2 | 3 | 4 | 5 | 6
}

export const CardList = (props: CardListProps) => {
  return (
    <div>
      {props.cardContent.map((card, index) => {
        return (
          <div className={styles["card-container"]} key={index}>
            <ContentCard
              heading={card.heading}
              description={card.description}
              key={index}
              priority={props.priority}
            />
          </div>
        )
      })}
    </div>
  )
}

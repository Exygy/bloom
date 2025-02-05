import React from "react"
import { Heading, Card } from "@bloom-housing/ui-seeds"
import styles from "./CardList.module.scss"

interface ContentCardProps {
  title: string
  description?: React.ReactNode
  priority?: 1 | 4 | 2 | 3 | 5 | 6
  children?: React.ReactNode
}

export const ContentCard = (props: ContentCardProps) => {
  return (
    <Card spacing="sm" className={styles["content-card"]}>
      <Card.Section>
        <Heading size="md" priority={props.priority ?? 4} className={styles["header"]}>
          {props.title}
        </Heading>
        {props.description && <div className={styles.description}>{props.description}</div>}
        {props.children && <div>{props.children}</div>}
      </Card.Section>
    </Card>
  )
}

interface CardListProps {
  cardContent: { title: string; description: React.ReactNode }[]
  priority?: 1 | 4 | 2 | 3 | 5 | 6
  ordered?: boolean
}

export const CardList = (props: CardListProps) => {
  return (
    <div>
      {props.cardContent.map((card, index) => {
        return (
          <div className={styles["card-container"]} key={index}>
            {props.ordered && (
              <div className={styles["card-number-container"]}>
                <div className={styles["number-circle"]}>{index + 1}</div>
              </div>
            )}
            <ContentCard
              title={card.title}
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

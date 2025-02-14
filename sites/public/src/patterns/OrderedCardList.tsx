import React from "react"
import { ContentCard, ContentCardProps } from "./CardList"
import cardListStyles from "./CardList.module.scss"
import styles from "./OrderedCardList.module.scss"

interface OrderedCardListProps {
  /** An array of ContentCards */
  cardContent: ContentCardProps[]
  /** Heading priority level for each card */
  priority?: 1 | 2 | 3 | 4 | 5 | 6
}

export const OrderedCardList = (props: OrderedCardListProps) => {
  return (
    <ol>
      {props.cardContent.map((card, index) => {
        return (
          <li className={styles["list-item"]} key={index}>
            <div className={cardListStyles["card-container"]} key={index}>
              <div className={styles["card-number-container"]}>
                <div className={styles["number-circle"]}>{index + 1}</div>
              </div>

              <ContentCard
                heading={card.heading}
                description={card.description}
                priority={props.priority}
              />
            </div>
          </li>
        )
      })}
    </ol>
  )
}

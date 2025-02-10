import React, { useState } from "react"
import Markdown from "markdown-to-jsx"
import styles from "./ReadMore.module.scss"

interface ReadMoreProps {
  /** Full content to display */
  content?: string
  /** Maximum number of characters that will appear before truncating */
  maxLength?: number
  /** Default state for expanded, otherwise set to false */
  expanded?: boolean
}

export const ReadMore = (props: ReadMoreProps) => {
  const DEFAULT_MAX_LENGTH = 350
  const computedMaxLength = props.maxLength ?? DEFAULT_MAX_LENGTH
  const [expanded, setExpanded] = useState(props.expanded || false)

  const shouldTruncate = props.content.length > computedMaxLength

  // Clips at the end of the nearest word after the max length, instead of in the middle of a word
  const truncatedIndex = props.content.indexOf(" ", computedMaxLength)

  const contentTruncated = shouldTruncate
    ? props.content.slice(0, truncatedIndex).concat("...")
    : props.content

  return (
    <div className={styles["read-more"]} aria-live={"polite"}>
      <Markdown id={"read-more-content"}>{expanded ? props.content : contentTruncated}</Markdown>
      {shouldTruncate && (
        <button
          className={`${styles["read-more-button"]} seeds-m-bs-text`}
          onClick={() => {
            setExpanded(!expanded)
          }}
          aria-label={"Read more"}
          aria-expanded={expanded}
          aria-controls={"read-more-content"}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  )
}

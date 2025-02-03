import * as React from "react"
import { t } from "@bloom-housing/ui-components"

type DownloadLotteryResultsProps = {
  resultsDate?: string
  buttonText?: string
  pdfURL?: string
  strings?: {
    sectionHeader?: string
  }
}

const DownloadLotteryResults = (props: DownloadLotteryResultsProps) => {
  if (!props.pdfURL) return null
  return (
    <section className="aside-block text-center">
      <h2 className="text-caps pb-4">
        {props.strings?.sectionHeader ?? t("listings.lotteryResults.header")}
      </h2>
      {props.resultsDate && (
        <p className="uppercase text-gray-800 text-sm font-semibold pb-4">{props.resultsDate}</p>
      )}
      <a
        className="button is-primary w-full mb-2"
        href={props.pdfURL}
        title={props.buttonText}
        target="_blank"
      >
        {props.buttonText ?? t("listings.lotteryResults.downloadResults")}
      </a>
    </section>
  )
}

export { DownloadLotteryResults as default, DownloadLotteryResults }

import dayjs from "dayjs"

export const getTimeRangeString = (start: Date, end: Date) => {
  const startTime = dayjs(start).format("h:mma")
  const startString = start ? startTime : ""
  const endTime = dayjs(end).format("h:mma")
  const endString = end && start ? ` - ${endTime}` : ""
  return startTime === endTime ? startString : `${startString}${endString}`
}

export const getCurrencyRange = (min: number | null, max: number | null) => {
  const minString = min?.toString()
  const maxString = max?.toString()
  if (!!minString && !!maxString && minString !== maxString) {
    return `$${min} – $${max}`
  }
  return !!minString || !!maxString ? `$${minString ? min : max}` : ""
}

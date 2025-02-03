import dayjs from "dayjs"

export const getTimeRangeString = (start: Date, end: Date) => {
  const startTime = dayjs(start).format("hh:mma")
  const startString = start ? startTime : ""
  const endTime = dayjs(end).format("hh:mma")
  const endString = end && start ? ` - ${endTime}` : ""
  return startTime === endTime ? startString : `${startString}${endString}`
}

export const getCurrencyRange = (min: number | null, max: number | null) => {
  if (min && max && min !== max) {
    return `$${min} – $${max}`
  }
  return min || max ? `$${min ? min : max}` : ""
}

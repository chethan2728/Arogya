const parseSlotDateTime = (slotDate, slotTime) => {
  if (!slotDate || !slotTime) return null
  const [d, m, y] = String(slotDate).split('_').map(Number)
  if (!d || !m || !y) return null

  const match = String(slotTime).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return new Date(y, m - 1, d)

  let hour = Number(match[1])
  const minute = Number(match[2])
  const meridiem = match[3].toUpperCase()
  if (meridiem === 'PM' && hour !== 12) hour += 12
  if (meridiem === 'AM' && hour === 12) hour = 0

  return new Date(y, m - 1, d, hour, minute, 0, 0)
}

const median = (values) => {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2
  return sorted[mid]
}

export const calculateDashboardMetrics = ({ appointments, carePlans, now = new Date() }) => {
  const total = appointments.length || 0
  const nonCancelled = appointments.filter((a) => !a.cancelled)
  const successful = nonCancelled.filter((a) => a.payment || a.isCompleted)
  const bookingSuccessRate = total ? (successful.length / total) * 100 : 0

  const pastScheduled = nonCancelled.filter((a) => {
    const slotDate = parseSlotDateTime(a.slotDate, a.slotTime)
    return slotDate && slotDate < now
  })
  const noShows = pastScheduled.filter((a) => !a.isCompleted)
  const noShowRate = pastScheduled.length ? (noShows.length / pastScheduled.length) * 100 : 0

  const plansWithReminder = carePlans.filter((p) => p.lastReminderAt)
  let reminderConverted = 0
  plansWithReminder.forEach((plan) => {
    const reminderTime = new Date(plan.lastReminderAt)
    const windowEnd = new Date(reminderTime.getTime() + 7 * 24 * 60 * 60 * 1000)
    const converted = appointments.some((a) =>
      String(a.userId) === String(plan.userId) &&
      String(a.docId) === String(plan.docId) &&
      new Date(a.date) >= reminderTime &&
      new Date(a.date) <= windowEnd
    )
    if (converted) reminderConverted += 1
  })
  const reminderEffectiveness = plansWithReminder.length
    ? (reminderConverted / plansWithReminder.length) * 100
    : 0

  const leadTimesHours = appointments
    .map((a) => {
      const bookedAt = new Date(a.date)
      const slotAt = parseSlotDateTime(a.slotDate, a.slotTime)
      if (!slotAt || Number.isNaN(bookedAt.getTime())) return null
      const diff = (slotAt.getTime() - bookedAt.getTime()) / (1000 * 60 * 60)
      return diff >= 0 ? diff : null
    })
    .filter((v) => v !== null)

  return {
    bookingSuccessRate: Number(bookingSuccessRate.toFixed(1)),
    noShowRate: Number(noShowRate.toFixed(1)),
    reminderEffectiveness: Number(reminderEffectiveness.toFixed(1)),
    medianTimeToBookHours: Number(median(leadTimesHours).toFixed(1)),
  }
}

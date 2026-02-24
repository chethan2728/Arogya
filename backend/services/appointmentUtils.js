export const parseSlotDateTime = (slotDate, slotTime) => {
  if (!slotDate || !slotTime) return null

  const [day, month, year] = String(slotDate).split('_').map(Number)
  if (!day || !month || !year) return null

  const match = String(slotTime).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return new Date(year, month - 1, day)

  let hour = Number(match[1])
  const minute = Number(match[2])
  const meridiem = match[3].toUpperCase()

  if (meridiem === 'PM' && hour !== 12) hour += 12
  if (meridiem === 'AM' && hour === 12) hour = 0

  return new Date(year, month - 1, day, hour, minute, 0, 0)
}

export const hoursUntilAppointment = (slotDate, slotTime, now = new Date()) => {
  const slotAt = parseSlotDateTime(slotDate, slotTime)
  if (!slotAt) return null
  return (slotAt.getTime() - now.getTime()) / (1000 * 60 * 60)
}

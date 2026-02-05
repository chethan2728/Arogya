import twilio from 'twilio';

const normalizeNumber = (phone) => {
    if (!phone) return null
    if (phone === '0000000000') return null
    if (phone.startsWith('+')) return phone
    const defaultCode = process.env.DEFAULT_COUNTRY_CODE || ''
    if (!defaultCode) return null
    return `+${defaultCode}${phone}`
}

export const sendSms = async (to, message) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_FROM_NUMBER

    if (!accountSid || !authToken || !fromNumber) return

    const toNumber = normalizeNumber(to)
    if (!toNumber) return

    const client = twilio(accountSid, authToken)
    await client.messages.create({
        body: message,
        from: fromNumber,
        to: toNumber
    })
}

export { normalizeNumber }

import cron from 'node-cron';
import twilio from 'twilio';
import carePlanModel from '../models/carePlanModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';

const sendReminder = async (client, fromNumber, plan) => {
    if (plan.lastReminderAt) {
        const last = new Date(plan.lastReminderAt)
        const now = new Date()
        if (last.toDateString() === now.toDateString()) {
            return
        }
    }
    const user = await userModel.findById(plan.userId).select('name phone')
    const doctor = await doctorModel.findById(plan.docId).select('name speciality')

    if (!user || !doctor) return
    if (!user.phone || user.phone === '0000000000') return
    const defaultCode = process.env.DEFAULT_COUNTRY_CODE || ''
    const toNumber = user.phone.startsWith('+') ? user.phone : (defaultCode ? `+${defaultCode}${user.phone}` : null)
    if (!toNumber) return

    const message = `AROGYA reminder: Hi ${user.name}, please follow up with Dr. ${doctor.name} (${doctor.speciality}). Reply to confirm or book your next visit.`

    await client.messages.create({
        body: message,
        from: fromNumber,
        to: toNumber
    })

    plan.lastReminderAt = new Date()
    await plan.save()
}

const startReminderScheduler = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_FROM_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
        console.log('Twilio env not set. Reminders are disabled.')
        return
    }

    const client = twilio(accountSid, authToken)
    const reminderHour = process.env.REMINDER_HOUR || '9'

    cron.schedule(`0 ${reminderHour} * * *`, async () => {
        try {
            const plans = await carePlanModel.find({ active: true })
            for (const plan of plans) {
                await sendReminder(client, fromNumber, plan)
            }
        } catch (error) {
            console.log('Reminder error', error.message)
        }
    })
}

export default startReminderScheduler;

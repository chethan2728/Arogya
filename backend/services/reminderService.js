import cron from 'node-cron';
import carePlanModel from '../models/carePlanModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import { sendSms } from './smsService.js';
import { hoursUntilAppointment } from './appointmentUtils.js';

const sendReminder = async (plan) => {
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
    const message = `AROGYA reminder: Hi ${user.name}, please follow up with Dr. ${doctor.name} (${doctor.speciality}). Reply to confirm or book your next visit.`
    await sendSms(user.phone, message)

    const doctorMessage = `AROGYA reminder: Dr. ${doctor.name}, please follow up with patient ${user.name}.`
    await sendSms(doctor.phone, doctorMessage)

    plan.lastReminderAt = new Date()
    await plan.save()
}

const sendAppointmentReminder = async (appointment, stage) => {
    const user = await userModel.findById(appointment.userId).select('name phone')
    const doctor = await doctorModel.findById(appointment.docId).select('name')
    if (!user || !doctor) return

    const stageText = stage === 'h24'
        ? 'in about 24 hours'
        : stage === 'h2'
            ? 'in about 2 hours'
            : 'in about 30 minutes'

    const msg = `AROGYA reminder: Hi ${user.name}, your appointment with Dr. ${doctor.name} is ${stageText} (${appointment.slotDate} ${appointment.slotTime}). Please confirm attendance in My Appointments.`
    await sendSms(user.phone, msg)
}

const runAppointmentReminders = async () => {
    const appointments = await appointmentModel.find({
        cancelled: false,
        isCompleted: false
    })

    for (const appt of appointments) {
        const hoursLeft = hoursUntilAppointment(appt.slotDate, appt.slotTime)
        if (hoursLeft === null || hoursLeft < 0) continue

        const updates = {}
        if (!appt.remindersSent?.h24 && hoursLeft <= 24 && hoursLeft > 23) {
            await sendAppointmentReminder(appt, 'h24')
            updates['remindersSent.h24'] = true
        }
        if (!appt.remindersSent?.h2 && hoursLeft <= 2 && hoursLeft > 1.8) {
            await sendAppointmentReminder(appt, 'h2')
            updates['remindersSent.h2'] = true
        }
        if (!appt.remindersSent?.m30 && hoursLeft <= 0.5 && hoursLeft > 0.3) {
            await sendAppointmentReminder(appt, 'm30')
            updates['remindersSent.m30'] = true
        }

        if (Object.keys(updates).length) {
            await appointmentModel.updateOne({ _id: appt._id }, { $set: updates })
        }
    }
}

const startReminderScheduler = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_FROM_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
        console.log('Twilio env not set. Reminders are disabled.')
        return
    }

    const reminderHour = process.env.REMINDER_HOUR || '9'

    cron.schedule(`0 ${reminderHour} * * *`, async () => {
        try {
            const plans = await carePlanModel.find({ active: true })
            for (const plan of plans) {
                await sendReminder(plan)
            }
        } catch (error) {
            console.log('Reminder error', error.message)
        }
    })

    // checks every 15 minutes for 24h/2h/30m appointment reminders
    cron.schedule('*/15 * * * *', async () => {
        try {
            await runAppointmentReminders()
        } catch (error) {
            console.log('Appointment reminder error', error.message)
        }
    })
}

export default startReminderScheduler;

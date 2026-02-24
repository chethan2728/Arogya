import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    attendanceConfirmed: { type: Boolean, default: false },
    rescheduleRequested: { type: Boolean, default: false },
    remindersSent: {
        h24: { type: Boolean, default: false },
        h2: { type: Boolean, default: false },
        m30: { type: Boolean, default: false }
    }
})

// Checking if the model exists before creating a new one to avoid errors during hot-reloads
const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema)

export default appointmentModel

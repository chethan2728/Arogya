import validator from 'validator';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js'
import carePlanModel from '../models/carePlanModel.js';
import { sendSms } from '../services/smsService.js';
import razorpay from 'razorpay'
import uploadImageToCloudinary from '../services/imageService.js';
import uploadReportToCloudinary from '../services/reportUploadService.js';
import { analyzeSymptomsNLP } from '../services/nlpTriageService.js';
import { verifyRazorpaySignature } from '../services/paymentService.js';
import { parseSlotDateTime } from '../services/appointmentUtils.js';
import { buildAiChatResponse } from '../services/aiChatService.js';
import { generateNaturalReply } from '../services/llmReplyService.js';

const blockedNameWords = new Set([
    'vomiting', 'vomit', 'fever', 'pain', 'rash', 'itch', 'nausea', 'dizzy', 'headache',
    'cough', 'cold', 'disease', 'symptom'
])

const isAllowedAssistantName = (value = '') => {
    const trimmed = value.trim()
    const lower = trimmed.toLowerCase()
    if (!trimmed) return false
    if (blockedNameWords.has(lower)) return false
    return /^[a-zA-Z][a-zA-Z\s]{1,39}$/.test(trimmed)
}

const getResolvedDisplayName = (user) => {
    const preferred = user?.aiMemory?.preferredName || ''
    if (isAllowedAssistantName(preferred)) return preferred
    return user?.name || ''
}

const computeAdherenceStreak = (visits = []) => {
    const dates = visits
        .map((v) => {
            const dt = new Date(v.date)
            if (Number.isNaN(dt.getTime())) return null
            return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime()
        })
        .filter(Boolean)
        .sort((a, b) => b - a)

    if (!dates.length) return 0
    let streak = 1
    for (let i = 0; i < dates.length - 1; i += 1) {
        const diffDays = Math.round((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24))
        if (diffDays <= 1) streak += 1
        else break
    }
    return streak
}

const buildFollowupTimeline = (appointments = [], health = { records: [] }) => {
    const completed = appointments
        .filter((a) => a.isCompleted)
        .sort((a, b) => b.date - a.date)

    if (!completed.length) return []

    const latest = completed[0]
    const base = new Date(latest.date)
    const hasRecentRecord = (days) => {
        const windowStart = new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
        return (health.records || []).some((r) => new Date(r.createdAt) >= windowStart)
    }

    const mkDate = (days) => new Date(base.getTime() + days * 24 * 60 * 60 * 1000)

    return [
        {
            id: 'upload_reports',
            title: 'Upload reports',
            dueAt: mkDate(3),
            status: hasRecentRecord(1) ? 'done' : 'pending'
        },
        {
            id: 'adherence_check',
            title: 'Medication adherence check-in',
            dueAt: mkDate(7),
            status: hasRecentRecord(5) ? 'done' : 'pending'
        },
        {
            id: 'next_visit',
            title: 'Book follow-up consultation',
            dueAt: mkDate(30),
            status: 'pending'
        }
    ]
}


// API to register user
const registerUser = async (req, res) => {

    try {


        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid Email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "enter a valid email" })
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword,
            address: ""
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        const isMatch = bcrypt.compareSync(password, user.password);

        if (isMatch) {
            const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const getProfile = async (req, res) => {
    try {

        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')
        res.json({ success: true, data: userData })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body;
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Missing Details" });
        }

        let parsedAddress = address
        if (typeof address === 'string') {
            try {
                parsedAddress = JSON.parse(address)
            } catch (error) {
                return res.json({ success: false, message: "Invalid address format" })
            }
        }

        const updateData = { name, phone, address: parsedAddress, dob, gender }

        if (imageFile) {
            const imageUrl = await uploadImageToCloudinary(imageFile, 'arogya/users')
            updateData.image = imageUrl
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).select('-password')

        res.json({ success: true, message: "Profile Updated Successfully", user: updatedUser });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const bookAppointment = async (req, res) => {
    try {

        const { userId, docId, slotDate, slotTime } = req.body

        if (!docId || !slotDate || !slotTime) {
            return res.json({ success: false, message: 'Missing booking details' })
        }

        const docData = await doctorModel.findById(docId).select('-password')
        if (!docData) {
            return res.json({ success: false, message: 'Doctor not found' })
        }
        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not availabel' })
        }

        // Atomic slot lock: only reserve if doctor is available and slot is not already booked.
        const slotPath = `slots_booked.${slotDate}`
        const lockResult = await doctorModel.updateOne(
            {
                _id: docId,
                available: true,
                [slotPath]: { $ne: slotTime }
            },
            {
                $push: { [slotPath]: slotTime }
            }
        )

        if (!lockResult.modifiedCount) {
            return res.json({ success: false, message: 'Slot not available' })
        }

        const userData = await userModel.findById(userId).select('-password')
        if (!userData) {
            // Best effort rollback of slot lock if user is invalid.
            await doctorModel.updateOne({ _id: docId }, { $pull: { [slotPath]: slotTime } })
            return res.json({ success: false, message: 'User not found' })
        }

        const doctorSnapshot = docData.toObject()
        delete doctorSnapshot.slots_booked

        const appoitmentData = {
            userId,
            docId,
            docData: doctorSnapshot,
            userData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appoitmentData)
        await newAppointment.save()

        const existingPlan = await carePlanModel.findOne({ userId, docId, active: true })
        if (!existingPlan) {
            await carePlanModel.create({ userId, docId })
        }

        const userMessage = `AROGYA: Your appointment is confirmed with Dr. ${docData.name} (${docData.speciality}) on ${slotDate} at ${slotTime}.`
        await sendSms(userData.phone, userMessage)

        const doctorMessage = `AROGYA: New appointment booked by ${userData.name} on ${slotDate} at ${slotTime}.`
        await sendSms(docData.phone, doctorMessage)

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// backend/controllers/userController.js
const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body; // Provided by authUser middleware
        const appointments = await appointmentModel.find({ userId });
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)


        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

const paymentRazorpay = async (req, res) => {

    try {


        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment cancelled or not found" })
        }

        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.json({ success: false, message: "Invalid payment payload" })
        }

        const isSignatureValid = verifyRazorpaySignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            secret: process.env.RAZORPAY_KEY_SECRET,
        })
        if (!isSignatureValid) {
            return res.json({ success: false, message: "Payment signature verification failed" })
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
     
        if (orderInfo.status === 'paid') {
            const appointmentId = orderInfo.receipt
            const appointment = await appointmentModel.findById(appointmentId)
            if (!appointment) {
                return res.json({ success: false, message: "Appointment not found for payment" })
            }
            if (String(appointment.userId) !== String(userId)) {
                return res.json({ success: false, message: "Unauthorized payment verification" })
            }
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            return res.json({ success: true, message: "payment successful" })
        }
        return res.json({ success: false, message: "payment failed" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

const addHealthVisit = async (req, res) => {
    try {
        const { userId, date, notes } = req.body
        if (!date) {
            return res.json({ success: false, message: "Visit date is required" })
        }
        const visit = { date, notes: notes || "", createdAt: Date.now() }
        await userModel.findByIdAndUpdate(userId, { $push: { "health.visits": visit } })
        res.json({ success: true, message: "Visit added" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const addHealthRecord = async (req, res) => {
    try {
        const { userId, title, notes } = req.body
        const reportFile = req.file
        if (!title && !reportFile) {
            return res.json({ success: false, message: "Record title or report file is required" })
        }
        let reportUrl = ''
        if (reportFile) {
            reportUrl = await uploadReportToCloudinary(reportFile, 'arogya/reports')
        }
        const record = {
            title: title || reportFile?.originalname || "Uploaded report",
            notes: notes || "",
            fileUrl: reportUrl,
            fileName: reportFile?.originalname || "",
            createdAt: Date.now()
        }
        await userModel.findByIdAndUpdate(userId, { $push: { "health.records": record } })
        res.json({ success: true, message: "Record added" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const getHealth = async (req, res) => {
    try {
        const { userId } = req.body
        const user = await userModel.findById(userId).select('health')
        const appointments = await appointmentModel.find({ userId })
        const plans = await carePlanModel.find({ userId, active: true })
        const docIds = plans.map(plan => plan.docId)
        const doctors = await doctorModel.find({ _id: { $in: docIds } }).select('name speciality')
        const docMap = doctors.reduce((acc, doc) => {
            acc[doc._id.toString()] = doc
            return acc
        }, {})
        const activePlans = plans.map(plan => ({
            _id: plan._id,
            docId: plan.docId,
            doctor: docMap[plan.docId] || null,
            startedAt: plan.startedAt
        }))

        const now = new Date()
        const upcomingAppointments = appointments.filter((a) => {
            if (a.cancelled) return false
            const slotAt = parseSlotDateTime(a.slotDate, a.slotTime)
            return slotAt && slotAt > now
        }).length
        const completedAppointments = appointments.filter((a) => a.isCompleted).length
        const adherenceStreak = computeAdherenceStreak(user?.health?.visits || [])
        const followupTimeline = buildFollowupTimeline(appointments, user?.health || { records: [] })
        const pendingActions = followupTimeline.filter((f) => f.status === 'pending').length

        res.json({
            success: true,
            health: user?.health || { visits: [], records: [] },
            activePlans,
            progress: {
                upcomingAppointments,
                completedAppointments,
                adherenceStreak,
                pendingActions
            },
            followupTimeline
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const endCarePlanUser = async (req, res) => {
    try {
        const { userId, docId, reason } = req.body
        if (!docId) {
            return res.json({ success: false, message: "Doctor ID required" })
        }
        const plan = await carePlanModel.findOne({ userId, docId, active: true })
        if (!plan) {
            return res.json({ success: false, message: "No active care plan found" })
        }
        plan.active = false
        plan.endedAt = new Date()
        plan.endedBy = "patient"
        plan.endedReason = reason || ""
        await plan.save()
        res.json({ success: true, message: "Care plan ended" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const analyzeSymptoms = async (req, res) => {
    try {
        const { symptoms } = req.body
        if (!symptoms || !symptoms.trim()) {
            return res.json({ success: false, message: "Symptoms are required" })
        }

        const analysis = analyzeSymptomsNLP(symptoms)
        if (analysis.emergencyEscalation) {
            analysis.escalationMessage = 'Possible emergency indicators detected. Please seek emergency care immediately or call local emergency services.'
        }
        res.json({ success: true, analysis })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const aiChat = async (req, res) => {
    try {
        const { userId, message, context = {} } = req.body
        if (!message || !message.trim()) {
            return res.json({ success: false, message: "Message is required" })
        }

        const user = await userModel.findById(userId).select('name aiMemory')
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        const displayName = getResolvedDisplayName(user)
        const decision = buildAiChatResponse({ message, context, displayName })
        const naturalReply = await generateNaturalReply({ message, displayName, decision })

        let nameStatusMessage = null
        if (decision.nameCandidate) {
            if (user.aiMemory?.preferredName) {
                nameStatusMessage = "Name memory is already set for this account. Use profile update if you need to change it."
            } else {
                await userModel.findByIdAndUpdate(userId, {
                    $set: {
                        "aiMemory.preferredName": decision.nameCandidate,
                        "aiMemory.updatedAt": new Date()
                    }
                })
                nameStatusMessage = `Nice to meet you, ${decision.nameCandidate}. I will remember your name next time too.`
            }
        }

        if (decision.preferences) {
            const update = { "aiMemory.updatedAt": new Date() }
            if (decision.preferences.budget !== undefined && decision.preferences.budget !== null) {
                update["aiMemory.preferences.budget"] = Number(decision.preferences.budget)
            }
            if (decision.preferences.speciality !== undefined) {
                update["aiMemory.preferences.speciality"] = decision.preferences.speciality
            }
            if (decision.preferences.timePreference !== undefined) {
                update["aiMemory.preferences.timePreference"] = decision.preferences.timePreference
            }
            await userModel.findByIdAndUpdate(userId, { $set: update })
        }

        res.json({
            success: true,
            ...decision,
            reply: naturalReply || decision.reply,
            nameStatusMessage
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const confirmAttendance = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body
        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment || String(appointment.userId) !== String(userId)) {
            return res.json({ success: false, message: "Appointment not found" })
        }
        await appointmentModel.findByIdAndUpdate(appointmentId, { attendanceConfirmed: true })
        res.json({ success: true, message: "Attendance confirmed" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const requestReschedule = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body
        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment || String(appointment.userId) !== String(userId)) {
            return res.json({ success: false, message: "Appointment not found" })
        }
        await appointmentModel.findByIdAndUpdate(appointmentId, { rescheduleRequested: true })
        res.json({ success: true, message: "Reschedule request submitted" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const getAiMemory = async (req, res) => {
    try {
        const { userId } = req.body
        const user = await userModel.findById(userId).select('name email aiMemory')
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        res.json({
            success: true,
            memory: {
                preferredName: getResolvedDisplayName(user),
                preferences: user.aiMemory?.preferences || {},
                updatedAt: user.aiMemory?.updatedAt || null
            }
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const setAiMemoryName = async (req, res) => {
    try {
        const { userId, preferredName, allowOverwrite } = req.body
        if (!preferredName || !preferredName.trim()) {
            return res.json({ success: false, message: "Name is required" })
        }

        const sanitized = preferredName.trim().slice(0, 40)
        if (!isAllowedAssistantName(sanitized)) {
            return res.json({ success: false, message: "Please provide a valid person name." })
        }
        const user = await userModel.findById(userId).select('aiMemory.preferredName')
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        if (user.aiMemory?.preferredName && !allowOverwrite) {
            return res.json({
                success: false,
                message: "Name memory is already set for this account. Confirm overwrite to change it."
            })
        }
        await userModel.findByIdAndUpdate(userId, {
            $set: {
                "aiMemory.preferredName": sanitized,
                "aiMemory.updatedAt": new Date()
            }
        })

        res.json({ success: true, message: "Name memory updated", preferredName: sanitized })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const setAiMemoryPreferences = async (req, res) => {
    try {
        const { userId, budget, speciality, timePreference } = req.body
        const update = {
            "aiMemory.updatedAt": new Date()
        }
        if (budget !== undefined && budget !== null) update["aiMemory.preferences.budget"] = Number(budget)
        if (speciality !== undefined) update["aiMemory.preferences.speciality"] = speciality
        if (timePreference !== undefined) update["aiMemory.preferences.timePreference"] = timePreference

        await userModel.findByIdAndUpdate(userId, { $set: update })
        res.json({ success: true, message: "Preference memory updated" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    addHealthVisit,
    addHealthRecord,
    getHealth,
    endCarePlanUser,
    analyzeSymptoms,
    aiChat,
    confirmAttendance,
    requestReschedule,
    getAiMemory,
    setAiMemoryName,
    setAiMemoryPreferences
}

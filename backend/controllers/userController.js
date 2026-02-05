import validator from 'validator';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js'
import carePlanModel from '../models/carePlanModel.js';
import { sendSms } from '../services/smsService.js';
import razorpay from 'razorpay'


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

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Address is already an object because we are sending JSON from the frontend
        await userModel.findByIdAndUpdate(userId, { name, phone, address, dob, gender });

        res.json({ success: true, message: "Profile Updated Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const bookAppointment = async (req, res) => {
    try {

        const { userId, docId, slotDate, slotTime } = req.body

        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not availabel' })
        }
        if (!docData.available) {
            return res.json({ success: false, message: "Doctor not available at the moment" });
        }

        let slots_booked = docData.slots_booked

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot not available' })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appoitmentData = {
            userId,
            docId,
            docData,
            userData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appoitmentData)
        await newAppointment.save()

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

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
        const {razorpay_order_id} = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
     
        if (orderInfo.status == 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
            res.json({success:true,message:"payment successful"})
        } else{
            res.json({success:true,message:"payment failed"})

        }
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
        if (!title) {
            return res.json({ success: false, message: "Record title is required" })
        }
        const record = { title, notes: notes || "", createdAt: Date.now() }
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
        res.json({ success: true, health: user?.health || { visits: [], records: [] }, activePlans })
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

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, addHealthVisit, addHealthRecord, getHealth, endCarePlanUser }

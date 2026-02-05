import validator from "validator";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import carePlanModel from "../models/carePlanModel.js";

// backend/controllers/adminController.js
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address1, address2 } = req.body

        // 1. Validation: Ensure all fields, especially password, are present
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address1 || !address2) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid Email Format" });
        }

        // 2. Hashing: Bcrypt needs a valid string for the first argument
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); // If password is undefined, it throws your error


        // 3. Prepare Data
        const doctorData = {
            name,
            email,
            password: hashedPassword,
            experience: Number(experience), 
            fees: Number(fees),
            speciality,
            degree,
            about,
            address: { line1: address1, line2: address2 },
            image: "",
            date: Date.now(),
        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({ success: true, message: "Doctor Added Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//API functions for admin can be added here
const loginAdmin = async (req, res) => {
    try{
        const {email, password} = req.body
        
        // Simple validation
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){ 
            
            const token = jwt.sign(email+password,process.env.JWT_SECRET)

            res.json({ success: true,token })

        } else {
            res.json({ success: false, message: "Invalid Credentials" })
        }
    } catch (error){
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get all doctors list for admin panel

const allDoctors = async (req, res) => {
    try {
        
        const doctors = await doctorModel.find({}).select("-password")
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({success: true, appointments })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)


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

const adminDashboard = async (req,res) => {
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments:appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({success:true,dashData})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

const patientsAdmin = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password')
        const activePlans = await carePlanModel.find({ active: true })
        const activeMap = activePlans.reduce((acc, plan) => {
            acc[plan.userId] = (acc[plan.userId] || 0) + 1
            return acc
        }, {})

        const patients = users.map(user => {
            const visits = user.health?.visits || []
            const records = user.health?.records || []
            const lastVisit = visits.length ? visits[visits.length - 1].date : "-"
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                visitsCount: visits.length,
                recordsCount: records.length,
                lastVisit,
                activeCarePlans: activeMap[user._id.toString()] || 0
            }
        })

        res.json({ success: true, patients })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

export { addDoctor ,loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard, patientsAdmin }

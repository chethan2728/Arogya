import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js"; // Ensure the path is correct
// Ensure the path is correct
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import carePlanModel from "../models/carePlanModel.js";
import uploadImageToCloudinary from "../services/imageService.js";

const changeAvailability = async (req, res) => {
    try {

        const { docId } = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: "Availability Changed Successfully" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.json({ success: false, message: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })

        } else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const appointmentDoctor = async (req, res) => {
    try {
        // Force docId to be the string value, even if it's wrapped in an object
        let docId = req.docId || req.body.docId;

        // If docId is an object, extract the string property from it
        if (typeof docId === 'object' && docId !== null) {
            docId = docId.docId;
        }

        // Now find using the clean string
        const appointments = await appointmentModel.find({ docId });

        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            return res.json({ success: true, message: "Appointment marked as completed." });
        } else {
            return res.json({ success: false, message: "Unauthorized action." });   
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
            return res.json({ success: true, message: "Appointment marked as cancelled." });
        } else {
            return res.json({ success: false, message: "cancellation failed" });   
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        let earnings = 0;

        appointments.map((item) => {
            // Count earnings only if completed OR payment is true, 
            // AND ensure it's NOT cancelled
            if (!item.cancelled && (item.isCompleted || item.payment)) {
                earnings += item.amount
            }
        })

        let patients = []
        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings, // This matches what we updated
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }
        
        res.json({ success: true, dashData })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const doctorProfile = async (req, res) => {
    try {
        const { docId } = req.body

        const profileData = await doctorModel.findById(docId).select(['-password'])

        res.json({ success: true, profileData })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, fees, address, available, phone } = req.body
        const imageFile = req.file

        let parsedAddress = address
        if (typeof address === 'string') {
            try {
                parsedAddress = JSON.parse(address)
            } catch (error) {
                return res.json({ success: false, message: "Invalid address format" })
            }
        }

        const updateData = {
            fees: fees !== undefined ? Number(fees) : undefined,
            address: parsedAddress,
            available: typeof available === 'string' ? available === 'true' : available,
            phone
        }

        if (imageFile) {
            const imageUrl = await uploadImageToCloudinary(imageFile, 'arogya/doctors')
            updateData.image = imageUrl
        }

        Object.keys(updateData).forEach((key) => {
            if (updateData[key] === undefined) {
                delete updateData[key]
            }
        })

        await doctorModel.findByIdAndUpdate(docId, updateData)

        res.json({ success: true, message: "Profile Updated Successfully" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const endCarePlanDoctor = async (req, res) => {
    try {
        const { docId, userId, reason } = req.body
        if (!userId) {
            return res.json({ success: false, message: "User ID required" })
        }
        const plan = await carePlanModel.findOne({ docId, userId, active: true })
        if (!plan) {
            return res.json({ success: false, message: "No active care plan found" })
        }
        plan.active = false
        plan.endedAt = new Date()
        plan.endedBy = "doctor"
        plan.endedReason = reason || ""
        await plan.save()
        res.json({ success: true, message: "Care plan ended" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { changeAvailability, doctorList, loginDoctor, appointmentDoctor, appointmentComplete, appointmentCancel, doctorDashboard, doctorProfile, updateDoctorProfile, endCarePlanDoctor }

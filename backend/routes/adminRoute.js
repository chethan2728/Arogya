import express from "express";
import { addDoctor,allDoctors,loginAdmin,appointmentsAdmin, appointmentCancel, adminDashboard, patientsAdmin } from "../controllers/adminController.js"; // You imported 'addDoctor'
import authAdmin from "../middleware/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";


const adminRouter = express.Router()

// Fix: Change 'addDoctorController' to 'addDoctor'
adminRouter.post('/add-doctor',authAdmin, addDoctor); 
adminRouter.post('/login', loginAdmin);
adminRouter.post('/all-doctors', authAdmin, allDoctors);
adminRouter.post('/change-availability', authAdmin, changeAvailability);
adminRouter.get('/appointments', authAdmin, appointmentsAdmin);
adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel);
adminRouter.get('/dashboard', authAdmin, adminDashboard);
adminRouter.get('/patients', authAdmin, patientsAdmin);





export default adminRouter;

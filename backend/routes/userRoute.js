import express from 'express'
import { registerUser,loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment,paymentRazorpay,verifyRazorpay, addHealthVisit, addHealthRecord, getHealth, endCarePlanUser } from '../controllers/userController.js'
import authUser from '../middleware/authUser.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router()

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', authUser, upload.single('image'), updateProfile);
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointments', authUser, listAppointment)
userRouter.post('/cancel-appointment', authUser, cancelAppointment)
userRouter.post('/payment-razorpay', authUser, paymentRazorpay)
userRouter.post('/verifyRazorpay', authUser, verifyRazorpay)
userRouter.post('/health/visit', authUser, addHealthVisit)
userRouter.post('/health/record', authUser, addHealthRecord)
userRouter.get('/health', authUser, getHealth)
userRouter.post('/health/end-care', authUser, endCarePlanUser)






export default userRouter;

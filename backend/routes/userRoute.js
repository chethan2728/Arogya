import express from 'express'
import { registerUser,loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment,paymentRazorpay,verifyRazorpay, addHealthVisit, addHealthRecord, getHealth, endCarePlanUser, analyzeSymptoms, aiChat, getAiMemory, setAiMemoryName, setAiMemoryPreferences, confirmAttendance, requestReschedule } from '../controllers/userController.js'
import authUser from '../middleware/authUser.js';
import upload from '../middleware/multer.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const userRouter = express.Router()
const aiLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20 })

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', authUser, upload.single('image'), updateProfile);
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointments', authUser, listAppointment)
userRouter.post('/cancel-appointment', authUser, cancelAppointment)
userRouter.post('/appointments/confirm-attendance', authUser, confirmAttendance)
userRouter.post('/appointments/request-reschedule', authUser, requestReschedule)
userRouter.post('/payment-razorpay', authUser, paymentRazorpay)
userRouter.post('/verifyRazorpay', authUser, verifyRazorpay)
userRouter.post('/health/visit', authUser, addHealthVisit)
userRouter.post('/health/record', authUser, upload.single('report'), addHealthRecord)
userRouter.get('/health', authUser, getHealth)
userRouter.post('/health/end-care', authUser, endCarePlanUser)
userRouter.post('/ai/symptom-analysis', authUser, aiLimiter, analyzeSymptoms)
userRouter.post('/ai/chat', authUser, aiLimiter, aiChat)
userRouter.get('/ai/memory', authUser, getAiMemory)
userRouter.post('/ai/memory/name', authUser, setAiMemoryName)
userRouter.post('/ai/memory/preferences', authUser, setAiMemoryPreferences)






export default userRouter;

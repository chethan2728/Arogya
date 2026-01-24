import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    speciality: { type: String, required: true },
    image: { type: String , default: ""},
    experience: { type: Number, required: true },
    degree: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },
    date: { type: Date, default: Date.now },
    slots_booked: { type: Object, default: {} }
}, { minimize: false })

const doctorModel = mongoose.models.doctors || mongoose.model('doctor', doctorSchema)

export default doctorModel
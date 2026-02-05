import mongoose from "mongoose";

const carePlanSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    active: { type: Boolean, default: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    endedBy: { type: String, default: "" }, // "doctor" | "patient"
    endedReason: { type: String, default: "" },
    lastReminderAt: { type: Date, default: null }
}, { minimize: false });

const carePlanModel = mongoose.models.carePlan || mongoose.model('carePlan', carePlanSchema);

export default carePlanModel;

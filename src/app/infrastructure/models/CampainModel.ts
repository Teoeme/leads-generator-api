import mongoose, { Schema } from "mongoose";
import { SocialMediaType } from "../../domain/entities/SocialMediaAccount";
import { InterventionSchema } from "./InterventionModel";
import { CampainStatus } from "../../domain/entities/Campain";

const CampainSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    platform: { type: String, required: true, enum: Object.values(SocialMediaType) },
    interventions: { type: [InterventionSchema], required: true },
    status: { type: String, required: true, enum: Object.values(CampainStatus) }
});

const Campain = mongoose.model('Campain', CampainSchema);

export default Campain;
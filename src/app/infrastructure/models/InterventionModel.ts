import mongoose, { Schema } from "mongoose";
import { InterventionStatus } from "../../domain/entities/Campain";
import { ActionType } from "../simulation/actions/ActionTypes";

const LeadCriteriaSchema = new Schema({
    minFollowers: { type: Number, required: false },
    maxFollowers: { type: Number, required: false },
    minPosts: { type: Number, required: false },
    keywords: { type: [String], required: false },
    referenceProfiles: { type: [String], required: false },
    commentAICriteria: { type: String, required: false },
    commentKeywords: { type: [String], required: false },
},{id:false,timestamps:false});

const TargetSchema = new Schema({
    username: { type: String, required: false },
    hashtag: { type: String, required: false },
    postUrl: { type: String, required: false },
},{id:false,timestamps:false});

const ActionSchema = new Schema({
    action: { type: String, required: true ,enum: Object.values(ActionType)},
    // timePattern: { type: TimePatternSchema, required: true },
    parameters: { type: Object, required: false },
    // followupActions: { type: [FollowupActionSchema], required: false },
    index: { type: Number, required: false },
    limit: { type: Number, required: false },
    target: { type: TargetSchema, required: false },
},{id:false,timestamps:false});    



export const InterventionSchema = new Schema({
    actions: { type: [ActionSchema], required: true },
    leadCriteria: { type: LeadCriteriaSchema, required: true },
    progress: { type: Number, required: false, default: 0 },
    status: { type: String, enum: Object.values(InterventionStatus), required: true, default: InterventionStatus.PENDING },
    autoStart: { type: Boolean, required: true, default: false },
    startDate: { type: Date, required: true, default: new Date() },
    description: { type: String, required: false },
    isBlocked: { type: Boolean, required: false, default: false },

});






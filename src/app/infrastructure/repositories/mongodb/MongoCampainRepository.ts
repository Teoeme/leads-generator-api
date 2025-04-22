import { Model } from "mongoose";
import { Campain, InterventionStatus } from "../../../domain/entities/Campain";
import CampainModel from "../../models/CampainModel";
import { SocialMediaType } from "../../../domain/entities/SocialMediaAccount";
import { CampainRepository } from "../../../domain/repositories/CampainRepository";

export class MongoCampainRepository implements CampainRepository {
    private readonly campainModel = CampainModel;

    async createCampain(campain: Campain): Promise<Campain> {
        const newCampain = await this.campainModel.create(campain);
        return this.mapToEntity(newCampain);
    }

    async getCampainById(id: string): Promise<Campain | null> {
        const campain = await this.campainModel.findById(id);
        return this.mapToEntity(campain);
    }

    async updateCampain(id: string, campain: Campain): Promise<Campain | null> {
        const updatedCampain = await this.campainModel.findByIdAndUpdate(id, campain, { new: true });
        return this.mapToEntity(updatedCampain);
    }   

    async deleteCampain(id: string): Promise<boolean> {
        const result = await this.campainModel.findByIdAndDelete(id);
        return result !== null;
    }

    async getCampains(filters?: Partial<Campain>): Promise<Campain[]> {
        const campains = await this.campainModel.find(filters || {}).sort({startDate: -1});
        return campains.map(this.mapToEntity);
    }

    async getCampaignOfIntervention(interventionId: string): Promise<Campain | null> {
        const campain = await this.campainModel.findOne({ 'interventions.id': interventionId });
        return this.mapToEntity(campain);
    }

    async updateInterventionStatus(interventionId: string, status: InterventionStatus,logMessage?:string): Promise<Campain | null> {
        const campain = await this.campainModel.findOneAndUpdate(
            { 'interventions._id': interventionId },
            { $set: { 'interventions.$.status': status, 'interventions.$.isBlocked': status === (InterventionStatus.RUNNING || InterventionStatus.COMPLETED)},
            $push:{'interventions.$.logs':{timestamp:new Date(),message:logMessage || `Status changed to ${status}`}} },
            { new: true }
        );
        if(!campain) return null;
        return this.mapToEntity(campain);
    }

    async addInterventionLog(interventionId: string, logMessage: string): Promise<void> {
        await this.campainModel.updateOne(
            { 'interventions._id': interventionId },
            { $push: { 'interventions.$.logs': { timestamp: new Date(), message: logMessage } } }
        );
    }

    private mapToEntity(campain: any): Campain {
        return {
            ...campain.toObject(),
            id: campain._id.toString(),
            interventions: campain.interventions.map((intervention: any) => ({
                ...intervention.toObject(),
                id: intervention._id.toString(),
                actions: intervention.actions.map((action: any) => ({
                    ...action.toObject(),
                    id: action._id.toString(),
                })),
                logs: intervention.logs.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 10),
            })),
        };
    }

}
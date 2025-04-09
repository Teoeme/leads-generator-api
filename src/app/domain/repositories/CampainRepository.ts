import { Campain, InterventionStatus } from "../entities/Campain";

export interface CampainRepository {
    createCampain(campain: Campain): Promise<Campain>;
    getCampainById(id: string): Promise<Campain | null>;
    getCampaignOfIntervention(interventionId: string): Promise<Campain | null>;
    updateCampain(id: string, campain: Partial<Campain>): Promise<Campain | null>;
    deleteCampain(id: string): Promise<boolean>;
    getCampains(filters?: Partial<Campain>): Promise<Campain[]>;
    updateInterventionStatus(interventionId: string, status: InterventionStatus): Promise<Campain | null>;

}
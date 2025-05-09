import { Action } from "../../infrastructure/simulation/actions/ActionTypes";
import { SocialMediaType } from "./SocialMediaAccount";

export interface Campain {
    id?: string;
    name: string;
    description: string;
    startDate?: Date;
    endDate?: Date;
    platform: SocialMediaType;
    interventions: Intervention[];
    status: CampainStatus;
}

export enum CampainStatus {
    PLANNING = "PLANNING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    PAUSED = "PAUSED"
}

export interface InterventionLog {
    timestamp:string,
    message:string,

}

export interface Intervention {
    actions: Action[];
    leadCriteria: LeadCriteria;
    id?: string;
    campaignId?: string;
    progress: number;
    status: InterventionStatus;
    autoStart: boolean;
    startDate?: Date;
    description?: string;
    isBlocked?: boolean;
    logs: InterventionLog[];
}

export enum InterventionStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    PLANNING = "PLANNING"
}

export interface LeadCriteria {
    minFollowers?: number;
    maxFollowers?: number;
    minPosts?: number;
    keywords?: string[];
    referenceProfiles?: string[];
    commentAICriteria?: string;
    commentKeywords?: string[];
}



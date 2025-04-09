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
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    PAUSED = "PAUSED"
}

export interface Intervention {
    actions: Action[];
    leadCriteria: LeadCriteria;
    id?: string;
    progress: number;
    status: InterventionStatus;
    autoStart: boolean;
    startDate?: Date;
    description?: string;
    isBlocked?: boolean;
}

export enum InterventionStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
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



import { Action } from "./ActionTypes";


export interface LeadCriteria {
    minFollowers?: number;
    maxFollowers?: number;
    minPosts?: number;
    keywords?: string[];
    referenceProfiles?: string[];
    commentAICriteria?: string;
    commentKeywords?: string[];
}

export enum InterventionStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    PLANNING = "PLANNING",
}

export interface InterventionLog {
    timestamp:string,
    message:string,

}

export interface Intervention {
    actions:Action[],
    leadCriteria:LeadCriteria
    id?:string,
    progress?:number,
    status:InterventionStatus,
    autoStart:boolean,
    startDate:string,
    description?:string,
    isBlocked?:boolean,
    logs:InterventionLog[]

}
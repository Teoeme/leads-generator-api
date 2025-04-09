import { Intervention } from "./Intervention";

export enum CampainStatus {
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    PAUSED = "PAUSED"
}

export interface Campaign {
    id?: string;
    name: string;
    description: string;
    startDate?: Date;
    endDate?: Date;
    platform: string;
    interventions?: Intervention[];
    status: CampainStatus;
}


import { Account } from "./Account";

export interface Simulator {
    id: string;
    type: string;
    currentUsagePercentage: number;
    isRunning: boolean;
    isLoggedIn: boolean;
    account:Account;
    logs:{message:string,timestamp:string}[];
    needAttention:boolean;
}
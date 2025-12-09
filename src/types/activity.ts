export interface UserActivity {
    id: number;
    userId: string;
    actionType: string;
    module: string;
    description: string;
    ipAddress?: string;
    timestamp: string; // ISO string
}

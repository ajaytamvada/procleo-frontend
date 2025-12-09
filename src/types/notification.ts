export interface AppNotification {
    id: number;
    recipientId: string;
    title: string;
    message: string;
    referenceId: number;
    referenceType: string;
    isRead: boolean;
    createdAt: string; // ISO string
}

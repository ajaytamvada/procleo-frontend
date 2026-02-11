export interface Contract {
    id: number;
    contractNumber: string;
    description: string;
    vendorId: number;
    vendorName: string;
    vendorCode: string;
    startDate: string;
    endDate: string;
    status: 'Draft' | 'Active' | 'Expired' | 'Terminated' | string;
    vendorAcceptanceStatus: 'Pending' | 'Accepted' | 'Rejected';
    vendorAcceptanceDate?: string;
    totalValue?: number;
    remainingValue?: number;
    paymentTerms: string;
    filePath?: string;
    contractType?: string;
    signedDate?: string;
    terminationNoticeDays?: number;
    renewalDate?: string;
    governingLaw?: string;
    jurisdiction?: string;
    liabilityLimit?: string;
    createdAt?: string;
    prId?: number;
}

export type ContractDto = Contract;

export interface ContractFilters {
    status?: string;
    vendorId?: number;
}

export interface CatalogProduct {
    id?: number;
    catalogCode: string;
    itemName: string;
    description?: string;
    category?: string;
    subCategory?: string;
    make?: string;
    model?: string;
    uom: string;
    vendorId: number;
    vendorName?: string;
    contractId?: number;
    unitPrice: number;
    currency: string;
    minOrderQty: number;
    leadTimeDays?: number;
    imageUrl?: string;
    effectiveFrom?: string;
    effectiveTo?: string;
    isActive: boolean;
}

export interface CatalogSearchParams {
    query?: string;
    category?: string;
    vendorId?: number;
    page?: number;
    size?: number;
}

export interface PagedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface CartItem extends CatalogProduct {
    quantity: number;
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    skuId: string;
    unitPrice: number;
    taxRate: number;
    quantity: number;
    discountRate: number;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    unit: string;
    description: string;
    category: string;
    modelNo: string;
    serialNo: string;
    size: string;
    batchNo: string;
    expDate: string;
    mfgDate: string;
    warranty: string;
    manufacturer: string;
    additionalDetails: string;
    status: string;
    remarks: string;
    orderId: number;
}

export interface OrderTotals {
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    totalAmount: number;
    additionalCostTotal: number;
    grandTotal: number;
}
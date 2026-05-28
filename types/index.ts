export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  brand?: string;
  size?: string;
}

export interface QuotationItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  brand?: string;
  size?: string;
  rate?: number;
}

export interface CustomerDetails {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}

export interface Quotation {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: QuotationItem[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  deliveryCharges: number;
  total: number;
  notes: string;
}

import { Product, Quotation } from '@/types';

const PRODUCTS_KEY = 'ramehs_products';
const QUOTATIONS_KEY = 'ramehs_quotations';
const QUOT_NUM_KEY = 'ramehs_quot_num';

const SEED_PRODUCTS: Product[] = [
  { id: 'seed-1', name: 'Wooden Dining Table (6-seater)', category: 'Dining', price: 45000, brand: 'Ramehs Furniture' },
  { id: 'seed-2', name: 'Dining Chairs Set (6)', category: 'Dining', price: 18000, brand: 'Ramehs Furniture' },
  { id: 'seed-3', name: '3-Seater Sofa (Fabric)', category: 'Living', price: 35000, brand: 'Fabrionic' },
  { id: 'seed-4', name: 'Coffee Table (Sheesham Wood)', category: 'Living', price: 12000, brand: 'Kale' },
  { id: 'seed-5', name: 'TV Unit (Wall-mounted)', category: 'Living', price: 15000, brand: 'Kale' },
  { id: 'seed-6', name: 'King Size Bed (with Storage)', category: 'Bedroom', price: 55000, brand: 'Ramehs Furniture' },
  { id: 'seed-7', name: 'Bedside Tables (Pair)', category: 'Bedroom', price: 8000, brand: 'Ramehs Furniture' },
  { id: 'seed-8', name: 'Wardrobe (3-door, Sliding)', category: 'Bedroom', price: 38000, brand: 'Ramehs Furniture' },
  { id: 'seed-9', name: 'Study Desk with Chair', category: 'Office', price: 14000, brand: 'Kale' },
  { id: 'seed-10', name: 'Bookshelf (5-tier)', category: 'Office', price: 7500, brand: 'Kale' },
  { id: 'seed-11', name: 'Garden Bench (Teak Wood)', category: 'Outdoor', price: 9500, brand: 'Ramehs Furniture' },
  { id: 'seed-12', name: 'Recliners (Single Seat)', category: 'Living', price: 22000, brand: 'Fabrionic' },
  { id: 'seed-13', name: 'Dining Table (4-seater)', category: 'Dining', price: 28000, brand: 'Ramehs Furniture' },
  { id: 'seed-14', name: 'Mattress (Queen Size, Orthopedic)', category: 'Bedroom', price: 20000, brand: 'Fabrionic' },
  { id: 'seed-15', name: 'Shoe Rack (6-layer)', category: 'Storage', price: 4500, brand: 'Kale' },
  { id: 'seed-16', name: 'Display Cabinet (Glass Door)', category: 'Living', price: 16000, brand: 'Fabrionic' },
];

function seedProducts(): void {
  const existing = localStorage.getItem(PRODUCTS_KEY);
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
  }
}

// Products
export { SEED_PRODUCTS };

export function getProducts(): Product[] {
  if (typeof window === 'undefined') return SEED_PRODUCTS;
  seedProducts();
  const data = localStorage.getItem(PRODUCTS_KEY);
  if (!data) return SEED_PRODUCTS;
  const parsed = JSON.parse(data);
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_PRODUCTS;
}

export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Product): Product[] {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
  return products;
}

export function updateProduct(id: string, updates: Partial<Product>): Product[] {
  const products = getProducts().map(p =>
    p.id === id ? { ...p, ...updates } : p
  );
  saveProducts(products);
  return products;
}

export function deleteProduct(id: string): Product[] {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
  return products;
}

// Quotations
export function getQuotations(): Quotation[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(QUOTATIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveQuotation(quotation: Quotation): void {
  if (typeof window === 'undefined') return;
  const quotations = getQuotations();
  quotations.unshift(quotation);
  localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations));
  const num = parseInt(localStorage.getItem(QUOT_NUM_KEY) || '0', 10);
  localStorage.setItem(QUOT_NUM_KEY, String(num + 1));
}

export function getNextQuotationNumber(): number {
  if (typeof window === 'undefined') return 1;
  const num = parseInt(localStorage.getItem(QUOT_NUM_KEY) || '0', 10);
  if (num === 0) {
    const existing = getQuotations().length;
    localStorage.setItem(QUOT_NUM_KEY, String(existing));
    return existing + 1;
  }
  return num + 1;
}

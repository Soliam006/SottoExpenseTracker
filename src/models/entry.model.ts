export interface Entry {
  id: string;
  type: 'receipt' | 'expense';
  date: string; // YYYY-MM-DD
  price: number;
  projectId?: string;
  receiptImages?: string[]; // array of base64 strings
  description: string;
}
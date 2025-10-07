
export interface Entry {
  id: string;
  type: 'receipt' | 'expense';
  date: string; // YYYY-MM-DD
  price: number;
  projectId?: string;
  receiptImage?: string; // base64 string
  description: string;
}

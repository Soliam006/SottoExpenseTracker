export interface Entry {
  id: string;
  type: 'receipt' | 'expense';
  date: string; // YYYY-MM-DD
  price: number;
  projectId?: string;
  receiptImagePublicIds?: string[]; // array of cloudinary public_ids
  description: string;
}

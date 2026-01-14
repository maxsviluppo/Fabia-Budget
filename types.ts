export type TransactionType = 'expense' | 'income';

export const DefaultCategoryIds = {
  KRISTIAN: 'Kristian',
  MEGAN: 'Megan',
  ZARA: 'Zara',
  CASA: 'Casa',
  MACCHINA: 'Macchina',
  SPESA: 'Spesa',
  USCITE_ALTRO: 'Uscite Altro',
  STIPENDIO: 'Stipendio',
  LEZIONI: 'Lezioni',
  ENTRATE_ALTRO: 'Entrate Altro'
};

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description?: string;
  date: string; // ISO String
}

export interface FixedExpense {
  id: string;
  label: string;
  amount: number;
  icon: string;
  colorName: ButtonColor;
  paidMonths: string[]; // Array of "YYYY-MM"
  group?: 'mensile' | 'alternata';
  dueDate?: string; // "YYYY-MM-DD" per scadenze puntuali
}

export type ButtonColor = 'purple' | 'blue' | 'pink' | 'amber' | 'red' | 'green' | 'emerald' | 'teal' | 'cyan' | 'gray';

export interface CategoryConfig {
  id: string;
  label: string;
  type: TransactionType;
  icon: string;
  colorClass: string;
  colorName: ButtonColor;
}
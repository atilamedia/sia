
export interface Transaction {
  id: string;
  date: string;
  accountCode: string;
  accountName: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  user: string;
  category: 'cash_in' | 'cash_out' | 'journal';
}

export interface JournalEntry {
  code: string;
  date: string;
  accountCode: string;
  description: string;
  debit: number;
  credit: number;
  user: string;
  createdAt: string;
}

export interface CashFlow {
  code: string;
  date: string;
  accountCode: string;
  accountName: string;
  amount: number;
  description: string;
  payer?: string; // For cash in
  receiver?: string; // For cash out
  checkNumber?: string;
  user: string;
  division?: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: 'tunai' | 'transfer' | 'cek/giro'; // Added payment method property
}

export interface Account {
  code: string;
  name: string;
  balance: number;
  level: number;
  levelType: 'Induk' | 'Detail Kas' | 'Detail Bk' | 'Detail' | 'Sendiri';
  parentCode: string;
  division: string;
  accountType: 'NERACA' | 'LRA' | 'LO';
}

export interface JournalType {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface FinancialSummary {
  totalCashIn: number;
  totalCashOut: number;
  netCashFlow: number;
  accountsBalance: number;
  recentActivity: number;
}

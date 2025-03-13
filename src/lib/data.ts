
import { Account, CashFlow, JournalEntry, JournalType, Transaction } from "./types";

export const sampleAccounts: Account[] = [
  {
    code: "1.1.1.01",
    name: "Kas",
    balance: 25000000,
    level: 1,
    levelType: "Induk",
    parentCode: "",
    division: "01",
    accountType: "NERACA"
  },
  {
    code: "1.1.1.02",
    name: "Bank BCA",
    balance: 150000000,
    level: 1,
    levelType: "Detail Bk",
    parentCode: "1.1.1",
    division: "01",
    accountType: "NERACA"
  },
  {
    code: "1.1.2.01",
    name: "Piutang Usaha",
    balance: 75000000,
    level: 1,
    levelType: "Detail",
    parentCode: "1.1.2",
    division: "01",
    accountType: "NERACA"
  },
  {
    code: "2.1.1.01",
    name: "Hutang Usaha",
    balance: 45000000,
    level: 1,
    levelType: "Detail",
    parentCode: "2.1.1",
    division: "01",
    accountType: "NERACA"
  },
  {
    code: "3.1.1.01",
    name: "Modal",
    balance: 200000000,
    level: 1,
    levelType: "Induk",
    parentCode: "",
    division: "01",
    accountType: "NERACA"
  },
  {
    code: "4.1.1.01",
    name: "Pendapatan Penjualan",
    balance: 350000000,
    level: 1,
    levelType: "Detail",
    parentCode: "4.1.1",
    division: "01",
    accountType: "LRA"
  },
  {
    code: "5.1.1.01",
    name: "Beban Gaji",
    balance: 120000000,
    level: 1,
    levelType: "Detail",
    parentCode: "5.1.1",
    division: "01",
    accountType: "LRA"
  }
];

export const sampleTransactions: Transaction[] = [
  {
    id: "TRX-001",
    date: "2023-05-15",
    accountCode: "1.1.1.01",
    accountName: "Kas",
    description: "Penerimaan pembayaran invoice #INV-2023-001",
    amount: 15000000,
    type: "debit",
    user: "admin",
    category: "cash_in"
  },
  {
    id: "TRX-002",
    date: "2023-05-16",
    accountCode: "5.1.1.01",
    accountName: "Beban Gaji",
    description: "Pembayaran gaji karyawan bulan Mei",
    amount: 25000000,
    type: "credit",
    user: "admin",
    category: "cash_out"
  },
  {
    id: "TRX-003",
    date: "2023-05-20",
    accountCode: "1.1.1.02",
    accountName: "Bank BCA",
    description: "Pemindahan dana dari kas ke rekening bank",
    amount: 10000000,
    type: "debit",
    user: "admin",
    category: "journal"
  },
  {
    id: "TRX-004",
    date: "2023-05-22",
    accountCode: "4.1.1.01",
    accountName: "Pendapatan Penjualan",
    description: "Pendapatan dari penjualan produk",
    amount: 35000000,
    type: "credit",
    user: "admin",
    category: "cash_in"
  },
  {
    id: "TRX-005",
    date: "2023-05-25",
    accountCode: "2.1.1.01",
    accountName: "Hutang Usaha",
    description: "Pembayaran hutang supplier",
    amount: 18000000,
    type: "debit",
    user: "admin",
    category: "cash_out"
  },
  {
    id: "TRX-006",
    date: "2023-05-28",
    accountCode: "1.1.2.01",
    accountName: "Piutang Usaha",
    description: "Pencatatan piutang customer",
    amount: 22000000,
    type: "debit",
    user: "admin",
    category: "journal"
  }
];

export const sampleJournalEntries: JournalEntry[] = [
  {
    code: "JRN-2023-001",
    date: "2023-05-15",
    accountCode: "1.1.1.01",
    description: "Penerimaan pembayaran invoice #INV-2023-001",
    debit: 15000000,
    credit: 0,
    user: "admin",
    createdAt: "2023-05-15T10:30:00"
  },
  {
    code: "JRN-2023-001",
    date: "2023-05-15",
    accountCode: "4.1.1.01",
    description: "Penerimaan pembayaran invoice #INV-2023-001",
    debit: 0,
    credit: 15000000,
    user: "admin",
    createdAt: "2023-05-15T10:30:00"
  },
  {
    code: "JRN-2023-002",
    date: "2023-05-16",
    accountCode: "5.1.1.01",
    description: "Pembayaran gaji karyawan bulan Mei",
    debit: 25000000,
    credit: 0,
    user: "admin",
    createdAt: "2023-05-16T14:45:00"
  },
  {
    code: "JRN-2023-002",
    date: "2023-05-16",
    accountCode: "1.1.1.01",
    description: "Pembayaran gaji karyawan bulan Mei",
    debit: 0,
    credit: 25000000,
    user: "admin",
    createdAt: "2023-05-16T14:45:00"
  },
  {
    code: "JRN-2023-003",
    date: "2023-05-20",
    accountCode: "1.1.1.02",
    description: "Pemindahan dana dari kas ke rekening bank",
    debit: 10000000,
    credit: 0,
    user: "admin",
    createdAt: "2023-05-20T09:15:00"
  },
  {
    code: "JRN-2023-003",
    date: "2023-05-20",
    accountCode: "1.1.1.01",
    description: "Pemindahan dana dari kas ke rekening bank",
    debit: 0,
    credit: 10000000,
    user: "admin",
    createdAt: "2023-05-20T09:15:00"
  }
];

export const sampleCashFlows: CashFlow[] = [
  {
    code: "CI-2023-001",
    date: "2023-05-15",
    accountCode: "1.1.1.01",
    accountName: "Kas",
    amount: 15000000,
    description: "Penerimaan pembayaran invoice #INV-2023-001",
    payer: "PT Maju Bersama",
    checkNumber: "",
    user: "admin",
    division: "01",
    createdAt: "2023-05-15T10:30:00",
    updatedAt: "2023-05-15T10:30:00"
  },
  {
    code: "CO-2023-001",
    date: "2023-05-16",
    accountCode: "5.1.1.01",
    accountName: "Beban Gaji",
    amount: 25000000,
    description: "Pembayaran gaji karyawan bulan Mei",
    receiver: "Karyawan",
    checkNumber: "",
    user: "admin",
    division: "01",
    createdAt: "2023-05-16T14:45:00",
    updatedAt: "2023-05-16T14:45:00"
  },
  {
    code: "CI-2023-002",
    date: "2023-05-22",
    accountCode: "4.1.1.01",
    accountName: "Pendapatan Penjualan",
    amount: 35000000,
    description: "Pendapatan dari penjualan produk",
    payer: "PT Sukses Selalu",
    checkNumber: "CEK-001-2023",
    user: "admin",
    division: "01",
    createdAt: "2023-05-22T11:20:00",
    updatedAt: "2023-05-22T11:20:00"
  },
  {
    code: "CO-2023-002",
    date: "2023-05-25",
    accountCode: "2.1.1.01",
    accountName: "Hutang Usaha",
    amount: 18000000,
    description: "Pembayaran hutang supplier",
    receiver: "PT Supplier Utama",
    checkNumber: "CEK-002-2023",
    user: "admin",
    division: "01",
    createdAt: "2023-05-25T13:10:00",
    updatedAt: "2023-05-25T13:10:00"
  }
];

export const sampleJournalTypes: JournalType[] = [
  {
    id: "JV",
    name: "Jurnal Umum",
    isDefault: true
  },
  {
    id: "AJE",
    name: "Jurnal Penyesuaian",
    isDefault: false
  },
  {
    id: "CLR",
    name: "Jurnal Penutup",
    isDefault: false
  }
];

export const getFinancialSummary = () => {
  const totalCashIn = sampleTransactions
    .filter(t => t.category === 'cash_in')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const totalCashOut = sampleTransactions
    .filter(t => t.category === 'cash_out')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const netCashFlow = totalCashIn - totalCashOut;
  
  const accountsBalance = sampleAccounts
    .reduce((sum, account) => sum + account.balance, 0);
  
  return {
    totalCashIn,
    totalCashOut,
    netCashFlow,
    accountsBalance,
    recentActivity: sampleTransactions.length
  };
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Sort transactions by date (newest first)
export const getRecentTransactions = (limit = 5): Transaction[] => {
  return [...sampleTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

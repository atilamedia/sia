
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to local string
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format number to currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Generate a unique ID
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Get transaction type color
export function getTransactionTypeColor(type: 'debit' | 'credit'): string {
  return type === 'debit' ? 'text-green-600' : 'text-red-600';
}

// Get transaction category label
export function getTransactionCategoryLabel(category: 'cash_in' | 'cash_out' | 'journal'): string {
  switch (category) {
    case 'cash_in':
      return 'Kas Masuk';
    case 'cash_out':
      return 'Kas Keluar';
    case 'journal':
      return 'Jurnal';
    default:
      return category;
  }
}

// Format amount with plus/minus sign based on transaction type
export function formatTransactionAmount(amount: number, type: 'debit' | 'credit'): string {
  const formattedAmount = formatCurrency(amount);
  return type === 'debit' ? `+${formattedAmount}` : `-${formattedAmount}`;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

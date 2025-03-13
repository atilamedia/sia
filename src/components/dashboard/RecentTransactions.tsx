
import { getRecentTransactions } from "@/lib/data";
import { formatDate, formatTransactionAmount, getTransactionTypeColor, truncateText } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";

export function RecentTransactions() {
  const transactions = getRecentTransactions();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Transaksi Terbaru</h3>
        <a
          href="/cash-flow"
          className="text-sm text-primary hover:underline focus:outline-none"
        >
          Lihat Semua
        </a>
      </div>
      
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rekening
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipe
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((transaction) => (
                <tr 
                  key={transaction.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="font-medium">{transaction.accountCode}</span>
                    <span className="ml-1 text-muted-foreground">
                      {transaction.accountName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {truncateText(transaction.description, 40)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                    <span className={getTransactionTypeColor(transaction.type)}>
                      {formatTransactionAmount(
                        transaction.amount,
                        transaction.type
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    {transaction.category === "cash_in" && (
                      <ArrowUpRight className="w-4 h-4 text-green-600 inline" />
                    )}
                    {transaction.category === "cash_out" && (
                      <ArrowDownRight className="w-4 h-4 text-red-600 inline" />
                    )}
                    {transaction.category === "journal" && (
                      <FileText className="w-4 h-4 text-blue-600 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

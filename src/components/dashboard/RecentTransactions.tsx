import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { formatDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import { useMemo } from "react";

export function RecentTransactions() {
  const { data: kasMasukData } = useQuery({
    queryKey: ['kas-masuk-recent'],
    queryFn: () => siaApi.getKasMasuk(),
  });

  const { data: kasKeluarData } = useQuery({
    queryKey: ['kas-keluar-recent'],
    queryFn: () => siaApi.getKasKeluar(),
  });

  const { data: jurnalData } = useQuery({
    queryKey: ['jurnal-recent'],
    queryFn: () => siaApi.getJurnal(),
  });

  // Combine and process all transactions
  const recentTransactions = useMemo(() => {
    const transactions = [];

    // Add kas masuk transactions
    if (kasMasukData?.data) {
      kasMasukData.data.forEach(item => {
        transactions.push({
          id: item.id_km,
          date: item.tanggal,
          accountCode: item.kode_rek,
          accountName: item.m_rekening?.nama_rek || 'Tidak diketahui',
          description: item.keterangan || 'Kas Masuk',
          amount: item.total || 0,
          type: 'debit' as const,
          category: 'cash_in' as const,
          payer: item.pembayar,
        });
      });
    }

    // Add kas keluar transactions
    if (kasKeluarData?.data) {
      kasKeluarData.data.forEach(item => {
        transactions.push({
          id: item.id_kk,
          date: item.tanggal,
          accountCode: item.kode_rek,
          accountName: item.m_rekening?.nama_rek || 'Tidak diketahui',
          description: item.keterangan || 'Kas Keluar',
          amount: item.total || 0,
          type: 'credit' as const,
          category: 'cash_out' as const,
          receiver: item.penerima,
        });
      });
    }

    // Add jurnal transactions
    if (jurnalData?.data) {
      jurnalData.data.forEach(item => {
        if (item.jurnal && item.jurnal.length > 0) {
          item.jurnal.forEach(entry => {
            transactions.push({
              id: `${item.id_ju}-${entry.kode_rek}`,
              date: item.tanggal,
              accountCode: entry.kode_rek,
              accountName: entry.m_rekening?.nama_rek || 'Tidak diketahui',
              description: entry.deskripsi || 'Jurnal Entry',
              amount: entry.debit || entry.kredit || 0,
              type: entry.debit > 0 ? 'debit' as const : 'credit' as const,
              category: 'journal' as const,
            });
          });
        }
      });
    }

    // Sort by date (newest first) and limit to 10
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [kasMasukData, kasKeluarData, jurnalData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: window.innerWidth < 768 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(amount);
  };

  const formatTransactionAmount = (amount: number, type: string) => {
    const formattedAmount = formatCurrency(amount);
    return type === 'debit' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const getTransactionTypeColor = (type: string) => {
    return type === 'debit' ? 'text-green-600' : 'text-red-600';
  };

  const truncateText = (text: string, maxLength: number) => {
    const length = window.innerWidth < 768 ? 25 : maxLength;
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-medium">Transaksi Terbaru</h3>
        <a
          href="/cash-flow"
          className="text-sm text-primary hover:underline focus:outline-none"
        >
          Lihat Semua
        </a>
      </div>
      
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        {/* Mobile Card View */}
        <div className="block md:hidden">
          <div className="divide-y">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {transaction.category === "cash_in" && (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      )}
                      {transaction.category === "cash_out" && (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      {transaction.category === "journal" && (
                        <FileText className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {transaction.date ? formatDate(transaction.date) : '-'}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${getTransactionTypeColor(transaction.type)}`}>
                      {formatTransactionAmount(transaction.amount, transaction.type)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {transaction.accountCode}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.accountName}
                    </div>
                    <div className="text-sm">
                      {truncateText(transaction.description, 40)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Tidak ada transaksi terbaru
              </div>
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {transaction.date ? formatDate(transaction.date) : '-'}
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
                        {formatTransactionAmount(transaction.amount, transaction.type)}
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
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Tidak ada transaksi terbaru
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

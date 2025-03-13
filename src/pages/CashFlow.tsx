
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sampleTransactions } from "@/lib/data";
import { formatDate, formatTransactionAmount, getTransactionTypeColor, getTransactionCategoryLabel } from "@/lib/utils";
import { ArrowDownUp, Filter, Search, Download } from "lucide-react";
import { Transaction } from "@/lib/types";

const CashFlow = () => {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(sampleTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredTransactions(sampleTransactions);
      return;
    }
    
    const results = sampleTransactions.filter(
      (transaction) =>
        transaction.description.toLowerCase().includes(term.toLowerCase()) ||
        transaction.accountName.toLowerCase().includes(term.toLowerCase()) ||
        transaction.accountCode.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredTransactions(results);
  };
  
  const handleTabChange = (value: string) => {
    if (value === "all") {
      setFilteredTransactions(sampleTransactions);
    } else {
      const filtered = sampleTransactions.filter(
        (transaction) => transaction.category === value
      );
      setFilteredTransactions(filtered);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-[250px]">
        <Header title="Aktivitas Arus Kas" />
        <main className="p-6 pb-16 animate-fade-in">
          <Card className="overflow-hidden shadow-sm">
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold">Daftar Transaksi</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Cari transaksi..."
                      className="pl-9 h-10 rounded-md border border-input bg-background"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  <button className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </button>
                  <button className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <Tabs defaultValue="all" onValueChange={handleTabChange}>
                  <TabsList>
                    <TabsTrigger value="all">Semua</TabsTrigger>
                    <TabsTrigger value="cash_in">Kas Masuk</TabsTrigger>
                    <TabsTrigger value="cash_out">Kas Keluar</TabsTrigger>
                    <TabsTrigger value="journal">Jurnal</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                        ID
                        <ArrowDownUp className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                        Tanggal
                        <ArrowDownUp className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Rekening
                    </th>
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Deskripsi
                    </th>
                    <th className="h-12 px-4 text-right align-middle text-xs font-medium text-muted-foreground">
                      <div className="flex items-center justify-end gap-1 cursor-pointer hover:text-foreground transition-colors">
                        Jumlah
                        <ArrowDownUp className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="h-12 px-4 text-center align-middle text-xs font-medium text-muted-foreground">
                      Tipe
                    </th>
                    <th className="h-12 px-4 text-center align-middle text-xs font-medium text-muted-foreground">
                      Kategori
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b transition-colors hover:bg-muted/30"
                      >
                        <td className="p-4 align-middle text-sm">
                          {transaction.id}
                        </td>
                        <td className="p-4 align-middle text-sm">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="p-4 align-middle text-sm">
                          <div className="font-medium">{transaction.accountCode}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {transaction.accountName}
                          </div>
                        </td>
                        <td className="p-4 align-middle text-sm">
                          {transaction.description}
                        </td>
                        <td className="p-4 align-middle text-sm text-right font-medium">
                          <span className={getTransactionTypeColor(transaction.type)}>
                            {formatTransactionAmount(
                              transaction.amount,
                              transaction.type
                            )}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-sm text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              transaction.type === "debit"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.type === "debit" ? "Debit" : "Kredit"}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-sm text-center">
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                            {getTransactionCategoryLabel(transaction.category)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        Tidak ada transaksi yang ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {filteredTransactions.length} dari {sampleTransactions.length} transaksi
              </div>
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center justify-center px-3 h-8 rounded-md text-sm disabled:opacity-50 border border-input bg-background hover:bg-accent">
                  Sebelumnya
                </button>
                <button className="inline-flex items-center justify-center px-3 h-8 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90">
                  1
                </button>
                <button className="inline-flex items-center justify-center px-3 h-8 rounded-md text-sm disabled:opacity-50 border border-input bg-background hover:bg-accent">
                  Selanjutnya
                </button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CashFlow;

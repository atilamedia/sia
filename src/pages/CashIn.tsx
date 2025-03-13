
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";
import { sampleCashFlows } from "@/lib/data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CashFlow } from "@/lib/types";
import { Plus, Search, FileEdit, Trash2, Download, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CashIn = () => {
  const cashInFlows = sampleCashFlows.filter(flow => flow.code.startsWith("CI"));
  const [filteredCashIn, setFilteredCashIn] = useState<CashFlow[]>(cashInFlows);
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredCashIn(cashInFlows);
      return;
    }
    
    const results = cashInFlows.filter(
      (cashIn) =>
        cashIn.description.toLowerCase().includes(term.toLowerCase()) ||
        cashIn.accountName.toLowerCase().includes(term.toLowerCase()) ||
        cashIn.accountCode.toLowerCase().includes(term.toLowerCase()) ||
        (cashIn.payer && cashIn.payer.toLowerCase().includes(term.toLowerCase()))
    );
    
    setFilteredCashIn(results);
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-[250px]">
        <Header title="Kas Masuk" />
        <main className="p-6 pb-16 animate-fade-in">
          <Card className="overflow-hidden shadow-sm">
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold">Daftar Kas Masuk</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Cari kas masuk..."
                      className="pl-9 h-10 rounded-md border border-input bg-background"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  <button className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Baru
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Tambah Kas Masuk Baru</DialogTitle>
                        <DialogDescription>
                          Isi detail untuk mencatat transaksi kas masuk baru
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="date" className="text-right">
                            Tanggal
                          </Label>
                          <Input
                            id="date"
                            type="date"
                            className="col-span-3"
                            defaultValue={new Date().toISOString().slice(0, 10)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="account" className="text-right">
                            Rekening
                          </Label>
                          <Input
                            id="account"
                            placeholder="Pilih rekening"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="amount" className="text-right">
                            Jumlah
                          </Label>
                          <Input
                            id="amount"
                            placeholder="0"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Deskripsi
                          </Label>
                          <Input
                            id="description"
                            placeholder="Deskripsi transaksi"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="payer" className="text-right">
                            Pembayar
                          </Label>
                          <Input
                            id="payer"
                            placeholder="Nama pembayar"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="check" className="text-right">
                            No. Cek
                          </Label>
                          <Input
                            id="check"
                            placeholder="Nomor cek (opsional)"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Batal</Button>
                        <Button type="submit">Simpan</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Kode
                    </th>
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Tanggal
                    </th>
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Rekening
                    </th>
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Deskripsi
                    </th>
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Pembayar
                    </th>
                    <th className="h-12 px-4 text-right align-middle text-xs font-medium text-muted-foreground">
                      Jumlah
                    </th>
                    <th className="h-12 px-4 text-center align-middle text-xs font-medium text-muted-foreground">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCashIn.length > 0 ? (
                    filteredCashIn.map((cashIn) => (
                      <tr
                        key={cashIn.code}
                        className="border-b transition-colors hover:bg-muted/30"
                      >
                        <td className="p-4 align-middle text-sm">
                          {cashIn.code}
                        </td>
                        <td className="p-4 align-middle text-sm">
                          {formatDate(cashIn.date)}
                        </td>
                        <td className="p-4 align-middle text-sm">
                          <div className="font-medium">{cashIn.accountCode}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {cashIn.accountName}
                          </div>
                        </td>
                        <td className="p-4 align-middle text-sm">
                          {cashIn.description}
                        </td>
                        <td className="p-4 align-middle text-sm">
                          {cashIn.payer}
                        </td>
                        <td className="p-4 align-middle text-sm text-right font-medium text-green-600">
                          {formatCurrency(cashIn.amount)}
                        </td>
                        <td className="p-4 align-middle text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                              <FileEdit className="h-4 w-4" />
                            </button>
                            <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        Tidak ada data kas masuk yang ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {filteredCashIn.length} dari {cashInFlows.length} transaksi
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

export default CashIn;

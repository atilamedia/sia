
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { sampleAccounts } from "@/lib/data";
import { Account } from "@/lib/types";
import { Download, Plus, Search, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>(sampleAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    account.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    toast({
      title: "Data diexport",
      description: "Data rekening berhasil diexport ke Excel.",
    });
  };

  return (
    <Layout title="Rekening">
      <div className="container px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Rekening</h2>
            <p className="text-muted-foreground">
              Kelola semua rekening untuk transaksi keuangan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Rekening Baru
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari rekening..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="mt-6 overflow-hidden border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium">Kode</th>
                    <th className="h-10 px-4 text-left font-medium">Nama Rekening</th>
                    <th className="h-10 px-4 text-left font-medium">Jenis</th>
                    <th className="h-10 px-4 text-left font-medium">Induk</th>
                    <th className="h-10 px-4 text-right font-medium">Saldo</th>
                    <th className="h-10 px-4 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => (
                      <tr key={account.code} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 font-medium">{account.code}</td>
                        <td className="p-4">{account.name}</td>
                        <td className="p-4">{account.levelType}</td>
                        <td className="p-4">{account.parentCode || "-"}</td>
                        <td className="p-4 text-right font-medium">
                          {formatCurrency(account.balance)}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        Tidak ada data rekening
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

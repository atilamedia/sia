
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CashFlow } from "@/lib/types";
import { sampleCashFlows } from "@/lib/data";
import { ArrowUpRight, ArrowDownLeft, Filter, Download, Plus, Search } from "lucide-react";

export default function CashFlow() {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>(sampleCashFlows);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "in" | "out">("all");
  
  const filteredCashFlows = cashFlows.filter(flow => {
    const matchesSearch = flow.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        flow.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || 
                      (filterType === "in" && flow.code.startsWith("CI")) || 
                      (filterType === "out" && flow.code.startsWith("CO"));
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <div className="container px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Arus Kas</h2>
            <p className="text-muted-foreground">
              Kelola semua transaksi arus kas masuk dan keluar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Transaksi Baru
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setFilterType("all")}>Semua</TabsTrigger>
              <TabsTrigger value="in" onClick={() => setFilterType("in")}>Kas Masuk</TabsTrigger>
              <TabsTrigger value="out" onClick={() => setFilterType("out")}>Kas Keluar</TabsTrigger>
            </TabsList>
            
            <div className="flex w-full sm:w-auto gap-2">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari transaksi..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <CashFlowTable cashFlows={filteredCashFlows} />
          </TabsContent>
          <TabsContent value="in" className="mt-0">
            <CashFlowTable cashFlows={filteredCashFlows} />
          </TabsContent>
          <TabsContent value="out" className="mt-0">
            <CashFlowTable cashFlows={filteredCashFlows} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function CashFlowTable({ cashFlows }: { cashFlows: CashFlow[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left font-medium">Kode</th>
                <th className="h-10 px-4 text-left font-medium">Tanggal</th>
                <th className="h-10 px-4 text-left font-medium">Rekening</th>
                <th className="h-10 px-4 text-left font-medium">Deskripsi</th>
                <th className="h-10 px-4 text-left font-medium">Jenis</th>
                <th className="h-10 px-4 text-right font-medium">Jumlah</th>
                <th className="h-10 px-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cashFlows.length > 0 ? (
                cashFlows.map((flow) => (
                  <tr key={flow.code} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-medium">{flow.code}</td>
                    <td className="p-4">{formatDate(flow.date)}</td>
                    <td className="p-4">
                      <div className="font-medium">{flow.accountName}</div>
                      <div className="text-xs text-muted-foreground">{flow.accountCode}</div>
                    </td>
                    <td className="p-4 max-w-[300px] truncate">{flow.description}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${flow.code.startsWith('CI') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {flow.code.startsWith('CI') ? (
                            <>
                              <ArrowUpRight className="h-3 w-3" />
                              Kas Masuk
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="h-3 w-3" />
                              Kas Keluar
                            </>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium">
                      <span className={flow.code.startsWith('CI') ? 'text-green-600' : 'text-red-600'}>
                        {flow.code.startsWith('CI') ? '+' : '-'}{formatCurrency(flow.amount)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    Tidak ada data transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, FileSpreadsheet, FileText, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import * as XLSX from 'xlsx';
import { useIsMobile } from "@/hooks/use-mobile";

const Reports = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  const { data: kasMasukData } = useQuery({
    queryKey: ['kas-masuk', date?.from, date?.to],
    queryFn: () => siaApi.getKasMasuk(
      date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
    ),
  });

  const { data: kasKeluarData } = useQuery({
    queryKey: ['kas-keluar', date?.from, date?.to],
    queryFn: () => siaApi.getKasKeluar(
      date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
    ),
  });

  const { data: jurnalData } = useQuery({
    queryKey: ['jurnal', date?.from, date?.to],
    queryFn: () => siaApi.getJurnal(
      date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
    ),
  });

  const { data: accountsData } = useQuery({
    queryKey: ['master-rekening'],
    queryFn: () => siaApi.getMasterRekening(),
  });

  // Calculate summary data
  const totalKasMasuk = kasMasukData?.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const totalKasKeluar = kasKeluarData?.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const netCashFlow = totalKasMasuk - totalKasKeluar;
  const totalJurnalEntries = jurnalData?.data?.reduce((sum, item) => sum + (item.jurnal?.length || 0), 0) || 0;

  // Prepare chart data
  const cashFlowChartData = [
    { name: "Kas Masuk", value: totalKasMasuk, fill: "#10B981" },
    { name: "Kas Keluar", value: totalKasKeluar, fill: "#EF4444" }
  ];

  const monthlyData = [
    { month: "Jan", kasmasuk: 50000000, kaskeluar: 40000000 },
    { month: "Feb", kasmasuk: 60000000, kaskeluar: 45000000 },
    { month: "Mar", kasmasuk: 55000000, kaskeluar: 50000000 },
    { month: "Apr", kasmasuk: 70000000, kaskeluar: 60000000 },
    { month: "Mei", kasmasuk: 65000000, kaskeluar: 55000000 },
    { month: "Jun", kasmasuk: 80000000, kaskeluar: 70000000 },
  ];

  // Export functions
  const exportSummaryToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    const summaryData = [
      ['Laporan Ringkasan Keuangan'],
      [''],
      ['Periode:', date?.from && date?.to ? `${format(date.from, 'dd/MM/yyyy')} - ${format(date.to, 'dd/MM/yyyy')}` : 'Semua'],
      [''],
      ['Kas Masuk', totalKasMasuk],
      ['Kas Keluar', totalKasKeluar],
      ['Net Cash Flow', netCashFlow],
      ['Total Jurnal Entries', totalJurnalEntries],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    const fileName = `laporan-ringkasan-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportSummaryToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateRange = date?.from && date?.to 
      ? `${format(date.from, 'dd MMMM yyyy')} - ${format(date.to, 'dd MMMM yyyy')}`
      : 'Semua Periode';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Ringkasan Keuangan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .summary-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .positive { color: #10B981; }
          .negative { color: #EF4444; }
          .highlight { background-color: #f5f5f5; padding: 12px; border-radius: 8px; margin: 10px 0; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Ringkasan Keuangan</h1>
          <p>Periode: ${dateRange}</p>
        </div>
        
        <div class="summary">
          <h2>Ringkasan Keuangan</h2>
          <div class="summary-item">
            <span>Total Kas Masuk:</span>
            <span class="positive"><strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalKasMasuk)}</strong></span>
          </div>
          <div class="summary-item">
            <span>Total Kas Keluar:</span>
            <span class="negative"><strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalKasKeluar)}</strong></span>
          </div>
          <div class="highlight">
            <div class="summary-item" style="border: none; font-size: 1.2em;">
              <span><strong>Net Cash Flow:</strong></span>
              <span class="${netCashFlow >= 0 ? 'positive' : 'negative'}"><strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(netCashFlow)}</strong></span>
            </div>
          </div>
          <div class="summary-item">
            <span>Total Jurnal Entries:</span>
            <span><strong>${totalJurnalEntries}</strong></span>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Layout title="Laporan">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className={isMobile ? "space-y-4" : "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"}>
          <h1 className="text-xl md:text-2xl font-bold">Laporan Keuangan</h1>
          
          {/* Mobile Controls */}
          {isMobile ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari laporan..."
                  className="pl-9 h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DateRangePicker 
                dateRange={date} 
                onDateRangeChange={setDate}
              />
              <div className="flex space-x-2">
                <Button onClick={exportSummaryToExcel} variant="outline" size="sm" className="flex-1">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button onClick={exportSummaryToPDF} variant="outline" size="sm" className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          ) : (
            // Desktop Controls
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari laporan..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DateRangePicker 
                dateRange={date} 
                onDateRangeChange={setDate}
              />
              <Button onClick={exportSummaryToExcel} variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button onClick={exportSummaryToPDF} variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Kas Masuk
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-green-600">
                {isMobile ? 
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    compactDisplay: 'short',
                    minimumFractionDigits: 0,
                  }).format(totalKasMasuk)
                  :
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(totalKasMasuk)
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Kas Keluar
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-red-600">
                {isMobile ? 
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    compactDisplay: 'short',
                    minimumFractionDigits: 0,
                  }).format(totalKasKeluar)
                  :
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(totalKasKeluar)
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Net Cash Flow
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg md:text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {isMobile ? 
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    compactDisplay: 'short',
                    minimumFractionDigits: 0,
                  }).format(netCashFlow)
                  :
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(netCashFlow)
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Jurnal Entries
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">
                {totalJurnalEntries}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs md:text-sm">Trends</TabsTrigger>
            <TabsTrigger value="details" className="text-xs md:text-sm">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">Distribusi Kas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={isMobile ? "h-[250px]" : "h-[300px]"}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={cashFlowChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={isMobile ? 80 : 100}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelStyle={{ fontSize: isMobile ? 10 : 12 }}
                        >
                          {cashFlowChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">Ringkasan Bulanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={isMobile ? "h-[250px]" : "h-[300px]"}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          fontSize={isMobile ? 10 : 12}
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `${(value/1000000).toFixed(0)}jt`}
                          fontSize={isMobile ? 10 : 12}
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(value)}
                        />
                        <Bar dataKey="kasmasuk" fill="#10B981" name="Kas Masuk" />
                        <Bar dataKey="kaskeluar" fill="#EF4444" name="Kas Keluar" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Trend Arus Kas Bulanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={isMobile ? "h-[300px]" : "h-[400px]"}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month"
                        fontSize={isMobile ? 10 : 12}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `${(value/1000000).toFixed(0)}jt`}
                        fontSize={isMobile ? 10 : 12}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <Tooltip 
                        formatter={(value: number) => new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(value)}
                      />
                      <Bar dataKey="kasmasuk" fill="#10B981" name="Kas Masuk" />
                      <Bar dataKey="kaskeluar" fill="#EF4444" name="Kas Keluar" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">Transaksi Terakhir - Kas Masuk</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 text-xs md:text-sm font-medium">Tanggal</th>
                          <th className="text-left p-2 text-xs md:text-sm font-medium">Keterangan</th>
                          <th className="text-right p-2 text-xs md:text-sm font-medium">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kasMasukData?.data?.slice(0, 5).map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-xs md:text-sm">{item.tanggal}</td>
                            <td className="p-2 text-xs md:text-sm">{item.keterangan}</td>
                            <td className="p-2 text-right font-medium text-green-600 text-xs md:text-sm">
                              {isMobile ? 
                                new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  notation: 'compact',
                                  compactDisplay: 'short',
                                  minimumFractionDigits: 0,
                                }).format(item.total)
                                :
                                new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                }).format(item.total)
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">Transaksi Terakhir - Kas Keluar</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 text-xs md:text-sm font-medium">Tanggal</th>
                          <th className="text-left p-2 text-xs md:text-sm font-medium">Keterangan</th>
                          <th className="text-right p-2 text-xs md:text-sm font-medium">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kasKeluarData?.data?.slice(0, 5).map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-xs md:text-sm">{item.tanggal}</td>
                            <td className="p-2 text-xs md:text-sm">{item.keterangan}</td>
                            <td className="p-2 text-right font-medium text-red-600 text-xs md:text-sm">
                              {isMobile ? 
                                new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  notation: 'compact',
                                  compactDisplay: 'short',
                                  minimumFractionDigits: 0,
                                }).format(item.total)
                                :
                                new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                }).format(item.total)
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;

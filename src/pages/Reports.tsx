
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { FileSpreadsheet, FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import * as XLSX from 'xlsx';
import { useIsMobile } from "@/hooks/use-mobile";

const Reports = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
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

  const { data: masterRekeningData } = useQuery({
    queryKey: ['master-rekening'],
    queryFn: () => siaApi.getMasterRekening(),
  });

  const totalKasMasuk = kasMasukData?.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const totalKasKeluar = kasKeluarData?.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const netCashFlow = totalKasMasuk - totalKasKeluar;

  // Prepare chart data
  const cashFlowChartData = [
    { name: "Kas Masuk", value: totalKasMasuk, color: "#10B981" },
    { name: "Kas Keluar", value: totalKasKeluar, color: "#EF4444" }
  ];

  const accountTypeData = masterRekeningData?.data?.reduce((acc, account) => {
    const type = account.jenis_rek || 'LAINNYA';
    if (!acc[type]) acc[type] = 0;
    acc[type] += account.saldo || 0;
    return acc;
  }, {} as Record<string, number>) || {};

  const accountChartData = Object.entries(accountTypeData).map(([name, value]) => ({
    name,
    value,
    color: name === 'NERACA' ? '#3B82F6' : name === 'LRA' ? '#F59E0B' : '#8B5CF6'
  }));

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Laporan Keuangan'],
      [''],
      ['Total Kas Masuk', new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalKasMasuk)],
      ['Total Kas Keluar', new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalKasKeluar)],
      ['Net Cash Flow', new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(netCashFlow)],
      [''],
      ['Periode:', date?.from && date?.to ? `${format(date.from, 'dd/MM/yyyy')} - ${format(date.to, 'dd/MM/yyyy')}` : 'Semua']
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    // Account balance sheet
    if (masterRekeningData?.data?.length > 0) {
      const accountSheet = XLSX.utils.json_to_sheet(
        masterRekeningData.data.map(account => ({
          'Kode Rekening': account.kode_rek,
          'Nama Rekening': account.nama_rek,
          'Jenis': account.jenis_rek,
          'Level': account.k_level,
          'Saldo': account.saldo || 0
        }))
      );
      XLSX.utils.book_append_sheet(workbook, accountSheet, 'Saldo Rekening');
    }

    const fileName = `laporan-keuangan-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateRange = date?.from && date?.to 
      ? `${format(date.from, 'dd MMMM yyyy')} - ${format(date.to, 'dd MMMM yyyy')}`
      : 'Semua Periode';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Keuangan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f5f5f5; }
          .positive { color: #10B981; }
          .negative { color: #EF4444; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Keuangan</h1>
          <p>Periode: ${dateRange}</p>
        </div>
        
        <div class="summary">
          <h2>Ringkasan Keuangan</h2>
          <div class="summary-item">
            <span>Total Kas Masuk:</span>
            <span class="positive">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalKasMasuk)}</span>
          </div>
          <div class="summary-item">
            <span>Total Kas Keluar:</span>
            <span class="negative">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalKasKeluar)}</span>
          </div>
          <div class="summary-item">
            <span><strong>Net Cash Flow:</strong></span>
            <span class="${netCashFlow >= 0 ? 'positive' : 'negative'}"><strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(netCashFlow)}</strong></span>
          </div>
        </div>

        ${masterRekeningData?.data?.length > 0 ? `
        <div>
          <h2>Saldo Rekening</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Rekening</th>
                <th>Jenis</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${masterRekeningData.data.map(account => `
                <tr>
                  <td>${account.kode_rek}</td>
                  <td>${account.nama_rek}</td>
                  <td>${account.jenis_rek}</td>
                  <td class="${(account.saldo || 0) >= 0 ? 'positive' : 'negative'}">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(account.saldo || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
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
      <div className="space-y-4 md:space-y-6 p-2 md:p-0">
        {/* Header */}
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-bold">Laporan Keuangan</h1>
          <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-2">
            <DateRangePicker 
              dateRange={date} 
              onDateRangeChange={setDate}
            />
            <div className="flex space-x-2">
              <Button onClick={exportToExcel} variant="outline" size={isMobile ? "sm" : "default"}>
                <FileSpreadsheet className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                {!isMobile && "Excel"}
              </Button>
              <Button onClick={exportToPDF} variant="outline" size={isMobile ? "sm" : "default"}>
                <FileText className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                {!isMobile && "PDF"}
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kas Masuk</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  notation: isMobile ? 'compact' : 'standard',
                  compactDisplay: 'short'
                }).format(totalKasMasuk)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kas Keluar</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-red-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  notation: isMobile ? 'compact' : 'standard',
                  compactDisplay: 'short'
                }).format(totalKasKeluar)}
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
              <DollarSign className={`h-4 w-4 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-lg md:text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  notation: isMobile ? 'compact' : 'standard',
                  compactDisplay: 'short'
                }).format(netCashFlow)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Perbandingan Kas Masuk vs Keluar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={isMobile ? 10 : 12}
                      interval={0}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value/1000000).toFixed(1)}jt`}
                      fontSize={isMobile ? 10 : 12}
                    />
                    <Tooltip 
                      formatter={(value: number) => new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(value)}
                    />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Distribusi Saldo per Jenis Rekening</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accountChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 60 : 80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        notation: 'compact',
                        compactDisplay: 'short'
                      }).format(value)}`}
                      fontSize={isMobile ? 10 : 12}
                    >
                      {accountChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
        </div>

        {/* Detailed Tables */}
        <Tabs defaultValue="cash" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cash" className="text-sm md:text-base">Arus Kas</TabsTrigger>
            <TabsTrigger value="accounts" className="text-sm md:text-base">Saldo Rekening</TabsTrigger>
          </TabsList>

          <TabsContent value="cash">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Kas Masuk Terbaru</CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                  {isMobile ? (
                    <div className="divide-y max-h-60 overflow-y-auto">
                      {kasMasukData?.data?.slice(0, 5).map((item, index) => (
                        <div key={index} className="p-3 hover:bg-muted/30">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">{item.tanggal}</div>
                              <div className="text-sm font-medium">{item.pembayar}</div>
                              <div className="text-xs">{item.keterangan}</div>
                            </div>
                            <div className="text-sm font-bold text-green-600">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                notation: 'compact',
                                compactDisplay: 'short'
                              }).format(item.total)}
                            </div>
                          </div>
                        </div>
                      )) || <div className="p-4 text-center text-muted-foreground">Tidak ada data</div>}
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Tanggal</th>
                            <th className="text-left p-2">Pembayar</th>
                            <th className="text-right p-2">Jumlah</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kasMasukData?.data?.slice(0, 5).map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-2">{item.tanggal}</td>
                              <td className="p-2">{item.pembayar}</td>
                              <td className="p-2 text-right font-medium text-green-600">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                }).format(item.total)}
                              </td>
                            </tr>
                          )) || <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">Tidak ada data</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Kas Keluar Terbaru</CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                  {isMobile ? (
                    <div className="divide-y max-h-60 overflow-y-auto">
                      {kasKeluarData?.data?.slice(0, 5).map((item, index) => (
                        <div key={index} className="p-3 hover:bg-muted/30">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">{item.tanggal}</div>
                              <div className="text-sm font-medium">{item.penerima}</div>
                              <div className="text-xs">{item.keterangan}</div>
                            </div>
                            <div className="text-sm font-bold text-red-600">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                notation: 'compact',
                                compactDisplay: 'short'
                              }).format(item.total)}
                            </div>
                          </div>
                        </div>
                      )) || <div className="p-4 text-center text-muted-foreground">Tidak ada data</div>}
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Tanggal</th>
                            <th className="text-left p-2">Penerima</th>
                            <th className="text-right p-2">Jumlah</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kasKeluarData?.data?.slice(0, 5).map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-2">{item.tanggal}</td>
                              <td className="p-2">{item.penerima}</td>
                              <td className="p-2 text-right font-medium text-red-600">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                }).format(item.total)}
                              </td>
                            </tr>
                          )) || <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">Tidak ada data</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Saldo Rekening</CardTitle>
              </CardHeader>
              <CardContent className="p-0 md:p-6">
                {isMobile ? (
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {masterRekeningData?.data?.map((account, index) => (
                      <div key={index} className="p-3 hover:bg-muted/30">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{account.kode_rek}</div>
                            <div className="text-xs text-muted-foreground">{account.nama_rek}</div>
                            <div className="text-xs bg-muted px-2 py-1 rounded inline-block">{account.jenis_rek}</div>
                          </div>
                          <div className={`text-sm font-bold ${(account.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                              notation: 'compact',
                              compactDisplay: 'short'
                            }).format(account.saldo || 0)}
                          </div>
                        </div>
                      </div>
                    )) || <div className="p-4 text-center text-muted-foreground">Tidak ada data</div>}
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Kode</th>
                          <th className="text-left p-2">Nama Rekening</th>
                          <th className="text-left p-2">Jenis</th>
                          <th className="text-right p-2">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {masterRekeningData?.data?.map((account, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{account.kode_rek}</td>
                            <td className="p-2">{account.nama_rek}</td>
                            <td className="p-2">
                              <span className="bg-muted px-2 py-1 rounded text-xs">{account.jenis_rek}</span>
                            </td>
                            <td className={`p-2 text-right font-medium ${(account.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(account.saldo || 0)}
                            </td>
                          </tr>
                        )) || <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Tidak ada data</td></tr>}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;

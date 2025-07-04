import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Download, Filter, FileSpreadsheet, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import * as XLSX from 'xlsx';
import { useIsMobile } from "@/hooks/use-mobile";

const CashFlow = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const isMobile = useIsMobile();

  const { data: kasMasukData, isLoading: loadingKasMasuk } = useQuery({
    queryKey: ['kas-masuk', date?.from, date?.to],
    queryFn: () => siaApi.getKasMasuk(
      date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
    ),
  });

  const { data: kasKeluarData, isLoading: loadingKasKeluar } = useQuery({
    queryKey: ['kas-keluar', date?.from, date?.to],
    queryFn: () => siaApi.getKasKeluar(
      date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
    ),
  });

  const totalKasMasuk = kasMasukData?.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const totalKasKeluar = kasKeluarData?.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const netCashFlow = totalKasMasuk - totalKasKeluar;

  // Prepare chart data
  const cashFlowData = [
    { name: "Kas Masuk", value: totalKasMasuk, color: "#10B981" },
    { name: "Kas Keluar", value: totalKasKeluar, color: "#EF4444" },
    { name: "Net Cash Flow", value: netCashFlow, color: netCashFlow >= 0 ? "#10B981" : "#EF4444" }
  ];

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Ringkasan Arus Kas'],
      [''],
      ['Total Kas Masuk', new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalKasMasuk)],
      ['Total Kas Keluar', new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalKasKeluar)],
      ['Net Cash Flow', new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(netCashFlow)],
      [''],
      ['Periode:', date?.from && date?.to ? `${format(date.from, 'dd/MM/yyyy')} - ${format(date.to, 'dd/MM/yyyy')}` : 'Semua']
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    // Kas Masuk sheet
    if (kasMasukData?.data?.length > 0) {
      const kasMasukSheet = XLSX.utils.json_to_sheet(
        kasMasukData.data.map(item => ({
          'Tanggal': item.tanggal,
          'Keterangan': item.keterangan,
          'Pembayar': item.pembayar,
          'Jumlah': item.total
        }))
      );
      XLSX.utils.book_append_sheet(workbook, kasMasukSheet, 'Kas Masuk');
    }

    // Kas Keluar sheet
    if (kasKeluarData?.data?.length > 0) {
      const kasKeluarSheet = XLSX.utils.json_to_sheet(
        kasKeluarData.data.map(item => ({
          'Tanggal': item.tanggal,
          'Keterangan': item.keterangan,
          'Penerima': item.penerima,
          'Jumlah': item.total
        }))
      );
      XLSX.utils.book_append_sheet(workbook, kasKeluarSheet, 'Kas Keluar');
    }

    const fileName = `laporan-arus-kas-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    // Create a new window with printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateRange = date?.from && date?.to 
      ? `${format(date.from, 'dd MMMM yyyy')} - ${format(date.to, 'dd MMMM yyyy')}`
      : 'Semua Periode';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Arus Kas</title>
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
          <h1>Laporan Arus Kas</h1>
          <p>Periode: ${dateRange}</p>
        </div>
        
        <div class="summary">
          <h2>Ringkasan</h2>
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

        ${kasMasukData?.data?.length > 0 ? `
        <div>
          <h2>Detail Kas Masuk</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Pembayar</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${kasMasukData.data.map(item => `
                <tr>
                  <td>${item.tanggal}</td>
                  <td>${item.keterangan}</td>
                  <td>${item.pembayar}</td>
                  <td class="positive">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${kasKeluarData?.data?.length > 0 ? `
        <div>
          <h2>Detail Kas Keluar</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Penerima</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${kasKeluarData.data.map(item => `
                <tr>
                  <td>${item.tanggal}</td>
                  <td>${item.keterangan}</td>
                  <td>${item.penerima}</td>
                  <td class="negative">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.total)}</td>
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
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Layout title="Arus Kas">
      <div className="space-y-4 md:space-y-6">
        {/* Header with filters */}
        <div className={isMobile ? "space-y-4" : "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"}>
          <h1 className="text-xl md:text-2xl font-bold">Laporan Arus Kas</h1>
          
          {/* Mobile Controls */}
          {isMobile ? (
            <div className="space-y-3">
              <DateRangePicker 
                dateRange={date} 
                onDateRangeChange={setDate}
              />
              <div className="flex space-x-2">
                <Button onClick={exportToExcel} variant="outline" size="sm" className="flex-1">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button onClick={exportToPDF} variant="outline" size="sm" className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          ) : (
            // Desktop Controls
            <div className="flex items-center gap-2">
              <DateRangePicker 
                dateRange={date} 
                onDateRangeChange={setDate}
              />
              <Button onClick={exportToExcel} variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button onClick={exportToPDF} variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-green-600">Total Kas Masuk</CardTitle>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-red-600">Total Kas Keluar</CardTitle>
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
            <CardHeader className="pb-3">
              <CardTitle className={`text-base md:text-lg ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Net Cash Flow
              </CardTitle>
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
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Perbandingan Arus Kas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={isMobile ? "h-[250px]" : "h-[300px]"}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData.slice(0, 2)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={isMobile ? 10 : 12}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value/1000000).toFixed(1)}jt`}
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
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Trend Arus Kas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {cashFlowData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium text-sm md:text-base">{item.name}</span>
                    </div>
                    <span className={`font-bold text-sm md:text-base ${item.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {isMobile ? 
                        new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          notation: 'compact',
                          compactDisplay: 'short',
                          minimumFractionDigits: 0,
                        }).format(Math.abs(item.value))
                        :
                        new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(Math.abs(item.value))
                      }
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tables */}
        <Tabs defaultValue="masuk" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="masuk" className="text-sm">Kas Masuk</TabsTrigger>
            <TabsTrigger value="keluar" className="text-sm">Kas Keluar</TabsTrigger>
          </TabsList>

          <TabsContent value="masuk">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Detail Kas Masuk</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-xs md:text-sm font-medium">Tanggal</th>
                        <th className="text-left p-2 text-xs md:text-sm font-medium">Keterangan</th>
                        <th className="text-left p-2 text-xs md:text-sm font-medium">Pembayar</th>
                        <th className="text-right p-2 text-xs md:text-sm font-medium">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingKasMasuk ? (
                        <tr>
                          <td colSpan={4} className="text-center p-4 text-sm">Loading...</td>
                        </tr>
                      ) : kasMasukData?.data?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center p-4 text-sm">Tidak ada data</td>
                        </tr>
                      ) : (
                        kasMasukData?.data?.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-xs md:text-sm">{item.tanggal}</td>
                            <td className="p-2 text-xs md:text-sm">{item.keterangan}</td>
                            <td className="p-2 text-xs md:text-sm">{item.pembayar}</td>
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keluar">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Detail Kas Keluar</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-xs md:text-sm font-medium">Tanggal</th>
                        <th className="text-left p-2 text-xs md:text-sm font-medium">Keterangan</th>
                        <th className="text-left p-2 text-xs md:text-sm font-medium">Penerima</th>
                        <th className="text-right p-2 text-xs md:text-sm font-medium">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingKasKeluar ? (
                        <tr>
                          <td colSpan={4} className="text-center p-4 text-sm">Loading...</td>
                        </tr>
                      ) : kasKeluarData?.data?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center p-4 text-sm">Tidak ada data</td>
                        </tr>
                      ) : (
                        kasKeluarData?.data?.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-xs md:text-sm">{item.tanggal}</td>
                            <td className="p-2 text-xs md:text-sm">{item.keterangan}</td>
                            <td className="p-2 text-xs md:text-sm">{item.penerima}</td>
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CashFlow;

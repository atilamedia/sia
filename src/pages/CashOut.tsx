import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KasKeluarForm } from "@/components/sia/KasKeluarForm";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, Download, FileEdit, Trash2, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from 'xlsx';
import { useIsMobile } from "@/hooks/use-mobile";

const CashOut = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();

  const { data: kasKeluarData, isLoading, refetch } = useQuery({
    queryKey: ['kas-keluar', date?.from, date?.to, refreshTrigger],
    queryFn: () => siaApi.getKasKeluar(
      date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
    ),
  });

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    refetch();
  };

  const filteredData = kasKeluarData?.data?.filter(item => 
    item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.penerima?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bagian_seksi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id_kk?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalAmount = filteredData.reduce((sum, item) => sum + (item.total || 0), 0);

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Laporan Kas Keluar'],
      [''],
      ['Total Transaksi', filteredData.length],
      ['Total Amount', totalAmount],
      [''],
      ['Periode:', date?.from && date?.to ? `${format(date.from, 'dd/MM/yyyy')} - ${format(date.to, 'dd/MM/yyyy')}` : 'Semua']
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    // Detail sheet
    if (filteredData.length > 0) {
      const detailSheet = XLSX.utils.json_to_sheet(
        filteredData.map(item => ({
          'ID': item.id_kk,
          'Tanggal': item.tanggal,
          'Bagian/Seksi': item.bagian_seksi,
          'Rekening': item.kode_rek,
          'Nama Rekening': item.m_rekening?.nama_rek,
          'Keterangan': item.keterangan,
          'Penerima': item.penerima,
          'Jumlah': item.total
        }))
      );
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Kas Keluar');
    }

    const fileName = `kas-keluar-${Date.now()}.xlsx`;
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
        <title>Laporan Kas Keluar</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f5f5f5; }
          .negative { color: #EF4444; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Kas Keluar</h1>
          <p>Periode: ${dateRange}</p>
        </div>
        
        <div class="summary">
          <h2>Ringkasan</h2>
          <div class="summary-item">
            <span>Total Transaksi:</span>
            <span><strong>${filteredData.length}</strong></span>
          </div>
          <div class="summary-item">
            <span>Total Jumlah:</span>
            <span class="negative"><strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount)}</strong></span>
          </div>
        </div>

        <div>
          <h2>Detail Transaksi</h2>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Bagian/Seksi</th>
                <th>Rekening</th>
                <th>Keterangan</th>
                <th>Penerima</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(item => `
                <tr>
                  <td>${item.id_kk}</td>
                  <td>${item.tanggal}</td>
                  <td>${item.bagian_seksi}</td>
                  <td>${item.kode_rek}<br><small>${item.m_rekening?.nama_rek || ''}</small></td>
                  <td>${item.keterangan}</td>
                  <td>${item.penerima}</td>
                  <td class="negative">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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
    <Layout title="Kas Keluar">
      <div className="space-y-4 md:space-y-6 p-2 md:p-0">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* Form Section */}
          <div className="order-2 xl:order-1">
            <KasKeluarForm onSuccess={handleFormSuccess} />
          </div>

          {/* Summary Section */}
          <div className="space-y-4 md:space-y-6 order-1 xl:order-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Ringkasan Kas Keluar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base">Total Transaksi:</span>
                  <span className="font-bold text-sm md:text-base">{filteredData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base">Total Jumlah:</span>
                  <span className="font-bold text-red-600 text-sm md:text-base">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      notation: isMobile ? 'compact' : 'standard',
                      compactDisplay: 'short'
                    }).format(totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Informasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs md:text-sm text-gray-600 space-y-2">
                  <p>• Form digunakan untuk mencatat pengeluaran kas untuk berbagai keperluan</p>
                  <p>• Setiap transaksi akan mengurangi saldo rekening kas yang dipilih</p>
                  <p>• ID transaksi di-generate otomatis dengan format KK+YYYYMMDD+NNN</p>
                  <p>• Bagian/Seksi dan Penerima wajib diisi untuk kontrol internal</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Table Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-lg md:text-xl">Daftar Kas Keluar</CardTitle>
              <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari transaksi..."
                    className="pl-9 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <DateRangePicker 
                    dateRange={date} 
                    onDateRangeChange={setDate}
                  />
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
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            {/* Mobile Card View */}
            {isMobile ? (
              <div className="divide-y">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <div key={item.id_kk} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{item.id_kk}</div>
                          <div className="text-xs text-muted-foreground">{item.tanggal}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600 text-sm">
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
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-medium">{item.kode_rek}</span>
                          <div className="text-muted-foreground">{item.m_rekening?.nama_rek}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">Bagian: {item.bagian_seksi}</div>
                        <div className="text-sm">{item.keterangan}</div>
                        <div className="text-xs text-muted-foreground">Penerima: {item.penerima}</div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-3 pt-2 border-t">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <FileEdit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Tidak ada data kas keluar yang ditemukan
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Table View */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                        ID
                      </th>
                      <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                        Tanggal
                      </th>
                      <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                        Bagian/Seksi
                      </th>
                      <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                        Rekening
                      </th>
                      <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                        Keterangan
                      </th>
                      <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                        Penerima
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
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-muted-foreground">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <tr
                          key={item.id_kk}
                          className="border-b transition-colors hover:bg-muted/30"
                        >
                          <td className="p-4 align-middle text-sm font-medium">
                            {item.id_kk}
                          </td>
                          <td className="p-4 align-middle text-sm">
                            {item.tanggal}
                          </td>
                          <td className="p-4 align-middle text-sm">
                            {item.bagian_seksi}
                          </td>
                          <td className="p-4 align-middle text-sm">
                            <div className="font-medium">{item.kode_rek}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.m_rekening?.nama_rek}
                            </div>
                          </td>
                          <td className="p-4 align-middle text-sm">
                            {item.keterangan}
                          </td>
                          <td className="p-4 align-middle text-sm">
                            {item.penerima}
                          </td>
                          <td className="p-4 align-middle text-sm text-right font-medium text-red-600">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(item.total)}
                          </td>
                          <td className="p-4 align-middle text-sm">
                            <div className="flex items-center justify-center space-x-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-muted-foreground">
                          Tidak ada data kas keluar yang ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CashOut;

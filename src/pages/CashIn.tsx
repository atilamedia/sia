import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KasMasukForm } from "@/components/sia/KasMasukForm";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, FileEdit, Trash2, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from 'xlsx';

const CashIn = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: kasMasukData, isLoading, refetch } = useQuery({
    queryKey: ['kas-masuk', date?.from, date?.to, refreshTrigger],
    queryFn: () => siaApi.getKasMasuk(
      date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
    ),
  });

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    refetch();
  };

  const filteredData = kasMasukData?.data?.filter(item => 
    item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pembayar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id_km?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalAmount = filteredData.reduce((sum, item) => sum + (item.total || 0), 0);

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Laporan Kas Masuk'],
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
          'ID': item.id_km,
          'Tanggal': item.tanggal,
          'Rekening': item.kode_rek,
          'Nama Rekening': item.m_rekening?.nama_rek,
          'Keterangan': item.keterangan,
          'Pembayar': item.pembayar,
          'Jumlah': item.total
        }))
      );
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Kas Masuk');
    }

    const fileName = `kas-masuk-${Date.now()}.xlsx`;
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
        <title>Laporan Kas Masuk</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f5f5f5; }
          .positive { color: #10B981; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Kas Masuk</h1>
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
            <span class="positive"><strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount)}</strong></span>
          </div>
        </div>

        <div>
          <h2>Detail Transaksi</h2>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Rekening</th>
                <th>Keterangan</th>
                <th>Pembayar</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(item => `
                <tr>
                  <td>${item.id_km}</td>
                  <td>${item.tanggal}</td>
                  <td>${item.kode_rek}<br><small>${item.m_rekening?.nama_rek || ''}</small></td>
                  <td>${item.keterangan}</td>
                  <td>${item.pembayar}</td>
                  <td class="positive">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total)}</td>
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
    <Layout title="Kas Masuk">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div>
            <KasMasukForm onSuccess={handleFormSuccess} />
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Kas Masuk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Transaksi:</span>
                    <span className="font-bold">{filteredData.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Jumlah:</span>
                    <span className="font-bold text-green-600">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(totalAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Form digunakan untuk mencatat penerimaan kas dari berbagai sumber</p>
                  <p>• Setiap transaksi akan otomatis memperbarui saldo rekening kas</p>
                  <p>• ID transaksi di-generate otomatis dengan format KM+YYYYMMDD+NNN</p>
                  <p>• Data pembayar dan keterangan wajib diisi untuk keperluan audit</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Table Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Daftar Kas Masuk</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari transaksi..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
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
            </div>
          </CardHeader>
          <CardContent>
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
                      Rekening
                    </th>
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Keterangan
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr
                        key={item.id_km}
                        className="border-b transition-colors hover:bg-muted/30"
                      >
                        <td className="p-4 align-middle text-sm font-medium">
                          {item.id_km}
                        </td>
                        <td className="p-4 align-middle text-sm">
                          {item.tanggal}
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
                          {item.pembayar}
                        </td>
                        <td className="p-4 align-middle text-sm text-right font-medium text-green-600">
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
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        Tidak ada data kas masuk yang ditemukan
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
};

export default CashIn;

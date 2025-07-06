import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KasMasukForm } from "@/components/sia/KasMasukForm";
import { DeleteKasMasukDialog } from "@/components/sia/DeleteKasMasukDialog";
import { useQuery } from "@tanstack/react-query";
import { siaApi, type KasMasuk } from "@/lib/sia-api";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, Edit, Trash2, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from 'xlsx';
import { useIsMobile } from "@/hooks/use-mobile";

const CashIn = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingKasMasuk, setEditingKasMasuk] = useState<any>(null);
  const [deleteKasMasuk, setDeleteKasMasuk] = useState<any>(null);
  const isMobile = useIsMobile();

  const { data: kasMasukData, isLoading, refetch } = useQuery({
    queryKey: ['kas-masuk', date?.from, date?.to, refreshTrigger],
    queryFn: () => siaApi.getKasMasuk(
      date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
    ),
  });

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setEditingKasMasuk(null);
    refetch();
  };

  const handleEdit = (item: any) => {
    setEditingKasMasuk(item);
  };

  const handleCancelEdit = () => {
    setEditingKasMasuk(null);
  };

  const handleDelete = (item: any) => {
    setDeleteKasMasuk(item);
  };

  const handleDeleteSuccess = () => {
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
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
          }
          .letterhead {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
          }
          .letterhead img {
            width: 80px;
            height: 80px;
            float: left;
            margin-right: 20px;
          }
          .letterhead-content {
            text-align: center;
            display: inline-block;
            width: calc(100% - 100px);
          }
          .letterhead h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 5px 0;
            color: #000;
          }
          .letterhead h2 {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #000;
          }
          .letterhead .address {
            font-size: 11px;
            line-height: 1.3;
            margin: 5px 0;
          }
          .clearfix::after {
            content: "";
            display: table;
            clear: both;
          }
          .report-title { 
            text-align: center; 
            margin: 30px 0; 
            page-break-inside: avoid;
          }
          .report-title h1 {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
          }
          .summary { 
            margin-bottom: 30px; 
            page-break-inside: avoid;
          }
          .summary-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #eee; 
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
          }
          .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          .table th { 
            background-color: #f5f5f5; 
          }
          .positive { 
            color: #10B981; 
          }
          @media print { 
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="letterhead clearfix">
          <img src="/sia/uploads/3acae2a7-53c9-48ab-9ca1-08dc49ee0f14.png" alt="Logo RSUD" />
          <div class="letterhead-content">
            <h1>PEMERINTAH KABUPATEN HULU SUNGAI TENGAH</h1>
            <h2>RSUD H. DAMANHURI BARABAI</h2>
            <div class="address">
              Jalan Murakata Nomor 4 Barabai 71314 Telepon/Faxmile : 08115008080<br>
              Laman: www.rshdbarabai.com, Pos-el: rshd@hstkab.go.id<br>
              Terakreditasi Paripurna Nomor: KARS-SERT/456/XI/2022
            </div>
          </div>
        </div>
        
        <div class="report-title">
          <h1>Laporan Kas Masuk</h1>
        </div>
        
        <div style="text-align: center; margin-bottom: 20px; font-weight: bold;">
          Periode: ${dateRange}
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
        
        <div style="margin-top: 30px; text-align: right; font-size: 10px;">
          Dicetak pada: ${new Date().toLocaleString('id-ID')}
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
      <div className="space-y-4 md:space-y-6">
        {/* Form and Summary Section - Stack on mobile */}
        <div className={isMobile ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
          {/* Form Section */}
          <div className="order-1">
            <KasMasukForm 
              onSuccess={handleFormSuccess} 
              editData={editingKasMasuk}
              onCancel={handleCancelEdit}
            />
          </div>

          {/* Summary Section */}
          <div className="order-2 space-y-4 md:space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Ringkasan Kas Masuk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Total Transaksi:</span>
                  <span className="font-semibold text-sm">{filteredData.length}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Total Jumlah:</span>
                  <span className="font-semibold text-green-600 text-sm">
                    {isMobile ? 
                      new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        notation: 'compact',
                        compactDisplay: 'short',
                        minimumFractionDigits: 0,
                      }).format(totalAmount)
                      :
                      new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(totalAmount)
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Informasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs md:text-sm text-gray-600 space-y-2">
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
          <CardHeader className="pb-4">
            <div className="space-y-4">
              <CardTitle className="text-base md:text-lg">Daftar Kas Masuk</CardTitle>
              
              {/* Mobile Search and Filters */}
              {isMobile ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Cari transaksi..."
                      className="pl-9 h-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
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
                </div>
              ) : (
                // Desktop Search and Filters
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile Card View */}
            {isMobile ? (
              <div className="space-y-3 p-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading...
                  </div>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <Card key={item.id_km} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{item.id_km}</p>
                              <p className="text-xs text-muted-foreground">{item.tanggal}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600 text-sm">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  notation: 'compact',
                                  compactDisplay: 'short',
                                  minimumFractionDigits: 0,
                                }).format(item.total)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Rekening</p>
                              <p className="text-sm">{item.kode_rek}</p>
                              <p className="text-xs text-muted-foreground">{item.m_rekening?.nama_rek}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Keterangan</p>
                              <p className="text-sm">{item.keterangan}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Pembayar</p>
                              <p className="text-sm">{item.pembayar}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Tidak ada data kas masuk yang ditemukan
                  </div>
                )}
              </div>
            ) : (
              // Desktop Table View
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
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(item)}
                              >
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteKasMasukDialog
        open={!!deleteKasMasuk}
        onOpenChange={(open) => !open && setDeleteKasMasuk(null)}
        kasMasuk={deleteKasMasuk}
        onSuccess={handleDeleteSuccess}
      />
    </Layout>
  );
};

export default CashIn;

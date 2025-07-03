import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JurnalForm } from "@/components/sia/JurnalForm";
import { JournalEntriesCard } from "@/components/journal/JournalEntriesCard";
import { JournalTypesTable } from "@/components/journal/JournalTypesTable";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Search, FileSpreadsheet, FileText, FileEdit, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { useIsMobile } from "@/hooks/use-mobile";

const Journal = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();

  const { data: jurnalData, isLoading, refetch } = useQuery({
    queryKey: ['jurnal', date?.from, date?.to, refreshTrigger],
    queryFn: () => siaApi.getJurnal(
      date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
    ),
  });

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    refetch();
  };

  const filteredData = jurnalData?.data?.filter(item => 
    item.id_ju?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jurnal_jenis?.nm_jj?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Laporan Jurnal'],
      [''],
      ['Total Transaksi Jurnal', filteredData.length],
      [''],
      ['Periode:', date?.from && date?.to ? `${format(date.from, 'dd/MM/yyyy')} - ${format(date.to, 'dd/MM/yyyy')}` : 'Semua']
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    // Detail sheet
    if (filteredData.length > 0) {
      const detailData = [];
      filteredData.forEach(item => {
        if (item.jurnal && item.jurnal.length > 0) {
          item.jurnal.forEach(entry => {
            detailData.push({
              'ID Jurnal': item.id_ju,
              'Tanggal': item.tanggal,
              'Jenis Jurnal': item.jurnal_jenis?.nm_jj,
              'Kode Rekening': entry.kode_rek,
              'Nama Rekening': entry.m_rekening?.nama_rek,
              'Deskripsi': entry.deskripsi,
              'Debit': entry.debit || 0,
              'Kredit': entry.kredit || 0
            });
          });
        }
      });
      
      if (detailData.length > 0) {
        const detailSheet = XLSX.utils.json_to_sheet(detailData);
        XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Jurnal');
      }
    }

    const fileName = `jurnal-${Date.now()}.xlsx`;
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
        <title>Laporan Jurnal</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f5f5f5; }
          .debit { color: #10B981; }
          .kredit { color: #EF4444; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Jurnal</h1>
          <p>Periode: ${dateRange}</p>
        </div>
        
        <div class="summary">
          <h2>Ringkasan</h2>
          <div class="summary-item">
            <span>Total Transaksi Jurnal:</span>
            <span><strong>${filteredData.length}</strong></span>
          </div>
        </div>

        <div>
          <h2>Detail Jurnal</h2>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Rekening</th>
                <th>Deskripsi</th>
                <th>Debit</th>
                <th>Kredit</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(item => 
                item.jurnal?.map(entry => `
                  <tr>
                    <td>${item.id_ju}</td>
                    <td>${item.tanggal}</td>
                    <td>${item.jurnal_jenis?.nm_jj || ''}</td>
                    <td>${entry.kode_rek}<br><small>${entry.m_rekening?.nama_rek || ''}</small></td>
                    <td>${entry.deskripsi}</td>
                    <td class="debit">${entry.debit ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(entry.debit) : '-'}</td>
                    <td class="kredit">${entry.kredit ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(entry.kredit) : '-'}</td>
                  </tr>
                `).join('') || ''
              ).join('')}
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
    <Layout title="Jurnal">
      <div className="space-y-4 md:space-y-6 p-2 md:p-0">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* Form Section */}
          <div className="order-2 xl:order-1">
            <JurnalForm onSuccess={handleFormSuccess} />
          </div>

          {/* Info Section */}
          <div className="space-y-4 md:space-y-6 order-1 xl:order-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Ringkasan Jurnal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base">Total Jurnal:</span>
                  <span className="font-bold text-sm md:text-base">{filteredData.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Informasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs md:text-sm text-gray-600 space-y-2">
                  <p>• Jurnal umum digunakan untuk mencatat transaksi yang tidak termasuk dalam jurnal khusus</p>
                  <p>• Setiap entry jurnal harus balance (total debit = total kredit)</p>
                  <p>• ID jurnal di-generate otomatis dengan format JU+YYYYMMDD+NNN</p>
                  <p>• Setiap jurnal harus memiliki minimal 2 entry (debit dan kredit)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Journal Types Table */}
        <JournalTypesTable />

        {/* Journal Entries */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-lg md:text-xl">Daftar Jurnal</CardTitle>
              <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari jurnal..."
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
                    <div key={item.id_ju} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{item.id_ju}</div>
                          <div className="text-xs text-muted-foreground">{item.tanggal}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.jurnal_jenis?.nm_jj}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {item.jurnal?.map((entry, idx) => (
                          <div key={idx} className="text-xs p-2 bg-muted/50 rounded">
                            <div className="font-medium">{entry.kode_rek}</div>
                            <div className="text-muted-foreground">{entry.m_rekening?.nama_rek}</div>
                            <div className="flex justify-between mt-1">
                              <span>{entry.deskripsi}</span>
                              <div className="space-x-2">
                                {entry.debit ? (
                                  <span className="text-green-600 font-medium">
                                    D: {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR',
                                      minimumFractionDigits: 0,
                                      notation: 'compact',
                                      compactDisplay: 'short'
                                    }).format(entry.debit)}
                                  </span>
                                ) : null}
                                {entry.kredit ? (
                                  <span className="text-red-600 font-medium">
                                    K: {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR',
                                      minimumFractionDigits: 0,
                                      notation: 'compact',
                                      compactDisplay: 'short'
                                    }).format(entry.kredit)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
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
                    Tidak ada data jurnal yang ditemukan
                  </div>
                )}
              </div>
            ) : (
              /* Desktop View - use existing JournalEntriesCard */
              <JournalEntriesCard 
                data={filteredData}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Journal;

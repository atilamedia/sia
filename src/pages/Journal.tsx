import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JurnalForm } from "@/components/sia/JurnalForm";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, Download, FileEdit, Trash2, BookOpen, FileSpreadsheet, FileText } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { useIsMobile } from "@/hooks/use-mobile";

const Journal = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingJurnal, setEditingJurnal] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingJournalId, setDeletingJournalId] = useState<string>("");
  const { toast } = useToast();
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

  const handleEdit = (jurnal: any) => {
    console.log('Editing jurnal:', jurnal);
    setEditingJurnal(jurnal);
    setIsEditFormOpen(true);
  };

  const handleDelete = (id_ju: string) => {
    setDeletingJournalId(id_ju);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await siaApi.deleteJurnal(deletingJournalId);
      toast({
        title: "Berhasil",
        description: "Jurnal berhasil dihapus",
      });
      handleFormSuccess();
    } catch (error) {
      console.error('Delete jurnal error:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus jurnal",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
    setDeletingJournalId("");
  };

  const handleEditSave = async (entries: any[]) => {
    try {
      if (!editingJurnal) return;
      
      const updateData = {
        tanggal: editingJurnal.tanggal,
        usernya: editingJurnal.usernya,
        id_div: editingJurnal.id_div,
        id_jj: editingJurnal.id_jj,
        entries: entries.map(entry => ({
          kode_rek: entry.accountCode,
          deskripsi: entry.description,
          debit: entry.debit,
          kredit: entry.credit
        }))
      };

      await siaApi.updateJurnal(editingJurnal.id_ju, updateData);
      toast({
        title: "Berhasil",
        description: "Jurnal berhasil diupdate",
      });
      setIsEditFormOpen(false);
      setEditingJurnal(null);
      handleFormSuccess();
    } catch (error) {
      console.error('Update jurnal error:', error);
      toast({
        title: "Error",
        description: "Gagal mengupdate jurnal",
        variant: "destructive",
      });
    }
  };

  const filteredData = jurnalData?.data?.filter(item => 
    item.id_ju?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jurnal_jenis?.nm_jj?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalEntries = filteredData.reduce((sum, item) => sum + (item.jurnal?.length || 0), 0);
  const totalDebit = filteredData.reduce((sum, item) => 
    sum + (item.jurnal?.reduce((debitSum, entry) => debitSum + (entry.debit || 0), 0) || 0), 0
  );
  const totalKredit = filteredData.reduce((sum, item) => 
    sum + (item.jurnal?.reduce((kreditSum, entry) => kreditSum + (entry.kredit || 0), 0) || 0), 0
  );

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Laporan Jurnal Umum'],
      [''],
      ['Total Jurnal', filteredData.length],
      ['Total Entries', totalEntries],
      ['Total Debit', totalDebit],
      ['Total Kredit', totalKredit],
      ['Status', totalDebit === totalKredit ? 'Balanced' : 'Unbalanced'],
      [''],
      ['Periode:', date?.from && date?.to ? `${format(date.from, 'dd/MM/yyyy')} - ${format(date.to, 'dd/MM/yyyy')}` : 'Semua']
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    // Detail sheet
    if (filteredData.length > 0) {
      const detailData = filteredData.flatMap(jurnal => 
        jurnal.jurnal?.map(entry => ({
          'ID Jurnal': jurnal.id_ju,
          'Tanggal': jurnal.tanggal,
          'Jenis': jurnal.jurnal_jenis?.nm_jj,
          'Kode Rekening': entry.kode_rek,
          'Nama Rekening': entry.m_rekening?.nama_rek,
          'Deskripsi': entry.deskripsi,
          'Debit': entry.debit,
          'Kredit': entry.kredit
        })) || []
      );
      
      const detailSheet = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Jurnal');
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

    const currentDate = new Date().toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Jurnal Umum</title>
        <style>
          @page {
            margin: 15mm;
            size: A4;
          }

          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .letterhead {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 15px 0;
            border-bottom: 3px solid #2563eb;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .logo {
            width: 70px;
            height: 70px;
            object-fit: contain;
          }
          
          .institution-info h1 {
            color: #1e40af;
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .institution-info h2 {
            color: #1e40af;
            margin: 2px 0;
            font-size: 14px;
            font-weight: 600;
          }
          
          .institution-info p {
            margin: 1px 0;
            font-size: 10px;
            color: #64748b;
          }
          
          .accreditation {
            text-align: right;
            font-size: 10px;
          }
          
          .accreditation-badge {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .print-info {
            color: #64748b;
            font-size: 9px;
            margin-top: 5px;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 25px;
          }
          
          .header h1 {
            color: #1e40af;
            margin: 0 0 5px 0;
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .header p {
            margin: 0;
            color: #64748b;
            font-size: 12px;
          }
          
          .summary { 
            margin-bottom: 25px;
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
          }
          
          .summary h2 {
            color: #1e40af;
            margin: 0 0 12px 0;
            font-size: 16px;
          }
          
          .summary-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 6px 0; 
            border-bottom: 1px solid #e2e8f0;
          }
          
          .summary-item:last-child {
            border-bottom: none;
            font-weight: bold;
            background: white;
            margin: 8px -15px -15px -15px;
            padding: 12px 15px;
            border-radius: 0 0 8px 8px;
          }
          
          .jurnal-item { 
            margin-bottom: 25px; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px;
            overflow: hidden;
          }
          
          .jurnal-header { 
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            padding: 12px 15px; 
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .jurnal-title {
            font-weight: bold;
            color: #1e40af;
            font-size: 14px;
          }
          
          .jurnal-meta {
            font-size: 11px;
            color: #64748b;
          }
          
          .table { 
            width: 100%; 
            border-collapse: collapse;
          }
          
          .table th, .table td { 
            border: 1px solid #e2e8f0; 
            padding: 8px 10px; 
            text-align: left;
            font-size: 11px;
          }
          
          .table th { 
            background: #f8fafc;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .table tbody tr:hover {
            background: #f8fafc;
          }
          
          .debit { color: #3B82F6; font-weight: 500; }
          .credit { color: #10B981; font-weight: 500; }
          .balanced { color: #10B981; font-weight: bold; }
          .unbalanced { color: #EF4444; font-weight: bold; }
          
          .total-row {
            border-top: 2px solid #1e40af;
            font-weight: bold;
            background: #f8fafc;
          }
          
          .footer {
            margin-top: 25px;
            text-align: center;
            font-size: 9px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
          }
          
          @media print { 
            body { margin: 0; }
            .jurnal-header { background: #f8fafc !important; }
          }
        </style>
      </head>
      <body>
        <div class="letterhead">
          <div class="logo-section">
            <img src="/lovable-uploads/3acae2a7-53c9-48ab-9ca1-08dc49ee0f14.png" alt="Logo" class="logo" />
            <div class="institution-info">
              <h1>Sekolah Tinggi Ilmu Kesehatan</h1>
              <h2>STIKES Suaka Insan Banjarmasin</h2>
              <p>Jl. HM. Cokrokusumo No.1A, Kec. Banjarmasin Barat, Kota Banjarmasin, Kalimantan Selatan 70114</p>
              <p>Telp: (0511) 6749670 | Email: stikessuakainsan@gmail.com | Website: www.stikes-suakainsan.ac.id</p>
            </div>
          </div>
          <div class="accreditation">
            <div class="accreditation-badge">Terakreditasi B</div>
            <div class="print-info">Dicetak: ${currentDate}</div>
          </div>
        </div>
        
        <div class="header">
          <h1>Laporan Jurnal Umum</h1>
          <p>Periode: ${dateRange}</p>
        </div>
        
        <div class="summary">
          <h2>Ringkasan</h2>
          <div class="summary-item">
            <span>Total Jurnal:</span>
            <span><strong>${filteredData.length}</strong></span>
          </div>
          <div class="summary-item">
            <span>Total Entries:</span>
            <span><strong>${totalEntries}</strong></span>
          </div>
          <div class="summary-item">
            <span>Total Debit:</span>
            <span class="debit"><strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalDebit)}</strong></span>
          </div>
          <div class="summary-item">
            <span>Total Kredit:</span>
            <span class="credit"><strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalKredit)}</strong></span>
          </div>
          <div class="summary-item">
            <span>Status:</span>
            <span class="${totalDebit === totalKredit ? 'balanced' : 'unbalanced'}"><strong>${totalDebit === totalKredit ? 'Balanced' : 'Unbalanced'}</strong></span>
          </div>
        </div>

        <div>
          <h2 style="color: #1e40af; margin-bottom: 15px; font-size: 16px;">Detail Jurnal</h2>
          ${filteredData.map(jurnal => `
            <div class="jurnal-item">
              <div class="jurnal-header">
                <div class="jurnal-title">${jurnal.id_ju}</div>
                <div class="jurnal-meta">${jurnal.tanggal} - ${jurnal.jurnal_jenis?.nm_jj}</div>
              </div>
              <table class="table">
                <thead>
                  <tr>
                    <th style="width: 20%;">Rekening</th>
                    <th style="width: 40%;">Deskripsi</th>
                    <th style="width: 20%;" class="text-right">Debit</th>
                    <th style="width: 20%;" class="text-right">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  ${jurnal.jurnal?.map(entry => `
                    <tr>
                      <td>
                        <strong>${entry.kode_rek}</strong>
                        <br><small style="color: #64748b;">${entry.m_rekening?.nama_rek || ''}</small>
                      </td>
                      <td>${entry.deskripsi}</td>
                      <td class="debit text-right">${entry.debit > 0 ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(entry.debit) : '-'}</td>
                      <td class="credit text-right">${entry.kredit > 0 ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(entry.kredit) : '-'}</td>
                    </tr>
                  `).join('') || ''}
                  <tr class="total-row">
                    <td colspan="2"><strong>Total:</strong></td>
                    <td class="debit text-right"><strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(jurnal.jurnal?.reduce((sum, entry) => sum + (entry.debit || 0), 0) || 0)}</strong></td>
                    <td class="credit text-right"><strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(jurnal.jurnal?.reduce((sum, entry) => sum + (entry.kredit || 0), 0) || 0)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          `).join('')}
        </div>
        
        <div class="footer">
          <p>Laporan ini digenerate secara otomatis oleh Sistem Informasi Akuntansi STIKES Suaka Insan Banjarmasin</p>
          <p>Total ${filteredData.length} jurnal dengan ${totalEntries} entries</p>
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
    <Layout title="Jurnal Umum">
      <div className="space-y-4 md:space-y-6">
        {/* Form and Summary Section - Stack on mobile */}
        <div className={isMobile ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
          {/* Form Section */}
          <div className="order-1">
            <JurnalForm onSuccess={handleFormSuccess} />
          </div>

          {/* Summary Section */}
          <div className="order-2 space-y-4 md:space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Ringkasan Jurnal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Total Jurnal:</span>
                  <span className="font-semibold text-sm">{filteredData.length}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Total Entries:</span>
                  <span className="font-semibold text-sm">{totalEntries}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Total Debit:</span>
                  <span className="font-semibold text-blue-600 text-sm">
                    {isMobile ? 
                      new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        notation: 'compact',
                        compactDisplay: 'short',
                        minimumFractionDigits: 0,
                      }).format(totalDebit)
                      :
                      new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(totalDebit)
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Total Kredit:</span>
                  <span className="font-semibold text-green-600 text-sm">
                    {isMobile ? 
                      new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        notation: 'compact',
                        compactDisplay: 'short',
                        minimumFractionDigits: 0,
                      }).format(totalKredit)
                      :
                      new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(totalKredit)
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm text-muted-foreground">Balance:</span>
                  <span className={`font-semibold text-sm ${totalDebit === totalKredit ? 'text-green-600' : 'text-red-600'}`}>
                    {totalDebit === totalKredit ? 'Balanced' : 'Unbalanced'}
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
                  <p>• Form digunakan untuk mencatat transaksi akuntansi dengan metode double entry</p>
                  <p>• Total debit harus sama dengan total kredit (balance)</p>
                  <p>• ID jurnal di-generate otomatis dengan format JU+YYYYMMDD+NNN</p>
                  <p>• Setiap entry harus memiliki deskripsi yang jelas untuk keperluan audit</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Table Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="space-y-4">
              <CardTitle className="text-base md:text-lg">Daftar Jurnal Umum</CardTitle>
              
              {/* Mobile Search and Filters */}
              {isMobile ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Cari jurnal..."
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
                        placeholder="Cari jurnal..."
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
                  filteredData.map((jurnal) => (
                    <Card key={jurnal.id_ju} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">{jurnal.id_ju}</span>
                            <span className="text-xs text-muted-foreground">
                              - {jurnal.tanggal}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(jurnal)}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(jurnal.id_ju)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded w-fit">
                          {jurnal.jurnal_jenis?.nm_jj}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {jurnal.jurnal?.map((entry, index) => (
                          <div key={index} className="border-b pb-2 last:border-b-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{entry.kode_rek}</p>
                                <p className="text-xs text-muted-foreground">{entry.m_rekening?.nama_rek}</p>
                                <p className="text-xs mt-1">{entry.deskripsi}</p>
                              </div>
                              <div className="text-right ml-2">
                                {entry.debit > 0 && (
                                  <p className="text-blue-600 font-medium text-xs">
                                    D: {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR',
                                      notation: 'compact',
                                      compactDisplay: 'short',
                                      minimumFractionDigits: 0,
                                    }).format(entry.debit)}
                                  </p>
                                )}
                                {entry.kredit > 0 && (
                                  <p className="text-green-600 font-medium text-xs">
                                    K: {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR',
                                      notation: 'compact',
                                      compactDisplay: 'short',
                                      minimumFractionDigits: 0,
                                    }).format(entry.kredit)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="mt-3 pt-3 border-t flex justify-between text-xs font-medium">
                          <span>Total:</span>
                          <div className="flex space-x-2">
                            <span className="text-blue-600">
                              D: {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                notation: 'compact',
                                compactDisplay: 'short',
                                minimumFractionDigits: 0,
                              }).format(jurnal.jurnal?.reduce((sum, entry) => sum + (entry.debit || 0), 0) || 0)}
                            </span>
                            <span className="text-green-600">
                              K: {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                notation: 'compact',
                                compactDisplay: 'short',
                                minimumFractionDigits: 0,
                              }).format(jurnal.jurnal?.reduce((sum, entry) => sum + (entry.kredit || 0), 0) || 0)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Tidak ada data jurnal yang ditemukan
                  </div>
                )}
              </div>
            ) : (
              // Desktop Card View (existing code remains the same)
              <div className="space-y-4 p-4">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : filteredData.length > 0 ? (
                  filteredData.map((jurnal) => (
                    <Card key={jurnal.id_ju} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{jurnal.id_ju}</span>
                            <span className="text-sm text-muted-foreground">
                              - {jurnal.tanggal}
                            </span>
                            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {jurnal.jurnal_jenis?.nm_jj}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(jurnal)}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(jurnal.id_ju)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 font-medium">Rekening</th>
                                <th className="text-left p-2 font-medium">Deskripsi</th>
                                <th className="text-right p-2 font-medium">Debit</th>
                                <th className="text-right p-2 font-medium">Kredit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {jurnal.jurnal?.map((entry, index) => (
                                <tr key={index} className="border-b last:border-b-0">
                                  <td className="p-2">
                                    <div className="font-medium">{entry.kode_rek}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {entry.m_rekening?.nama_rek}
                                    </div>
                                  </td>
                                  <td className="p-2">{entry.deskripsi}</td>
                                  <td className="p-2 text-right font-medium text-blue-600">
                                    {entry.debit > 0 ? new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR',
                                      minimumFractionDigits: 0,
                                    }).format(entry.debit) : '-'}
                                  </td>
                                  <td className="p-2 text-right font-medium text-green-600">
                                    {entry.kredit > 0 ? new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR',
                                      minimumFractionDigits: 0,
                                    }).format(entry.kredit) : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-between text-sm font-medium">
                          <span>Total:</span>
                          <div className="flex space-x-4">
                            <span className="text-blue-600">
                              Debit: {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(jurnal.jurnal?.reduce((sum, entry) => sum + (entry.debit || 0), 0) || 0)}
                            </span>
                            <span className="text-green-600">
                              Kredit: {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(jurnal.jurnal?.reduce((sum, entry) => sum + (entry.kredit || 0), 0) || 0)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Tidak ada data jurnal yang ditemukan
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Form Dialog */}
      <JournalEntryForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setEditingJurnal(null);
        }}
        onSave={handleEditSave}
        journalTypes={[{ id: 'JU', name: 'Jurnal Umum', isDefault: true }]}
        initialEntries={editingJurnal?.jurnal?.map((entry: any) => ({
          code: editingJurnal.id_ju,
          date: editingJurnal.tanggal,
          accountCode: entry.kode_rek,
          description: entry.deskripsi,
          debit: entry.debit || 0,
          credit: entry.kredit || 0,
          user: editingJurnal.usernya,
          createdAt: editingJurnal.at_create
        })) || []}
        isEditing={true}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jurnal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jurnal {deletingJournalId}? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Journal;

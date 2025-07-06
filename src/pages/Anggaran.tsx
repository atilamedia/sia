
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, Upload, Plus, Edit, Trash2, FileSpreadsheet, FileText } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { siaApi, MasterRekening, AnggaranData } from "@/lib/sia-api";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { AnggaranModal } from "@/components/anggaran/AnggaranModal";
import { DeleteAnggaranDialog } from "@/components/anggaran/DeleteAnggaranDialog";
import { formatCurrency } from "@/lib/utils";

export default function Anggaran() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingAnggaran, setEditingAnggaran] = useState<(AnggaranData & { nama_rek?: string }) | undefined>();

  // Generate year options (current year ± 5 years)
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    yearOptions.push(i);
  }

  // Query untuk mengambil data rekening
  const { data: rekeningData, isLoading: loadingRekening } = useQuery({
    queryKey: ['rekening'],
    queryFn: async () => {
      const response = await siaApi.getMasterRekening();
      return response;
    }
  });

  // Query untuk mengambil data anggaran
  const { data: anggaranData, isLoading: loadingAnggaran } = useQuery({
    queryKey: ['anggaran', selectedYear],
    queryFn: async () => {
      const response = await siaApi.getAnggaran(selectedYear);
      return response;
    }
  });

  const rekening: MasterRekening[] = rekeningData?.data || [];
  const anggaran: AnggaranData[] = anggaranData?.data || [];

  // Gabungkan data rekening dengan anggaran
  const budgetData = anggaran.map(ang => {
    const rek = rekening.find(r => r.kode_rek === ang.kode_rek);
    return {
      ...ang,
      nama_rek: rek?.nama_rek || 'Rekening tidak ditemukan',
      jenis_rek: rek?.jenis_rek || '',
      level: rek?.level || 0
    };
  });

  const totalAnggaran = budgetData.reduce((sum, item) => sum + item.total, 0);

  const handleExportTemplate = () => {
    try {
      const templateData = rekening.map(rek => ({
        'Kode Rekening': rek.kode_rek,
        'Nama Rekening': rek.nama_rek,
        'Jenis Rekening': rek.jenis_rek,
        'Level': rek.level,
        'Anggaran': 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Anggaran');

      const fileName = `template-anggaran-${selectedYear}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success("Template Excel berhasil diunduh!");
    } catch (error) {
      console.error('Error exporting template:', error);
      toast.error("Gagal mengunduh template");
    }
  };

  const handleExportExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [
        ['ANGGARAN TAHUNAN'],
        ['RSUD H. Damanhuri Barabai'],
        [''],
        ['Tahun Anggaran:', selectedYear],
        ['Total Anggaran:', `Rp ${totalAnggaran.toLocaleString('id-ID')}`],
        ['Jumlah Rekening:', budgetData.length],
        [''],
        ['Tanggal Cetak:', new Date().toLocaleString('id-ID')]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

      // Detail sheet
      if (budgetData.length > 0) {
        const detailData = budgetData.map(item => ({
          'Kode Rekening': item.kode_rek,
          'Nama Rekening': item.nama_rek,
          'Jenis Rekening': item.jenis_rek,
          'Total Anggaran': item.total,
          'Status': item.tanda === 'Y' ? 'Aktif' : 'Tidak Aktif',
          'Validasi': item.validasi_realisasi === 'Y' ? 'Valid' : 'Belum Valid',
          'User': item.usernya
        }));
        
        const detailSheet = XLSX.utils.json_to_sheet(detailData);
        XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Anggaran');
      }

      const fileName = `anggaran-${selectedYear}-${Date.now()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success("Excel berhasil diunduh!");
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error("Gagal mengekspor Excel");
    }
  };

  const handleExportPDF = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Gagal membuka jendela cetak. Pastikan popup tidak diblokir.");
        return;
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Anggaran Tahunan ${selectedYear}</title>
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
            }
            .report-title h1 {
              font-size: 16px;
              font-weight: bold;
              margin: 0;
            }
            .summary { 
              margin-bottom: 30px; 
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 20px;
            }
            .summary-item { 
              display: flex; 
              justify-content: space-between; 
              padding: 8px 12px; 
              border: 1px solid #ddd;
              background-color: #f9f9f9;
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
            }
            .table th, .table td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left; 
              font-size: 10px;
            }
            .table th { 
              background-color: #f5f5f5; 
              font-weight: bold;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
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
            <h1>ANGGARAN TAHUNAN</h1>
            <h3>Tahun Anggaran ${selectedYear}</h3>
          </div>
          
          <div class="summary">
            <h3>Ringkasan</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span>Total Anggaran:</span>
                <span><strong>Rp ${totalAnggaran.toLocaleString('id-ID')}</strong></span>
              </div>
              <div class="summary-item">
                <span>Jumlah Rekening:</span>
                <span><strong>${budgetData.length}</strong></span>
              </div>
            </div>
          </div>

          <div>
            <h3>Detail Anggaran</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Kode Rekening</th>
                  <th>Nama Rekening</th>
                  <th>Jenis</th>
                  <th class="text-right">Total Anggaran</th>
                  <th class="text-center">Status</th>
                  <th class="text-center">Validasi</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                ${budgetData.length === 0 ? 
                  '<tr><td colspan="7" class="text-center">Tidak ada data anggaran</td></tr>' :
                  budgetData.map(item => `
                    <tr>
                      <td>${item.kode_rek}</td>
                      <td>${item.nama_rek}</td>
                      <td>${item.jenis_rek}</td>
                      <td class="text-right">Rp ${item.total.toLocaleString('id-ID')}</td>
                      <td class="text-center">${item.tanda === 'Y' ? 'Aktif' : 'Tidak Aktif'}</td>
                      <td class="text-center">${item.validasi_realisasi === 'Y' ? 'Valid' : 'Belum Valid'}</td>
                      <td>${item.usernya}</td>
                    </tr>
                  `).join('')
                }
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
      
      toast.success("PDF berhasil disiapkan untuk dicetak!");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error("Gagal mengekspor PDF");
    }
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Process imported data
        let successCount = 0;
        jsonData.forEach(async (row: any) => {
          const kodeRek = row['Kode Rekening'];
          const anggaran = parseFloat(row['Anggaran']) || 0;
          if (kodeRek && anggaran > 0) {
            try {
              await siaApi.createAnggaran({
                kode_rek: kodeRek,
                tahun: selectedYear,
                total: anggaran,
                tanda: 'Y',
                usernya: 'admin',
                validasi_realisasi: 'Y'
              });
              successCount++;
            } catch (error) {
              console.error(`Error importing ${kodeRek}:`, error);
            }
          }
        });

        toast.success(`Berhasil import ${successCount} data anggaran!`);
      } catch (error) {
        console.error('Error importing Excel:', error);
        toast.error("Gagal import file Excel");
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset input
    event.target.value = '';
  };

  const handleCreateAnggaran = () => {
    setModalMode('create');
    setEditingAnggaran(undefined);
    setModalOpen(true);
  };

  const handleEditAnggaran = (anggaran: AnggaranData & { nama_rek?: string }) => {
    setModalMode('edit');
    setEditingAnggaran(anggaran);
    setModalOpen(true);
  };

  const handleDeleteAnggaran = (anggaran: AnggaranData & { nama_rek?: string }) => {
    setEditingAnggaran(anggaran);
    setDeleteDialogOpen(true);
  };

  const isLoading = loadingRekening || loadingAnggaran;

  return (
    <Layout title="Manajemen Anggaran">
      <div className="space-y-6">
        {/* Header dengan kontrol tahun dan aksi */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Anggaran</h1>
            <p className="text-gray-600">Kelola anggaran per rekening untuk tahun {selectedYear}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Pilih Tahun */}
            <div className="flex items-center gap-2">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
              <Button onClick={handleExportTemplate} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Template</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <label htmlFor="excel-import" className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Import</span>
                </label>
              </Button>
              <Button onClick={handleCreateAnggaran} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah</span>
              </Button>
              <input
                id="excel-import"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Anggaran {selectedYear}</CardTitle>
            <CardDescription>
              Total Anggaran: {formatCurrency(totalAnggaran)} • Jumlah Rekening: {budgetData.length}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Desktop Table View */}
        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle>Daftar Anggaran per Rekening</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Rekening</TableHead>
                      <TableHead>Nama Rekening</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead className="text-right">Total Anggaran</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Validasi</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          Belum ada data anggaran untuk tahun {selectedYear}
                        </TableCell>
                      </TableRow>
                    ) : (
                      budgetData.map((item) => (
                        <TableRow key={item.kode_rek}>
                          <TableCell className="font-mono text-sm">
                            {item.kode_rek}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={item.nama_rek || ''}>
                              {item.nama_rek}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.jenis_rek}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={item.tanda === 'Y' ? 'default' : 'secondary'}
                            >
                              {item.tanda === 'Y' ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={item.validasi_realisasi === 'Y' ? 'default' : 'secondary'}
                            >
                              {item.validasi_realisasi === 'Y' ? 'Valid' : 'Belum Valid'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {item.usernya}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditAnggaran(item)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAnggaran(item)}
                                className="flex items-center gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
                </div>
              </CardContent>
            </Card>
          ) : budgetData.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                Belum ada data anggaran untuk tahun {selectedYear}
              </CardContent>
            </Card>
          ) : (
            budgetData.map((item) => (
              <Card key={item.kode_rek}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-mono text-sm font-medium">{item.kode_rek}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.nama_rek}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAnggaran(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAnggaran(item)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Jenis:</span>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.jenis_rek}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Anggaran:</span>
                        <p className="font-medium mt-1">{formatCurrency(item.total)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <div className="mt-1">
                          <Badge 
                            variant={item.tanda === 'Y' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.tanda === 'Y' ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Validasi:</span>
                        <div className="mt-1">
                          <Badge 
                            variant={item.validasi_realisasi === 'Y' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.validasi_realisasi === 'Y' ? 'Valid' : 'Belum Valid'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">User: {item.usernya}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal untuk input/edit anggaran */}
        <AnggaranModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          tahun={selectedYear}
          editData={editingAnggaran}
          mode={modalMode}
        />

        {/* Dialog konfirmasi delete */}
        {editingAnggaran && (
          <DeleteAnggaranDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            anggaran={editingAnggaran}
            tahun={selectedYear}
          />
        )}
      </div>
    </Layout>
  );
}

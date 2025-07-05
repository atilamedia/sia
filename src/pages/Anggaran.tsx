
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, Upload, Plus, Edit, Trash2 } from "lucide-react";
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
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
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
            <div className="flex gap-2">
              <Button onClick={handleCreateAnggaran} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
              <Button onClick={handleExportTemplate} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Template
              </Button>
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <label htmlFor="excel-import" className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Import
                </label>
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

        {/* Tabel Anggaran */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Anggaran per Rekening</CardTitle>
            <CardDescription>
              Tahun Anggaran: {selectedYear} • Total Anggaran: {budgetData.length}
            </CardDescription>
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
                            Rp {item.total.toLocaleString('id-ID')}
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

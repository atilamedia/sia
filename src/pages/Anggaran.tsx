
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Download, Upload, FileSpreadsheet, Plus, Save } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { siaApi, MasterRekening, AnggaranData } from "@/lib/sia-api";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export default function Anggaran() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingBudgets, setEditingBudgets] = useState<{[key: string]: number}>({});
  const queryClient = useQueryClient();

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

  // Mutation untuk menyimpan anggaran
  const saveBudgetMutation = useMutation({
    mutationFn: async (data: AnggaranData) => {
      return await siaApi.createAnggaran(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran', selectedYear] });
      toast.success("Anggaran berhasil disimpan!");
    },
    onError: (error) => {
      console.error('Error saving budget:', error);
      toast.error("Gagal menyimpan anggaran");
    }
  });

  // Mutation untuk update anggaran
  const updateBudgetMutation = useMutation({
    mutationFn: async ({ kodeRek, data }: { kodeRek: string, data: AnggaranData }) => {
      return await siaApi.updateAnggaran(kodeRek, selectedYear, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran', selectedYear] });
      toast.success("Anggaran berhasil diupdate!");
    },
    onError: (error) => {
      console.error('Error updating budget:', error);
      toast.error("Gagal mengupdate anggaran");
    }
  });

  const rekening: MasterRekening[] = rekeningData?.data || [];
  const anggaran: AnggaranData[] = anggaranData?.data || [];

  // Gabungkan data rekening dengan anggaran
  const budgetData = rekening.map(rek => {
    const existingBudget = anggaran.find(ang => ang.kode_rek === rek.kode_rek);
    return {
      ...rek,
      anggaran: existingBudget?.total || 0,
      hasExistingBudget: !!existingBudget
    };
  });

  const handleBudgetChange = (kodeRek: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditingBudgets(prev => ({
      ...prev,
      [kodeRek]: numValue
    }));
  };

  const handleSaveBudget = async (kodeRek: string, currentBudget: number, hasExisting: boolean) => {
    const newAmount = editingBudgets[kodeRek];
    if (newAmount === undefined) return;

    const budgetData: AnggaranData = {
      kode_rek: kodeRek,
      tahun: selectedYear,
      total: newAmount,
      tanda: 'Y',
      usernya: 'admin',
      validasi_realisasi: 'Y'
    };

    if (hasExisting) {
      await updateBudgetMutation.mutateAsync({ kodeRek, data: budgetData });
    } else {
      await saveBudgetMutation.mutateAsync(budgetData);
    }

    // Clear editing state
    setEditingBudgets(prev => {
      const newState = { ...prev };
      delete newState[kodeRek];
      return newState;
    });
  };

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
        const importedBudgets: {[key: string]: number} = {};
        jsonData.forEach((row: any) => {
          const kodeRek = row['Kode Rekening'];
          const anggaran = parseFloat(row['Anggaran']) || 0;
          if (kodeRek && anggaran > 0) {
            importedBudgets[kodeRek] = anggaran;
          }
        });

        setEditingBudgets(prev => ({ ...prev, ...importedBudgets }));
        toast.success(`Berhasil import ${Object.keys(importedBudgets).length} data anggaran!`);
      } catch (error) {
        console.error('Error importing Excel:', error);
        toast.error("Gagal import file Excel");
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset input
    event.target.value = '';
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
              Tahun Anggaran: {selectedYear} • Total Rekening: {rekening.length}
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
                      <TableHead>Level</TableHead>
                      <TableHead className="text-right">Anggaran Saat Ini</TableHead>
                      <TableHead className="text-right">Anggaran Baru</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          Tidak ada data rekening
                        </TableCell>
                      </TableRow>
                    ) : (
                      budgetData.map((item) => {
                        const isEditing = editingBudgets.hasOwnProperty(item.kode_rek);
                        const editingValue = editingBudgets[item.kode_rek];
                        
                        return (
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
                            <TableCell>{item.level}</TableCell>
                            <TableCell className="text-right">
                              Rp {item.anggaran.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                value={isEditing ? editingValue : item.anggaran}
                                onChange={(e) => handleBudgetChange(item.kode_rek, e.target.value)}
                                className="w-32 text-right"
                                placeholder="0"
                                min="0"
                                step="1000"
                              />
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={item.hasExistingBudget ? 'default' : 'secondary'}
                              >
                                {item.hasExistingBudget ? 'Ada' : 'Belum Ada'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => handleSaveBudget(item.kode_rek, item.anggaran, item.hasExistingBudget)}
                                disabled={!isEditing || saveBudgetMutation.isPending || updateBudgetMutation.isPending}
                                className="flex items-center gap-1"
                              >
                                <Save className="h-3 w-3" />
                                Simpan
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

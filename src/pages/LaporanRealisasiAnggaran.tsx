
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, FileText, FileSpreadsheet, TrendingUp, TrendingDown } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { siaApi } from "@/lib/sia-api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface LRAData {
  kode_rek: string;
  nama_rek: string;
  anggaran: number;
  realisasi: number;
  selisih: number;
  persentase: number;
  jenis_rek: string;
}

export default function LaporanRealisasiAnggaran() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1), // Awal tahun
    to: new Date()
  });

  const currentYear = new Date().getFullYear();

  // Query untuk mengambil data rekening
  const { data: rekeningData } = useQuery({
    queryKey: ['rekening'],
    queryFn: async () => {
      const response = await siaApi.getMasterRekening();
      return response;
    }
  });

  // Query untuk mengambil data anggaran
  const { data: anggaranData, isLoading: loadingAnggaran } = useQuery({
    queryKey: ['anggaran', currentYear],
    queryFn: async () => {
      const response = await siaApi.getAnggaran(currentYear);
      return response;
    }
  });

  // Query untuk mengambil data realisasi (kas masuk + kas keluar)
  const { data: realisasiData, isLoading: loadingRealisasi } = useQuery({
    queryKey: ['realisasi', dateRange?.from, dateRange?.to],
    queryFn: async () => {
      const kasMasuk = await siaApi.getKasMasuk(
        dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
      );
      const kasKeluar = await siaApi.getKasKeluar(
        dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
      );
      return { kasMasuk, kasKeluar };
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  // Gabungkan data anggaran dan realisasi
  const lraData: LRAData[] = [];
  
  // Proses data anggaran dan realisasi
  if (anggaranData?.data && realisasiData && rekeningData?.data) {
    // Create a map of rekening for quick lookup
    const rekeningMap = new Map();
    rekeningData.data.forEach((rek: any) => {
      rekeningMap.set(rek.kode_rek, rek);
    });

    const dataMap = new Map<string, { anggaran: number, realisasi: number, nama_rek: string, jenis_rek: string }>();
    
    // Proses data anggaran
    anggaranData.data.forEach((item: any) => {
      const rekening = rekeningMap.get(item.kode_rek);
      dataMap.set(item.kode_rek, {
        anggaran: item.total || 0,
        realisasi: 0,
        nama_rek: rekening?.nama_rek || item.nama_rek || 'Nama Rekening Tidak Ditemukan',
        jenis_rek: rekening?.jenis_rek || 'LRA'
      });
    });

    // Proses data realisasi kas masuk
    realisasiData.kasMasuk?.data?.forEach((item: any) => {
      const rekening = rekeningMap.get(item.kode_rek);
      const existing = dataMap.get(item.kode_rek) || { 
        anggaran: 0, 
        realisasi: 0, 
        nama_rek: rekening?.nama_rek || item.m_rekening?.nama_rek || 'Nama Rekening Tidak Ditemukan', 
        jenis_rek: rekening?.jenis_rek || 'LRA' 
      };
      existing.realisasi += item.total || 0;
      dataMap.set(item.kode_rek, existing);
    });

    // Proses data realisasi kas keluar
    realisasiData.kasKeluar?.data?.forEach((item: any) => {
      const rekening = rekeningMap.get(item.kode_rek);
      const existing = dataMap.get(item.kode_rek) || { 
        anggaran: 0, 
        realisasi: 0, 
        nama_rek: rekening?.nama_rek || item.m_rekening?.nama_rek || 'Nama Rekening Tidak Ditemukan', 
        jenis_rek: rekening?.jenis_rek || 'LRA' 
      };
      existing.realisasi += item.total || 0;
      dataMap.set(item.kode_rek, existing);
    });

    // Konversi ke array LRAData
    dataMap.forEach((value, key) => {
      const selisih = value.anggaran - value.realisasi;
      const persentase = value.anggaran > 0 ? (value.realisasi / value.anggaran) * 100 : 0;
      
      lraData.push({
        kode_rek: key,
        nama_rek: value.nama_rek,
        anggaran: value.anggaran,
        realisasi: value.realisasi,
        selisih: selisih,
        persentase: persentase,
        jenis_rek: value.jenis_rek
      });
    });
  }

  const totalAnggaran = lraData.reduce((sum, item) => sum + item.anggaran, 0);
  const totalRealisasi = lraData.reduce((sum, item) => sum + item.realisasi, 0);
  const totalSelisih = totalAnggaran - totalRealisasi;
  const totalPersentase = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  const isLoading = loadingAnggaran || loadingRealisasi;

  const handleExportExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [
        ['LAPORAN REALISASI ANGGARAN (LRA)'],
        ['RSUD H. Damanhuri Barabai'],
        [''],
        ['Periode:', dateRange?.from && dateRange?.to ? 
          `${format(dateRange.from, 'dd MMMM yyyy', { locale: id })} - ${format(dateRange.to, 'dd MMMM yyyy', { locale: id })}` : 
          'Semua Periode'],
        ['Tahun Anggaran:', currentYear],
        [''],
        ['RINGKASAN'],
        ['Total Anggaran:', `Rp ${totalAnggaran.toLocaleString('id-ID')}`],
        ['Total Realisasi:', `Rp ${totalRealisasi.toLocaleString('id-ID')}`],
        ['Selisih:', `Rp ${totalSelisih.toLocaleString('id-ID')}`],
        ['Persentase Realisasi:', `${totalPersentase.toFixed(2)}%`],
        [''],
        ['Tanggal Cetak:', new Date().toLocaleString('id-ID')]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

      // Detail sheet
      if (lraData.length > 0) {
        const detailData = lraData.map(item => ({
          'Kode Rekening': item.kode_rek,
          'Nama Rekening': item.nama_rek,
          'Anggaran': item.anggaran,
          'Realisasi': item.realisasi,
          'Selisih': item.selisih,
          'Persentase (%)': item.persentase.toFixed(2),
          'Jenis': item.jenis_rek
        }));
        
        const detailSheet = XLSX.utils.json_to_sheet(detailData);
        XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail LRA');
      }

      const fileName = `laporan-realisasi-anggaran-${currentYear}-${Date.now()}.xlsx`;
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

      const periodText = dateRange?.from && dateRange?.to ? 
        `${format(dateRange.from, 'dd MMMM yyyy', { locale: id })} - ${format(dateRange.to, 'dd MMMM yyyy', { locale: id })}` : 
        'Semua Periode';

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Realisasi Anggaran</title>
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
            .period {
              text-align: center;
              margin-bottom: 20px;
              font-weight: bold;
            }
            .summary { 
              margin-bottom: 30px; 
              page-break-inside: avoid;
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
            .positive { color: #10B981; font-weight: bold; }
            .negative { color: #EF4444; font-weight: bold; }
            @media print { 
              body { margin: 0; }
              .no-print { display: none; }
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
            <h1>LAPORAN REALISASI ANGGARAN (LRA)</h1>
            <h3>Tahun Anggaran ${currentYear}</h3>
          </div>
          
          <div class="period">
            Periode: ${periodText}
          </div>
          
          <div class="summary">
            <h3>Ringkasan</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span>Total Anggaran:</span>
                <span><strong>Rp ${totalAnggaran.toLocaleString('id-ID')}</strong></span>
              </div>
              <div class="summary-item">
                <span>Total Realisasi:</span>
                <span><strong>Rp ${totalRealisasi.toLocaleString('id-ID')}</strong></span>
              </div>
              <div class="summary-item">
                <span>Selisih:</span>
                <span class="${totalSelisih >= 0 ? 'positive' : 'negative'}">
                  <strong>Rp ${totalSelisih.toLocaleString('id-ID')}</strong>
                </span>
              </div>
              <div class="summary-item">
                <span>Persentase Realisasi:</span>
                <span><strong>${totalPersentase.toFixed(2)}%</strong></span>
              </div>
            </div>
          </div>

          <div>
            <h3>Detail Realisasi Anggaran</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Kode Rekening</th>
                  <th>Nama Rekening</th>
                  <th class="text-right">Anggaran</th>
                  <th class="text-right">Realisasi</th>
                  <th class="text-right">Selisih</th>
                  <th class="text-right">%</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${lraData.length === 0 ? 
                  '<tr><td colspan="7" class="text-center">Tidak ada data untuk periode yang dipilih</td></tr>' :
                  lraData.map(item => `
                    <tr>
                      <td>${item.kode_rek}</td>
                      <td>${item.nama_rek}</td>
                      <td class="text-right">Rp ${item.anggaran.toLocaleString('id-ID')}</td>
                      <td class="text-right">Rp ${item.realisasi.toLocaleString('id-ID')}</td>
                      <td class="text-right ${item.selisih >= 0 ? 'positive' : 'negative'}">
                        Rp ${item.selisih.toLocaleString('id-ID')}
                      </td>
                      <td class="text-right">${item.persentase.toFixed(2)}%</td>
                      <td class="text-center">
                        ${item.persentase >= 100 ? 
                          '<span style="color: #EF4444;">Over Budget</span>' : 
                          item.persentase >= 80 ? 
                            '<span style="color: #F59E0B;">Hampir Tercapai</span>' : 
                            '<span style="color: #10B981;">Normal</span>'
                        }
                      </td>
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

  return (
    <Layout title="Laporan Realisasi Anggaran">
      <div className="space-y-6">
        {/* Header with Filter and Export Buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Realisasi Anggaran (LRA)</h1>
            <p className="text-gray-600">Perbandingan anggaran dengan realisasi tahun {currentYear}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Filter Periode */}
            <div className="flex items-center gap-2">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                className="w-full sm:w-auto"
              />
            </div>
            
            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Anggaran</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                Rp {totalAnggaran.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Realisasi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rp {totalRealisasi.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selisih</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalSelisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rp {totalSelisih.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Persentase Realisasi</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalPersentase.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabel LRA */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Realisasi Anggaran</CardTitle>
            <CardDescription>
              {dateRange?.from && dateRange?.to && (
                <>Periode: {format(dateRange.from, 'dd MMMM yyyy', { locale: id })} - {format(dateRange.to, 'dd MMMM yyyy', { locale: id })}</>
              )}
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
                      <TableHead className="text-right">Anggaran</TableHead>
                      <TableHead className="text-right">Realisasi</TableHead>
                      <TableHead className="text-right">Selisih</TableHead>
                      <TableHead className="text-right">Persentase</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lraData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Tidak ada data untuk periode yang dipilih
                        </TableCell>
                      </TableRow>
                    ) : (
                      lraData.map((item, index) => (
                        <TableRow key={`lra-${item.kode_rek}-${index}`}>
                          <TableCell className="font-mono text-sm">
                            {item.kode_rek}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {item.nama_rek}
                          </TableCell>
                          <TableCell className="text-right">
                            Rp {item.anggaran.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="text-right">
                            Rp {item.realisasi.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${item.selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Rp {item.selisih.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.persentase.toFixed(2)}%
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                item.persentase >= 100 ? 'destructive' : 
                                item.persentase >= 80 ? 'default' : 
                                'secondary'
                              }
                            >
                              {item.persentase >= 100 ? 'Over Budget' : 
                               item.persentase >= 80 ? 'Hampir Tercapai' : 
                               'Normal'}
                            </Badge>
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
      </div>
    </Layout>
  );
}

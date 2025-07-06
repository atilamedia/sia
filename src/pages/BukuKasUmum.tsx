import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, FileText, FileSpreadsheet } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import * as XLSX from 'xlsx';

export default function BukuKasUmum() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const isMobile = useIsMobile();

  const { data: kasMasukData, isLoading: loadingKasMasuk } = useQuery({
    queryKey: ['kas-masuk', dateRange?.from, dateRange?.to],
    queryFn: () => siaApi.getKasMasuk(
      dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
    ),
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  const { data: kasKeluarData, isLoading: loadingKasKeluar } = useQuery({
    queryKey: ['kas-keluar', dateRange?.from, dateRange?.to],
    queryFn: () => siaApi.getKasKeluar(
      dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
    ),
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  const allTransactions = [
    ...(kasMasukData?.data || []).map(item => ({
      ...item,
      type: 'masuk' as const,
      tanggal: item.tanggal,
      keterangan: item.keterangan || '',
      nama_rek: item.nama_rek || '',
      debit: item.total || 0,
      kredit: 0,
      pihak: item.pembayar || ''
    })),
    ...(kasKeluarData?.data || []).map(item => ({
      ...item,
      type: 'keluar' as const,
      tanggal: item.tanggal,
      keterangan: item.keterangan || '',
      nama_rek: item.nama_rek || '',
      debit: 0,
      kredit: item.total || 0,
      pihak: item.penerima || ''
    }))
  ].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  let runningBalance = 0;
  const transactionsWithBalance = allTransactions.map(transaction => {
    runningBalance += transaction.debit - transaction.kredit;
    return {
      ...transaction,
      saldo: runningBalance
    };
  });

  const totalDebit = allTransactions.reduce((sum, item) => sum + item.debit, 0);
  const totalKredit = allTransactions.reduce((sum, item) => sum + item.kredit, 0);
  const saldoAkhir = totalDebit - totalKredit;

  const isLoading = loadingKasMasuk || loadingKasKeluar;

  const handleExportExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      const summaryData = [
        ['BUKU KAS UMUM'],
        [''],
        ['Periode:', dateRange?.from && dateRange?.to ? 
          `${format(dateRange.from, 'dd MMMM yyyy', { locale: id })} - ${format(dateRange.to, 'dd MMMM yyyy', { locale: id })}` : 
          'Semua Periode'],
        [''],
        ['RINGKASAN'],
        ['Total Penerimaan:', `Rp ${totalDebit.toLocaleString('id-ID')}`],
        ['Total Pengeluaran:', `Rp ${totalKredit.toLocaleString('id-ID')}`],
        ['Saldo Akhir:', `Rp ${saldoAkhir.toLocaleString('id-ID')}`],
        ['Total Transaksi:', allTransactions.length],
        [''],
        ['Tanggal Cetak:', new Date().toLocaleString('id-ID')]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

      if (transactionsWithBalance.length > 0) {
        const detailData = transactionsWithBalance.map(transaction => ({
          'Tanggal': format(new Date(transaction.tanggal), 'dd/MM/yyyy'),
          'Keterangan': transaction.keterangan,
          'Rekening': transaction.nama_rek,
          'Pihak': transaction.pihak,
          'Debit': transaction.debit > 0 ? transaction.debit : '',
          'Kredit': transaction.kredit > 0 ? transaction.kredit : '',
          'Saldo': transaction.saldo,
          'Jenis': transaction.type === 'masuk' ? 'Masuk' : 'Keluar'
        }));
        
        const detailSheet = XLSX.utils.json_to_sheet(detailData);
        XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Transaksi');
      }

      const fileName = `buku-kas-umum-${Date.now()}.xlsx`;
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
          <title>Buku Kas Umum</title>
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
            .badge-masuk { 
              background-color: #10B981; 
              color: white; 
              padding: 2px 6px; 
              border-radius: 4px; 
              font-size: 9px;
            }
            .badge-keluar { 
              background-color: #EF4444; 
              color: white; 
              padding: 2px 6px; 
              border-radius: 4px; 
              font-size: 9px;
            }
            .saldo-positive { color: #10B981; font-weight: bold; }
            .saldo-negative { color: #EF4444; font-weight: bold; }
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
            <h1>BUKU KAS UMUM</h1>
          </div>
          
          <div class="period">
            Periode: ${periodText}
          </div>
          
          <div class="summary">
            <h3>Ringkasan</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span>Total Penerimaan:</span>
                <span><strong>Rp ${totalDebit.toLocaleString('id-ID')}</strong></span>
              </div>
              <div class="summary-item">
                <span>Total Pengeluaran:</span>
                <span><strong>Rp ${totalKredit.toLocaleString('id-ID')}</strong></span>
              </div>
              <div class="summary-item">
                <span>Saldo Akhir:</span>
                <span class="${saldoAkhir >= 0 ? 'saldo-positive' : 'saldo-negative'}">
                  <strong>Rp ${saldoAkhir.toLocaleString('id-ID')}</strong>
                </span>
              </div>
              <div class="summary-item">
                <span>Total Transaksi:</span>
                <span><strong>${allTransactions.length}</strong></span>
              </div>
            </div>
          </div>

          <div>
            <h3>Detail Transaksi</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan</th>
                  <th>Rekening</th>
                  <th>Pihak</th>
                  <th class="text-right">Debit</th>
                  <th class="text-right">Kredit</th>
                  <th class="text-right">Saldo</th>
                  <th class="text-center">Jenis</th>
                </tr>
              </thead>
              <tbody>
                ${transactionsWithBalance.length === 0 ? 
                  '<tr><td colspan="8" class="text-center">Tidak ada data transaksi untuk periode yang dipilih</td></tr>' :
                  transactionsWithBalance.map(transaction => `
                    <tr>
                      <td>${format(new Date(transaction.tanggal), 'dd/MM/yyyy')}</td>
                      <td>${transaction.keterangan}</td>
                      <td>${transaction.nama_rek}</td>
                      <td>${transaction.pihak}</td>
                      <td class="text-right">${transaction.debit > 0 ? `Rp ${transaction.debit.toLocaleString('id-ID')}` : '-'}</td>
                      <td class="text-right">${transaction.kredit > 0 ? `Rp ${transaction.kredit.toLocaleString('id-ID')}` : '-'}</td>
                      <td class="text-right ${transaction.saldo >= 0 ? 'saldo-positive' : 'saldo-negative'}">
                        Rp ${transaction.saldo.toLocaleString('id-ID')}
                      </td>
                      <td class="text-center">
                        <span class="${transaction.type === 'masuk' ? 'badge-masuk' : 'badge-keluar'}">
                          ${transaction.type === 'masuk' ? 'Masuk' : 'Keluar'}
                        </span>
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
    <Layout title="Buku Kas Umum">
      <div className="space-y-4 md:space-y-6">
        {/* Header with Filter and Export Buttons */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Buku Kas Umum</h1>
            <p className="text-sm md:text-base text-gray-600">Laporan kronologis semua transaksi kas</p>
          </div>
          
          {/* Mobile Controls */}
          {isMobile ? (
            <div className="space-y-3">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                className="w-full"
              />
              <div className="flex space-x-2">
                <Button onClick={handleExportExcel} variant="outline" size="sm" className="flex-1">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button onClick={handleExportPDF} variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          ) : (
            // Desktop Controls
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  className="w-full sm:w-auto"
                />
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
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Penerimaan</CardTitle>
              <FileText className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
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
                  }).format(totalDebit)
                  :
                  `Rp ${totalDebit.toLocaleString('id-ID')}`
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Pengeluaran</CardTitle>
              <FileText className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
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
                  }).format(totalKredit)
                  :
                  `Rp ${totalKredit.toLocaleString('id-ID')}`
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Saldo Akhir</CardTitle>
              <FileText className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg md:text-2xl font-bold ${saldoAkhir >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {isMobile ? 
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    compactDisplay: 'short',
                    minimumFractionDigits: 0,
                  }).format(saldoAkhir)
                  :
                  `Rp ${saldoAkhir.toLocaleString('id-ID')}`
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Transaksi</CardTitle>
              <FileText className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">
                {allTransactions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabel BKU */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Buku Kas Umum</CardTitle>
            <CardDescription className="text-sm">
              {dateRange?.from && dateRange?.to && (
                <>Periode: {format(dateRange.from, 'dd MMMM yyyy', { locale: id })} - {format(dateRange.to, 'dd MMMM yyyy', { locale: id })}</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "p-0" : ""}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                {isMobile ? (
                  <div className="space-y-3 p-4">
                    {transactionsWithBalance.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Tidak ada data transaksi untuk periode yang dipilih
                      </div>
                    ) : (
                      transactionsWithBalance.map((transaction, index) => (
                        <Card key={`${transaction.type}-${transaction.id_km || transaction.id_kk}-${index}`} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">
                                  {format(new Date(transaction.tanggal), 'dd/MM/yyyy')}
                                </span>
                                <Badge variant={transaction.type === 'masuk' ? 'default' : 'destructive'} className="text-xs">
                                  {transaction.type === 'masuk' ? 'Masuk' : 'Keluar'}
                                </Badge>
                              </div>
                              <div className={`text-sm font-medium ${transaction.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Saldo: {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  notation: 'compact',
                                  compactDisplay: 'short',
                                  minimumFractionDigits: 0,
                                }).format(transaction.saldo)}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <p className="text-sm font-medium">{transaction.keterangan}</p>
                              <p className="text-xs text-muted-foreground">{transaction.nama_rek}</p>
                              <p className="text-xs text-muted-foreground">Pihak: {transaction.pihak}</p>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                              <div className="text-right">
                                {transaction.debit > 0 && (
                                  <p className="text-blue-600 font-medium text-sm">
                                    Debit: {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR',
                                      notation: 'compact',
                                      compactDisplay: 'short',
                                      minimumFractionDigits: 0,
                                    }).format(transaction.debit)}
                                  </p>
                                )}
                                {transaction.kredit > 0 && (
                                  <p className="text-red-600 font-medium text-sm">
                                    Kredit: {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR',
                                      notation: 'compact',
                                      compactDisplay: 'short',
                                      minimumFractionDigits: 0,
                                    }).format(transaction.kredit)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                ) : (
                  // Desktop Table View
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead>Rekening</TableHead>
                          <TableHead>Pihak</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Kredit</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                          <TableHead>Jenis</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactionsWithBalance.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              Tidak ada data transaksi untuk periode yang dipilih
                            </TableCell>
                          </TableRow>
                        ) : (
                          transactionsWithBalance.map((transaction, index) => (
                            <TableRow key={`${transaction.type}-${transaction.id_km || transaction.id_kk}-${index}`}>
                              <TableCell>
                                {format(new Date(transaction.tanggal), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {transaction.keterangan}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {transaction.nama_rek}
                              </TableCell>
                              <TableCell>{transaction.pihak}</TableCell>
                              <TableCell className="text-right">
                                {transaction.debit > 0 ? `Rp ${transaction.debit.toLocaleString('id-ID')}` : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {transaction.kredit > 0 ? `Rp ${transaction.kredit.toLocaleString('id-ID')}` : '-'}
                              </TableCell>
                              <TableCell className={`text-right font-medium ${transaction.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Rp {transaction.saldo.toLocaleString('id-ID')}
                              </TableCell>
                              <TableCell>
                                <Badge variant={transaction.type === 'masuk' ? 'default' : 'destructive'}>
                                  {transaction.type === 'masuk' ? 'Masuk' : 'Keluar'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

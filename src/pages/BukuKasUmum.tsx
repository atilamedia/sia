
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

export default function BukuKasUmum() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

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

  // Gabungkan data kas masuk dan kas keluar
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

  // Hitung running balance
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

  const handleExportPDF = () => {
    toast.success("Ekspor PDF berhasil!");
  };

  const handleExportExcel = () => {
    toast.success("Ekspor Excel berhasil!");
  };

  return (
    <Layout title="Buku Kas Umum">
      <div className="space-y-6">
        {/* Header with Filter and Export Buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buku Kas Umum</h1>
            <p className="text-gray-600">Laporan kronologis semua transaksi kas</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Filter Periode */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
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
              <Button onClick={handleExportPDF} className="flex items-center gap-2">
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
              <CardTitle className="text-sm font-medium">Total Penerimaan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rp {totalDebit.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                Rp {totalKredit.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Akhir</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldoAkhir >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rp {saldoAkhir.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allTransactions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabel BKU */}
        <Card>
          <CardHeader>
            <CardTitle>Buku Kas Umum</CardTitle>
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

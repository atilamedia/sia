
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateRangePicker } from "@/components/DateRangePicker";
import { siaApi } from "@/lib/sia-api";
import { Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BukuKasUmum() {
  const [kasMasukData, setKasMasukData] = useState<any[]>([]);
  const [kasKeluarData, setKasKeluarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{from: Date | undefined; to: Date | undefined}>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const { toast } = useToast();

  const loadBKUData = async () => {
    setLoading(true);
    try {
      const startDate = dateRange.from?.toISOString().split('T')[0];
      const endDate = dateRange.to?.toISOString().split('T')[0];

      const [kasMasukResponse, kasKeluarResponse] = await Promise.all([
        siaApi.getKasMasuk(startDate, endDate),
        siaApi.getKasKeluar(startDate, endDate)
      ]);

      setKasMasukData(kasMasukResponse.data || []);
      setKasKeluarData(kasKeluarResponse.data || []);
    } catch (error) {
      console.error('Error loading BKU data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data Buku Kas Umum",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBKUData();
  }, []);

  const handleFilter = () => {
    loadBKUData();
  };

  const totalKasMasuk = kasMasukData.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalKasKeluar = kasKeluarData.reduce((sum, item) => sum + (item.total || 0), 0);
  const saldoAkhir = totalKasMasuk - totalKasKeluar;

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Buku Kas Umum (BKU)</h1>
            <p className="text-muted-foreground">
              Laporan penerimaan dan pengeluaran kas
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Periode</CardTitle>
            <CardDescription>
              Pilih rentang tanggal untuk menampilkan data BKU
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label>Periode</Label>
                <DateRangePicker
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
              <Button onClick={handleFilter} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "Filter"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Kas Masuk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rp {totalKasMasuk.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Kas Keluar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                Rp {totalKasKeluar.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldoAkhir >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rp {saldoAkhir.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detail Transaksi Kas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Kode Akun</TableHead>
                  <TableHead>Nama Akun</TableHead>
                  <TableHead className="text-right">Kas Masuk</TableHead>
                  <TableHead className="text-right">Kas Keluar</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Kas Masuk */}
                {kasMasukData.map((item, index) => (
                  <TableRow key={`km-${index}`}>
                    <TableCell>{item.tanggal}</TableCell>
                    <TableCell>{item.keterangan}</TableCell>
                    <TableCell>{item.kode_rek}</TableCell>
                    <TableCell>{item.m_rekening?.nama_rek || '-'}</TableCell>
                    <TableCell className="text-right text-green-600">
                      Rp {item.total?.toLocaleString('id-ID') || '0'}
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                ))}
                
                {/* Kas Keluar */}
                {kasKeluarData.map((item, index) => (
                  <TableRow key={`kk-${index}`}>
                    <TableCell>{item.tanggal}</TableCell>
                    <TableCell>{item.keterangan}</TableCell>
                    <TableCell>{item.kode_rek}</TableCell>
                    <TableCell>{item.m_rekening?.nama_rek || '-'}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right text-red-600">
                      Rp {item.total?.toLocaleString('id-ID') || '0'}
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                ))}

                {(kasMasukData.length === 0 && kasKeluarData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada data untuk periode yang dipilih
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

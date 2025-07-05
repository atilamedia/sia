import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateRangePicker } from "@/components/DateRangePicker";
import { siaApi } from "@/lib/sia-api";
import { Download, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LaporanRealisasiAnggaran() {
  const [lraData, setLraData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [dateRange, setDateRange] = useState<{from: Date | undefined; to: Date | undefined}>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(new Date().getFullYear(), 11, 31)
  });
  const { toast } = useToast();

  const loadLRAData = async () => {
    setLoading(true);
    try {
      const startDate = dateRange.from?.toISOString().split('T')[0];
      const endDate = dateRange.to?.toISOString().split('T')[0];

      // Get jurnal data for LRA calculation
      const jurnalResponse = await siaApi.getJurnal(startDate, endDate);
      const jurnalData = jurnalResponse.data || [];

      // Get master rekening for account names
      const rekeningResponse = await siaApi.getMasterRekening();
      const rekeningData = rekeningResponse.data || [];

      // Process data to create LRA report
      const lraMap = new Map();
      
      jurnalData.forEach((jurnal: any) => {
        jurnal.jurnal?.forEach((entry: any) => {
          const rekening = rekeningData.find(r => r.kode_rek === entry.kode_rek);
          if (rekening && rekening.jenis_rek === 'LRA') {
            const key = entry.kode_rek;
            if (!lraMap.has(key)) {
              lraMap.set(key, {
                kode_rek: entry.kode_rek,
                nama_rek: rekening.nama_rek,
                anggaran: 0, // This would need to come from anggaran table
                realisasi_debit: 0,
                realisasi_kredit: 0,
                selisih: 0,
                persentase: 0
              });
            }
            
            const item = lraMap.get(key);
            item.realisasi_debit += entry.debit || 0;
            item.realisasi_kredit += entry.kredit || 0;
          }
        });
      });

      // Calculate selisih and percentage
      const processedData = Array.from(lraMap.values()).map(item => {
        const realisasi = item.realisasi_debit - item.realisasi_kredit;
        return {
          ...item,
          realisasi,
          selisih: item.anggaran - realisasi,
          persentase: item.anggaran > 0 ? (realisasi / item.anggaran) * 100 : 0
        };
      });

      setLraData(processedData);
    } catch (error) {
      console.error('Error loading LRA data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data Laporan Realisasi Anggaran",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLRAData();
  }, []);

  const handleFilter = () => {
    loadLRAData();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const totalAnggaran = lraData.reduce((sum, item) => sum + (item.anggaran || 0), 0);
  const totalRealisasi = lraData.reduce((sum, item) => sum + (item.realisasi || 0), 0);
  const totalSelisih = totalAnggaran - totalRealisasi;
  const overallPercentage = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Laporan Realisasi Anggaran (LRA)</h1>
            <p className="text-muted-foreground">
              Perbandingan anggaran dengan realisasi pendapatan dan belanja
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
            <CardDescription>
              Pilih tahun dan periode untuk menampilkan data LRA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>Tahun</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Anggaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                Rp {totalAnggaran.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Realisasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rp {totalRealisasi.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Selisih</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalSelisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rp {totalSelisih.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Persentase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`text-2xl font-bold ${overallPercentage >= 100 ? 'text-red-600' : 'text-green-600'}`}>
                  {overallPercentage.toFixed(1)}%
                </div>
                {overallPercentage >= 100 ? (
                  <TrendingUp className="h-4 w-4 text-red-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detail Realisasi Anggaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Akun</TableHead>
                  <TableHead>Nama Akun</TableHead>
                  <TableHead className="text-right">Anggaran</TableHead>
                  <TableHead className="text-right">Realisasi</TableHead>
                  <TableHead className="text-right">Selisih</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lraData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{item.kode_rek}</TableCell>
                    <TableCell>{item.nama_rek}</TableCell>
                    <TableCell className="text-right">
                      Rp {item.anggaran?.toLocaleString('id-ID') || '0'}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {item.realisasi?.toLocaleString('id-ID') || '0'}
                    </TableCell>
                    <TableCell className={`text-right ${item.selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Rp {item.selisih?.toLocaleString('id-ID') || '0'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.persentase?.toFixed(1) || '0.0'}%
                    </TableCell>
                    <TableCell className="text-center">
                      {item.persentase >= 100 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          Over Budget
                        </span>
                      ) : item.persentase >= 80 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          On Track
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {lraData.length === 0 && (
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

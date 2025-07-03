
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Download, FileText, BarChart3, TrendingUp, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Reports = () => {
  // Set default date range to current month
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: firstDay, to: lastDay };
  });

  const { data: saldoData, isLoading: loadingSaldo } = useQuery({
    queryKey: ['laporan-saldo'],
    queryFn: () => siaApi.getLaporan('saldo-rekening'),
  });

  // Modified query to always fetch data for better UX
  const { data: kasHarianData, isLoading: loadingKasHarian, error: kasHarianError } = useQuery({
    queryKey: ['laporan-kas-harian', date?.from, date?.to],
    queryFn: () => siaApi.getLaporan(
      'kas-harian',
      date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
    ),
    enabled: true, // Always enabled to show loading state
  });

  const { data: kasMasukData } = useQuery({
    queryKey: ['kas-masuk-report'],
    queryFn: () => siaApi.getKasMasuk(),
  });

  const { data: kasKeluarData } = useQuery({
    queryKey: ['kas-keluar-report'],
    queryFn: () => siaApi.getKasKeluar(),
  });

  const { data: jurnalData } = useQuery({
    queryKey: ['jurnal-report'],
    queryFn: () => siaApi.getJurnal(),
  });

  // Calculate summary data
  const totalKasMasuk = kasMasukData?.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const totalKasKeluar = kasKeluarData?.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const totalJurnal = jurnalData?.data?.length || 0;
  const totalRekening = saldoData?.data?.length || 0;

  // Prepare chart data
  const rekeningChartData = saldoData?.data?.slice(0, 10).map(item => ({
    name: item.nama_rek?.substring(0, 20) + (item.nama_rek?.length > 20 ? '...' : ''),
    saldo: Math.abs(item.saldo || 0),
    jenis: item.jenis_rek
  })) || [];

  const pieChartData = [
    { name: 'Kas Masuk', value: totalKasMasuk, color: '#10B981' },
    { name: 'Kas Keluar', value: totalKasKeluar, color: '#EF4444' }
  ];

  const exportSaldoRekening = () => {
    const csvContent = [
      ['Kode Rekening', 'Nama Rekening', 'Saldo', 'Jenis'],
      ...(saldoData?.data?.map(item => [
        item.kode_rek,
        item.nama_rek,
        item.saldo,
        item.jenis_rek
      ]) || [])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saldo-rekening-${Date.now()}.csv`;
    a.click();
  };

  const exportKasHarian = () => {
    const csvContent = [
      ['Tanggal', 'Kas Masuk', 'Kas Keluar', 'Selisih'],
      ...(kasHarianData?.data?.map(item => [
        item.tanggal,
        item.kas_masuk,
        item.kas_keluar,
        item.selisih
      ]) || [])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kas-harian-${Date.now()}.csv`;
    a.click();
  };

  return (
    <Layout title="Laporan">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
          <DateRangePicker 
            dateRange={date} 
            onDateRangeChange={setDate}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rekening</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRekening}</div>
              <p className="text-xs text-muted-foreground">
                Akun aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kas Masuk</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(totalKasMasuk)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total penerimaan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kas Keluar</CardTitle>
              <BarChart3 className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(totalKasKeluar)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total pengeluaran
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jurnal Entries</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJurnal}</div>
              <p className="text-xs text-muted-foreground">
                Total entries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="saldo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="saldo">Saldo Rekening</TabsTrigger>
            <TabsTrigger value="kas-harian">Kas Harian</TabsTrigger>
            <TabsTrigger value="chart">Grafik</TabsTrigger>
          </TabsList>

          <TabsContent value="saldo">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Laporan Saldo Rekening</CardTitle>
                  <Button onClick={exportSaldoRekening} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Kode Rekening</th>
                        <th className="text-left p-2">Nama Rekening</th>
                        <th className="text-center p-2">Jenis</th>
                        <th className="text-right p-2">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingSaldo ? (
                        <tr>
                          <td colSpan={4} className="text-center p-4">Loading...</td>
                        </tr>
                      ) : saldoData?.data?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center p-4">Tidak ada data</td>
                        </tr>
                      ) : (
                        saldoData?.data?.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{item.kode_rek}</td>
                            <td className="p-2">{item.nama_rek}</td>
                            <td className="p-2 text-center">
                              <span className={`px-2 py-1 rounded text-xs ${
                                item.jenis_rek === 'NERACA' ? 'bg-blue-100 text-blue-700' :
                                item.jenis_rek === 'LRA' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {item.jenis_rek}
                              </span>
                            </td>
                            <td className="p-2 text-right font-medium">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(item.saldo || 0)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kas-harian">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Laporan Kas Harian</CardTitle>
                  <div className="flex gap-2">
                    {date?.from && date?.to && (
                      <div className="text-sm text-muted-foreground">
                        {format(date.from, 'dd MMM yyyy')} - {format(date.to, 'dd MMM yyyy')}
                      </div>
                    )}
                    <Button onClick={exportKasHarian} variant="outline" disabled={!kasHarianData?.data?.length}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingKasHarian ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Memuat data kas harian...</p>
                    </div>
                  </div>
                ) : kasHarianError ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Terjadi kesalahan saat memuat data kas harian</p>
                    <p className="text-sm mt-2">Coba pilih rentang tanggal yang berbeda</p>
                  </div>
                ) : !date?.from || !date?.to ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Pilih rentang tanggal untuk melihat laporan kas harian</p>
                  </div>
                ) : kasHarianData?.data?.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Tidak ada data kas untuk periode ini</p>
                    <p className="text-sm mt-2">
                      {format(date.from, 'dd MMM yyyy')} - {format(date.to, 'dd MMM yyyy')}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Tanggal</th>
                          <th className="text-right p-2">Kas Masuk</th>
                          <th className="text-right p-2">Kas Keluar</th>
                          <th className="text-right p-2">Selisih</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kasHarianData?.data?.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">
                              {format(new Date(item.tanggal), 'dd MMM yyyy')}
                            </td>
                            <td className="p-2 text-right font-medium text-green-600">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(item.kas_masuk || 0)}
                            </td>
                            <td className="p-2 text-right font-medium text-red-600">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(item.kas_keluar || 0)}
                            </td>
                            <td className={`p-2 text-right font-medium ${
                              (item.selisih || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(item.selisih || 0)}
                            </td>
                          </tr>
                        ))}
                        {kasHarianData?.data?.length > 0 && (
                          <tr className="border-t-2 font-bold bg-gray-50">
                            <td className="p-2">Total</td>
                            <td className="p-2 text-right text-green-600">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(kasHarianData.data.reduce((sum, item) => sum + (item.kas_masuk || 0), 0))}
                            </td>
                            <td className="p-2 text-right text-red-600">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(kasHarianData.data.reduce((sum, item) => sum + (item.kas_keluar || 0), 0))}
                            </td>
                            <td className={`p-2 text-right ${
                              kasHarianData.data.reduce((sum, item) => sum + (item.selisih || 0), 0) >= 0 
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(kasHarianData.data.reduce((sum, item) => sum + (item.selisih || 0), 0))}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Saldo Rekening</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rekeningChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis 
                          tickFormatter={(value) => `${(value/1000000).toFixed(1)}jt`}
                        />
                        <Tooltip 
                          formatter={(value: number) => new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(value)}
                        />
                        <Bar dataKey="saldo" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Perbandingan Kas Masuk vs Keluar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => 
                            `${name}: ${new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(value)}`
                          }
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;

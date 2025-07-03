
import { Layout } from "@/components/layout/Layout";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { DollarSign, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  // Fetch data untuk dashboard
  const { data: kasMasukData } = useQuery({
    queryKey: ['kas-masuk-dashboard'],
    queryFn: () => siaApi.getKasMasuk(),
  });

  const { data: kasKeluarData } = useQuery({
    queryKey: ['kas-keluar-dashboard'],
    queryFn: () => siaApi.getKasKeluar(),
  });

  const { data: jurnalData } = useQuery({
    queryKey: ['jurnal-dashboard'],
    queryFn: () => siaApi.getJurnal(),
  });

  const { data: accountsData } = useQuery({
    queryKey: ['accounts-dashboard'],
    queryFn: () => siaApi.getMasterRekening(),
  });

  // Calculate totals
  const totalKasMasuk = kasMasukData?.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const totalKasKeluar = kasKeluarData?.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const totalKas = totalKasMasuk - totalKasKeluar;
  const totalJurnalEntries = jurnalData?.data?.length || 0;

  // Chart data
  const cashFlowData = [
    { name: "Jan", masuk: totalKasMasuk * 0.15, keluar: totalKasKeluar * 0.12 },
    { name: "Feb", masuk: totalKasMasuk * 0.18, keluar: totalKasKeluar * 0.15 },
    { name: "Mar", masuk: totalKasMasuk * 0.16, keluar: totalKasKeluar * 0.18 },
    { name: "Apr", masuk: totalKasMasuk * 0.14, keluar: totalKasKeluar * 0.16 },
    { name: "Mei", masuk: totalKasMasuk * 0.20, keluar: totalKasKeluar * 0.19 },
    { name: "Jun", masuk: totalKasMasuk * 0.17, keluar: totalKasKeluar * 0.20 },
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(totalKas)}
              </div>
              <p className="text-xs text-muted-foreground">
                Saldo kas terkini
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
                Total kas masuk
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kas Keluar</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
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
                Total kas keluar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jurnal Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJurnalEntries}</div>
              <p className="text-xs text-muted-foreground">
                Total entries
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Trend Arus Kas</h3>
              <div className="text-xs flex items-center space-x-3">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-primary rounded-full mr-1"></span>
                  <span>Kas Masuk</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-destructive rounded-full mr-1"></span>
                  <span>Kas Keluar</span>
                </div>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${(value/1000000).toFixed(1)}jt`}
                  />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="masuk"
                    name="Kas Masuk"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="keluar"
                    name="Kas Keluar"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Perbandingan Kas Masuk & Keluar</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${(value/1000000).toFixed(1)}jt`}
                  />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(value)}
                  />
                  <Bar 
                    dataKey="masuk" 
                    name="Kas Masuk" 
                    fill="rgba(var(--primary), 0.8)" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="keluar" 
                    name="Kas Keluar" 
                    fill="rgba(var(--destructive), 0.8)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        <RecentTransactions />
      </div>
    </Layout>
  );
};

export default Index;


import { Layout } from "@/components/layout/Layout";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { DollarSign, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

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

  // Process real data for charts
  const cashFlowData = useMemo(() => {
    if (!kasMasukData?.data || !kasKeluarData?.data) return [];

    // Group data by month
    const monthlyData = {};
    
    // Process kas masuk data
    kasMasukData.data.forEach(item => {
      if (item.tanggal) {
        const month = new Date(item.tanggal).toLocaleString('id-ID', { month: 'short' });
        if (!monthlyData[month]) {
          monthlyData[month] = { name: month, masuk: 0, keluar: 0 };
        }
        monthlyData[month].masuk += item.total || 0;
      }
    });

    // Process kas keluar data
    kasKeluarData.data.forEach(item => {
      if (item.tanggal) {
        const month = new Date(item.tanggal).toLocaleString('id-ID', { month: 'short' });
        if (!monthlyData[month]) {
          monthlyData[month] = { name: month, masuk: 0, keluar: 0 };
        }
        monthlyData[month].keluar += item.total || 0;
      }
    });

    // Convert to array and sort by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return months.map(month => monthlyData[month] || { name: month, masuk: 0, keluar: 0 });
  }, [kasMasukData, kasKeluarData]);

  return (
    <Layout title="Dashboard">
      <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in">
        {/* Info Cards - Mobile optimized grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Kas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  notation: 'compact',
                  compactDisplay: 'short'
                }).format(totalKas)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Saldo kas terkini
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kas Masuk</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  notation: 'compact',
                  compactDisplay: 'short'
                }).format(totalKasMasuk)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total kas masuk
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kas Keluar</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  notation: 'compact',
                  compactDisplay: 'short'
                }).format(totalKasKeluar)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total kas keluar
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jurnal Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{totalJurnalEntries}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total entries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Mobile optimized layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="p-3 md:p-4 lg:p-6 overflow-hidden shadow-sm">
            <div className="flex flex-col gap-2 mb-4">
              <h3 className="text-base md:text-lg font-medium">Trend Arus Kas</h3>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Kas Masuk</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-destructive rounded-full"></span>
                  <span>Kas Keluar</span>
                </div>
              </div>
            </div>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={10}
                    tickLine={false} 
                    axisLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={10}
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
                    width={40}
                  />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(value)}
                    labelStyle={{ fontSize: '12px' }}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="masuk"
                    name="Kas Masuk"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="keluar"
                    name="Kas Keluar"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="p-3 md:p-4 lg:p-6 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-medium">Perbandingan Kas</h3>
            </div>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={10}
                    tickLine={false} 
                    axisLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={10}
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
                    width={40}
                  />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(value)}
                    labelStyle={{ fontSize: '12px' }}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Bar 
                    dataKey="masuk" 
                    name="Kas Masuk" 
                    fill="#10b981" 
                    radius={[2, 2, 0, 0]} 
                  />
                  <Bar 
                    dataKey="keluar" 
                    name="Kas Keluar" 
                    fill="#ef4444" 
                    radius={[2, 2, 0, 0]}
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

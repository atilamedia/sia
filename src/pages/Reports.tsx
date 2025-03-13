import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area, Tooltip } from "recharts";
import { Download, ArrowUp, ArrowDown, Wallet, Filter, FileText, Building, Landmark, Banknote, Coins, Database, ShieldCheck, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const monthlyData = [
  { name: "Jan", income: 2400, expense: 1398 },
  { name: "Feb", income: 1398, expense: 3800 },
  { name: "Mar", income: 9800, expense: 2908 },
  { name: "Apr", income: 3908, expense: 4800 },
  { name: "May", income: 4800, expense: 3800 },
  { name: "Jun", income: 3800, expense: 4300 },
  { name: "Jul", income: 4300, expense: 2400 },
];

const categoryData = [
  { name: "Pendapatan", value: 25000, color: "#4f46e5" },
  { name: "Pengeluaran", value: 18000, color: "#ef4444" },
  { name: "Aset", value: 35000, color: "#10b981" },
  { name: "Utang", value: 8000, color: "#f59e0b" },
];

const incomeCategories = [
  { name: "Penjualan Produk", value: 14500000, color: "#4f46e5" },
  { name: "Jasa Konsultasi", value: 7200000, color: "#8b5cf6" },
  { name: "Pendapatan Bunga", value: 1800000, color: "#a78bfa" },
  { name: "Investasi", value: 1500000, color: "#c4b5fd" },
];

const expenseCategories = [
  { name: "Beban Gaji", value: 8500000, color: "#ef4444" },
  { name: "Peralatan Kantor", value: 3200000, color: "#f87171" },
  { name: "Utilitas", value: 2700000, color: "#fca5a5" },
  { name: "Sewa", value: 3600000, color: "#fecaca" },
];

const quarterlyData = [
  { name: "Q1", income: 12000000, expense: 8000000 },
  { name: "Q2", income: 15000000, expense: 11000000 },
  { name: "Q3", income: 18000000, expense: 13000000 },
  { name: "Q4", income: 25000000, expense: 16000000 },
];

const topTransactions = [
  { id: 1, date: "15 Mei 2023", description: "Penjualan Produk A", category: "Pendapatan", amount: 5000000, type: "income" },
  { id: 2, date: "18 Mei 2023", description: "Pembayaran Gaji", category: "Beban", amount: 8500000, type: "expense" },
  { id: 3, date: "22 Mei 2023", description: "Jasa Konsultasi", category: "Pendapatan", amount: 3500000, type: "income" },
  { id: 4, date: "25 Mei 2023", description: "Sewa Kantor", category: "Beban", amount: 3600000, type: "expense" },
  { id: 5, date: "28 Mei 2023", description: "Penjualan Produk B", category: "Pendapatan", amount: 4200000, type: "income" },
];

// Balance Sheet Data
const assetCategories = [
  { name: "Kas & Setara Kas", value: 12500000, percentage: 25, color: "#4f46e5" },
  { name: "Piutang Usaha", value: 8700000, percentage: 17.4, color: "#8b5cf6" },
  { name: "Persediaan", value: 15300000, percentage: 30.6, color: "#a78bfa" },
  { name: "Investasi", value: 9500000, percentage: 19, color: "#c4b5fd" },
  { name: "Aset Tetap", value: 4000000, percentage: 8, color: "#818cf8" },
];

const liabilityCategories = [
  { name: "Utang Usaha", value: 6300000, percentage: 52.5, color: "#ef4444" },
  { name: "Utang Bank", value: 3500000, percentage: 29.2, color: "#f87171" },
  { name: "Utang Pajak", value: 1200000, percentage: 10, color: "#fca5a5" },
  { name: "Liabilitas Lainnya", value: 1000000, percentage: 8.3, color: "#fecaca" },
];

const equityCategories = [
  { name: "Modal Disetor", value: 25000000, percentage: 64.1, color: "#10b981" },
  { name: "Laba Ditahan", value: 14000000, percentage: 35.9, color: "#34d399" },
];

const balanceSheetSummary = {
  totalAssets: 50000000,
  totalLiabilities: 12000000,
  totalEquity: 38000000,
  currentRatio: 3.04,
  debtToEquityRatio: 0.32,
  quickRatio: 1.76
};

const balanceSheetTrend = [
  { month: "Jan", assets: 43000000, liabilities: 10500000, equity: 32500000 },
  { month: "Feb", assets: 44500000, liabilities: 11200000, equity: 33300000 },
  { month: "Mar", assets: 46000000, liabilities: 11800000, equity: 34200000 },
  { month: "Apr", assets: 47500000, liabilities: 12500000, equity: 35000000 },
  { month: "May", assets: 50000000, liabilities: 12000000, equity: 38000000 },
];

const Reports = () => {
  return (
    <Layout title="Laporan">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Unduh Laporan
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
          <TabsTrigger value="income-expense">Pendapatan & Pengeluaran</TabsTrigger>
          <TabsTrigger value="balance">Neraca</TabsTrigger>
          <TabsTrigger value="cash-flow">Arus Kas</TabsTrigger>
        </TabsList>

      <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pendapatan vs Pengeluaran</CardTitle>
                <CardDescription>
                  Perbandingan bulanan pendapatan dan pengeluaran
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-[300px]"
                  config={{
                    income: { label: "Pendapatan", color: "#4f46e5" },
                    expense: { label: "Pengeluaran", color: "#ef4444" },
                  }}
                >
                  <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <ChartTooltipContent
                              className="bg-white shadow-lg border rounded-lg p-2"
                              indicator="dot"
                              payload={payload}
                              label={label}
                            />
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="income" name="Pendapatan" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Kategori</CardTitle>
                <CardDescription>
                  Distribusi anggaran berdasarkan kategori
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Keuangan</CardTitle>
              <CardDescription>
                Ringkasan keuangan untuk periode saat ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="rounded-lg bg-indigo-50 p-4">
                  <p className="text-sm font-medium text-indigo-500">Total Pendapatan</p>
                  <p className="mt-2 text-3xl font-bold">Rp25.000.000</p>
                  <p className="mt-1 text-xs text-indigo-700">+15% dari bulan lalu</p>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-500">Total Pengeluaran</p>
                  <p className="mt-2 text-3xl font-bold">Rp18.000.000</p>
                  <p className="mt-1 text-xs text-red-700">-5% dari bulan lalu</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-500">Total Aset</p>
                  <p className="mt-2 text-3xl font-bold">Rp35.000.000</p>
                  <p className="mt-1 text-xs text-green-700">+8% dari bulan lalu</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-500">Total Utang</p>
                  <p className="mt-2 text-3xl font-bold">Rp8.000.000</p>
                  <p className="mt-1 text-xs text-amber-700">-2% dari bulan lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      <TabsContent value="income-expense" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Pendapatan & Pengeluaran</h2>
            <div className="flex items-center gap-2">
              <Select defaultValue="monthly">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="quarterly">Kuartal</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rasio Pendapatan & Pengeluaran</CardTitle>
                <CardDescription>
                  Perbandingan antara pendapatan dan pengeluaran
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col p-4 rounded-lg bg-indigo-50">
                      <div className="flex items-center gap-2">
                        <ArrowUp className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-600">Total Pendapatan</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold">Rp25.000.000</p>
                      <Badge className="mt-2 self-start bg-indigo-100 text-indigo-800 hover:bg-indigo-100">+15%</Badge>
                    </div>
                    <div className="flex flex-col p-4 rounded-lg bg-red-50">
                      <div className="flex items-center gap-2">
                        <ArrowDown className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Total Pengeluaran</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold">Rp18.000.000</p>
                      <Badge className="mt-2 self-start bg-red-100 text-red-800 hover:bg-red-100">-5%</Badge>
                    </div>
                  </div>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={quarterlyData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                          labelFormatter={(label) => `Kuartal ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="income"
                          name="Pendapatan"
                          stroke="#4f46e5"
                          fillOpacity={1}
                          fill="url(#colorIncome)"
                        />
                        <Area
                          type="monotone"
                          dataKey="expense"
                          name="Pengeluaran"
                          stroke="#ef4444"
                          fillOpacity={1}
                          fill="url(#colorExpense)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Laba Bersih</CardTitle>
                <CardDescription>
                  Tren laba bersih (pendapatan - pengeluaran)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50">
                    <Wallet className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-600">Laba Bersih</p>
                      <p className="text-2xl font-bold">Rp7.000.000</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+25%</Badge>
                  </div>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            formatCurrency(Number(value)),
                            name === "value" ? "Laba Bersih" : name,
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey={(data) => data.income - data.expense}
                          name="Laba Bersih"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Detail Pendapatan</CardTitle>
                <CardDescription>
                  Rincian pendapatan berdasarkan kategori
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {incomeCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detail Pengeluaran</CardTitle>
                <CardDescription>
                  Rincian pengeluaran berdasarkan kategori
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaksi Utama</CardTitle>
              <CardDescription>
                Daftar transaksi dengan nilai terbesar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge className={transaction.type === 'income' 
                          ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100' 
                          : 'bg-red-100 text-red-800 hover:bg-red-100'}>
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right ${transaction.type === 'income' ? 'text-indigo-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

      <TabsContent value="balance" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Neraca Keuangan</h2>
          <div className="flex items-center gap-2">
            <Select defaultValue="may23">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jan23">Januari 2023</SelectItem>
                <SelectItem value="feb23">Februari 2023</SelectItem>
                <SelectItem value="mar23">Maret 2023</SelectItem>
                <SelectItem value="apr23">April 2023</SelectItem>
                <SelectItem value="may23">Mei 2023</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Unduh Neraca
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-indigo-50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-lg text-indigo-800">Total Aset</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-indigo-900">{formatCurrency(balanceSheetSummary.totalAssets)}</p>
              <p className="text-sm text-indigo-700 mt-1">Meningkat 5.3% dari bulan sebelumnya</p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                <CardTitle className="text-lg text-red-800">Total Liabilitas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-900">{formatCurrency(balanceSheetSummary.totalLiabilities)}</p>
              <p className="text-sm text-red-700 mt-1">Menurun 4% dari bulan sebelumnya</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg text-green-800">Total Ekuitas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(balanceSheetSummary.totalEquity)}</p>
              <p className="text-sm text-green-700 mt-1">Meningkat 8.6% dari bulan sebelumnya</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tren Neraca Keuangan</CardTitle>
              <CardDescription>
                Perbandingan aset, liabilitas dan ekuitas dalam 5 bulan terakhir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={balanceSheetTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="assets" name="Aset" stackId="a" fill="#4f46e5" />
                    <Bar dataKey="liabilities" name="Liabilitas" stackId="b" fill="#ef4444" />
                    <Bar dataKey="equity" name="Ekuitas" stackId="c" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rasio Keuangan</CardTitle>
              <CardDescription>
                Indikator kinerja keuangan perusahaan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-indigo-50 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-indigo-600" />
                      <p className="text-sm font-medium text-indigo-600">Current Ratio</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-indigo-900">{balanceSheetSummary.currentRatio.toFixed(2)}</p>
                    <p className="text-xs text-indigo-700 mt-1">
                      {balanceSheetSummary.currentRatio > 2 ? 'Sangat Baik' : balanceSheetSummary.currentRatio > 1 ? 'Baik' : 'Perlu Perhatian'}
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-amber-50 p-4">
                    <div className="flex items-center gap-2">
                      <List className="h-5 w-5 text-amber-600" />
                      <p className="text-sm font-medium text-amber-600">Debt to Equity Ratio</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-amber-900">{balanceSheetSummary.debtToEquityRatio.toFixed(2)}</p>
                    <p className="text-xs text-amber-700 mt-1">
                      {balanceSheetSummary.debtToEquityRatio < 0.5 ? 'Sangat Baik' : balanceSheetSummary.debtToEquityRatio < 1 ? 'Baik' : 'Perlu Perhatian'}
                    </p>
                  </div>
                </div>
                
                <div className="rounded-lg bg-cyan-50 p-4">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-cyan-600" />
                    <p className="text-sm font-medium text-cyan-600">Quick Ratio</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-cyan-900">{balanceSheetSummary.quickRatio.toFixed(2)}</p>
                  <div className="mt-2 w-full bg-cyan-200 rounded-full h-2.5">
                    <div className="bg-cyan-600 h-2.5 rounded-full" style={{ width: `${Math.min(balanceSheetSummary.quickRatio * 50, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-cyan-700 mt-1">
                    {balanceSheetSummary.quickRatio > 1.5 ? 'Sangat Baik' : balanceSheetSummary.quickRatio > 1 ? 'Baik' : 'Perlu Perhatian'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Komposisi Aset</CardTitle>
              <CardDescription>
                Distribusi aset perusahaan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {assetCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number

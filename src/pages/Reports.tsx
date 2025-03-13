
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { formatCurrency, cn } from "@/lib/utils";
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Wallet, 
  ArrowRight, 
  Percent, 
  TrendingUp,
  TrendingDown,
  BarChart2,
  WalletIcon,
  ArrowDownLeft,
  ArrowUpLeft,
  ClipboardList
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function Reports() {
  const [period, setPeriod] = useState("this-month");
  const [periodCashFlow, setPeriodCashFlow] = useState("this-month");
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD", "#5DADE2", "#48C9B0", "#F4D03F"];
  
  // Mock data - in a real application, this would come from an API
  const incomeVsExpense = [
    { name: "Jan", income: 35000000, expense: 28000000 },
    { name: "Feb", income: 42000000, expense: 30000000 },
    { name: "Mar", income: 38000000, expense: 29000000 },
    { name: "Apr", income: 45000000, expense: 32000000 },
    { name: "May", income: 40000000, expense: 35000000 },
    { name: "Jun", income: 50000000, expense: 33000000 },
    { name: "Jul", income: 55000000, expense: 34000000 },
    { name: "Aug", income: 48000000, expense: 32000000 }
  ];
  
  const netProfitTrend = [
    { name: "Jan", value: 7000000 },
    { name: "Feb", value: 12000000 },
    { name: "Mar", value: 9000000 },
    { name: "Apr", value: 13000000 },
    { name: "May", value: 5000000 },
    { name: "Jun", value: 17000000 },
    { name: "Jul", value: 21000000 },
    { name: "Aug", value: 16000000 }
  ];
  
  const incomeBreakdown = [
    { name: "Penjualan Barang", value: 220000000 },
    { name: "Layanan", value: 180000000 },
    { name: "Pendapatan Lain", value: 50000000 }
  ];
  
  const expenseBreakdown = [
    { name: "Operasional", value: 120000000 },
    { name: "Gaji", value: 100000000 },
    { name: "Marketing", value: 30000000 },
    { name: "Sewa", value: 25000000 },
    { name: "Utilitas", value: 15000000 },
    { name: "Lainnya", value: 10000000 }
  ];
  
  const topTransactions = [
    { id: 1, date: "2023-08-22", description: "Penjualan Produk A", amount: 15000000, type: "income" },
    { id: 2, date: "2023-08-20", description: "Pembayaran Gaji", amount: 25000000, type: "expense" },
    { id: 3, date: "2023-08-18", description: "Penjualan Layanan X", amount: 12000000, type: "income" },
    { id: 4, date: "2023-08-15", description: "Biaya Operasional", amount: 8000000, type: "expense" },
    { id: 5, date: "2023-08-10", description: "Penjualan Produk B", amount: 10000000, type: "income" }
  ];
  
  // Balance Sheet data
  const assetBreakdown = [
    { name: "Kas & Setara Kas", value: 250000000 },
    { name: "Piutang Usaha", value: 180000000 },
    { name: "Persediaan", value: 150000000 },
    { name: "Aset Tetap", value: 420000000 },
    { name: "Aset Lainnya", value: 100000000 }
  ];
  
  const liabilityBreakdown = [
    { name: "Utang Usaha", value: 120000000 },
    { name: "Utang Bank", value: 200000000 },
    { name: "Utang Pajak", value: 35000000 },
    { name: "Liabilitas Lainnya", value: 45000000 }
  ];
  
  const balanceTrend = [
    { name: "Jan", assets: 1000000000, liabilities: 400000000, equity: 600000000 },
    { name: "Feb", assets: 1050000000, liabilities: 420000000, equity: 630000000 },
    { name: "Mar", assets: 1080000000, liabilities: 410000000, equity: 670000000 },
    { name: "Apr", assets: 1100000000, liabilities: 405000000, equity: 695000000 },
    { name: "May", assets: 1150000000, liabilities: 430000000, equity: 720000000 },
    { name: "Jun", assets: 1200000000, liabilities: 450000000, equity: 750000000 },
    { name: "Jul", assets: 1180000000, liabilities: 440000000, equity: 740000000 },
    { name: "Aug", assets: 1250000000, liabilities: 450000000, equity: 800000000 }
  ];
  
  const balanceSheetItems = [
    { category: "ASET", type: "header", amount: 1250000000 },
    { category: "Aset Lancar", type: "subheader", amount: 680000000 },
    { category: "Kas & Setara Kas", type: "item", amount: 250000000 },
    { category: "Piutang Usaha", type: "item", amount: 180000000 },
    { category: "Persediaan", type: "item", amount: 150000000 },
    { category: "Aset Lancar Lainnya", type: "item", amount: 100000000 },
    { category: "Aset Tidak Lancar", type: "subheader", amount: 570000000 },
    { category: "Aset Tetap (Neto)", type: "item", amount: 420000000 },
    { category: "Investasi Jangka Panjang", type: "item", amount: 150000000 },
    { category: "LIABILITAS & EKUITAS", type: "header", amount: 1250000000 },
    { category: "Liabilitas", type: "subheader", amount: 450000000 },
    { category: "Liabilitas Jangka Pendek", type: "item", amount: 200000000 },
    { category: "Liabilitas Jangka Panjang", type: "item", amount: 250000000 },
    { category: "Ekuitas", type: "subheader", amount: 800000000 },
    { category: "Modal Disetor", type: "item", amount: 500000000 },
    { category: "Laba Ditahan", type: "item", amount: 300000000 }
  ];
  
  // Cash Flow data
  const cashFlowSummary = [
    { name: "Jan", operatingCF: 35000000, investingCF: -15000000, financingCF: -10000000, netCF: 10000000 },
    { name: "Feb", operatingCF: 40000000, investingCF: -12000000, financingCF: -12000000, netCF: 16000000 },
    { name: "Mar", operatingCF: 38000000, investingCF: -18000000, financingCF: -8000000, netCF: 12000000 },
    { name: "Apr", operatingCF: 45000000, investingCF: -20000000, financingCF: -15000000, netCF: 10000000 },
    { name: "May", operatingCF: 42000000, investingCF: -8000000, financingCF: -14000000, netCF: 20000000 },
    { name: "Jun", operatingCF: 50000000, investingCF: -22000000, financingCF: -10000000, netCF: 18000000 },
    { name: "Jul", operatingCF: 48000000, investingCF: -18000000, financingCF: -12000000, netCF: 18000000 },
    { name: "Aug", operatingCF: 52000000, investingCF: -20000000, financingCF: -15000000, netCF: 17000000 }
  ];
  
  const cashInBreakdown = [
    { name: "Penjualan Produk", value: 280000000 },
    { name: "Penjualan Jasa", value: 150000000 },
    { name: "Penerimaan Piutang", value: 100000000 },
    { name: "Pendapatan Lain", value: 50000000 }
  ];
  
  const cashOutBreakdown = [
    { name: "Biaya Operasional", value: 180000000 },
    { name: "Pembayaran Gaji", value: 150000000 },
    { name: "Investasi Aset", value: 120000000 },
    { name: "Pembayaran Hutang", value: 100000000 },
    { name: "Biaya Lain", value: 50000000 }
  ];
  
  const cashReservesTrend = [
    { name: "Jan", value: 220000000 },
    { name: "Feb", value: 236000000 },
    { name: "Mar", value: 248000000 },
    { name: "Apr", value: 258000000 },
    { name: "May", value: 278000000 },
    { name: "Jun", value: 296000000 },
    { name: "Jul", value: 314000000 },
    { name: "Aug", value: 331000000 }
  ];
  
  const cashFlowTransactions = [
    { id: 1, date: "2023-08-25", description: "Penjualan Produk A", category: "Operating", amount: 18000000, type: "cash_in" },
    { id: 2, date: "2023-08-22", description: "Pembayaran Gaji Karyawan", category: "Operating", amount: 25000000, type: "cash_out" },
    { id: 3, date: "2023-08-20", description: "Pembelian Aset Baru", category: "Investing", amount: 15000000, type: "cash_out" },
    { id: 4, date: "2023-08-18", description: "Pembayaran Hutang Bank", category: "Financing", amount: 10000000, type: "cash_out" },
    { id: 5, date: "2023-08-15", description: "Penjualan Jasa Konsultasi", category: "Operating", amount: 12000000, type: "cash_in" },
    { id: 6, date: "2023-08-12", description: "Penerimaan Piutang", category: "Operating", amount: 8500000, type: "cash_in" },
    { id: 7, date: "2023-08-10", description: "Biaya Operasional", category: "Operating", amount: 6500000, type: "cash_out" },
    { id: 8, date: "2023-08-05", description: "Pembayaran Dividen", category: "Financing", amount: 5000000, type: "cash_out" }
  ];
  
  const formatCashFlowDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };
  
  return (
    <Layout title="Laporan">
      <div className="container px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Laporan Keuangan</h2>
            <p className="text-muted-foreground">
              Visualisasi dan analisis data keuangan perusahaan
            </p>
          </div>
          
          <Tabs defaultValue="income-expense" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="income-expense">Pendapatan & Pengeluaran</TabsTrigger>
              <TabsTrigger value="balance-sheet">Neraca</TabsTrigger>
              <TabsTrigger value="cash-flow">Arus Kas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="income-expense" className="space-y-4 mt-4">
              <div className="flex flex-col-reverse md:flex-row justify-between gap-4">
                <h3 className="text-xl font-semibold">Pendapatan & Pengeluaran</h3>
                <div className="flex items-center gap-4">
                  <Label htmlFor="period">Periode:</Label>
                  <Select defaultValue={period} onValueChange={setPeriod}>
                    <SelectTrigger id="period" className="w-[180px]">
                      <SelectValue placeholder="Pilih periode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this-month">Bulan Ini</SelectItem>
                      <SelectItem value="last-month">Bulan Lalu</SelectItem>
                      <SelectItem value="this-quarter">Kuartal Ini</SelectItem>
                      <SelectItem value="this-year">Tahun Ini</SelectItem>
                      <SelectItem value="custom">Kustom...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Pendapatan
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(450000000)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium inline-flex items-center">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        +12.5%
                      </span>{" "}
                      dari periode sebelumnya
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Pengeluaran
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(300000000)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-500 font-medium inline-flex items-center">
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                        +8.2%
                      </span>{" "}
                      dari periode sebelumnya
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Laba Bersih
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(150000000)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium inline-flex items-center">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        +20.8%
                      </span>{" "}
                      dari periode sebelumnya
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pendapatan vs Pengeluaran</CardTitle>
                    <CardDescription>
                      Perbandingan pendapatan dan pengeluaran per bulan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={incomeVsExpense}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `${value / 1000000}jt`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Bar dataKey="income" name="Pendapatan" fill="#8884d8" />
                          <Bar dataKey="expense" name="Pengeluaran" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Trend Laba Bersih</CardTitle>
                    <CardDescription>
                      Perkembangan laba bersih per bulan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={netProfitTrend}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `${value / 1000000}jt`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Line
                            type="monotone"
                            dataKey="value"
                            name="Laba Bersih"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Breakdown Pendapatan</CardTitle>
                    <CardDescription>
                      Distribusi pendapatan berdasarkan kategori
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {incomeBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Breakdown Pengeluaran</CardTitle>
                    <CardDescription>
                      Distribusi pengeluaran berdasarkan kategori
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {expenseBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Transaksi Teratas</CardTitle>
                  <CardDescription>
                    Transaksi dengan nilai tertinggi dalam periode ini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            {transaction.type === "income" ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pendapatan</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Pengeluaran</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                              {formatCurrency(transaction.amount)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="balance-sheet" className="space-y-4 mt-4">
              <div className="flex flex-col-reverse md:flex-row justify-between gap-4">
                <h3 className="text-xl font-semibold">Neraca</h3>
                <div className="flex items-center gap-4">
                  <Label htmlFor="balance-period">Per Tanggal:</Label>
                  <Select defaultValue="aug-2023">
                    <SelectTrigger id="balance-period" className="w-[180px]">
                      <SelectValue placeholder="Pilih periode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aug-2023">31 Agustus 2023</SelectItem>
                      <SelectItem value="jul-2023">31 Juli 2023</SelectItem>
                      <SelectItem value="jun-2023">30 Juni 2023</SelectItem>
                      <SelectItem value="may-2023">31 Mei 2023</SelectItem>
                      <SelectItem value="custom">Tanggal Lain...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-900/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Aset
                    </CardTitle>
                    <WalletIcon className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(1250000000)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 font-medium inline-flex items-center">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        +5.9%
                      </span>{" "}
                      dari bulan lalu
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/40 dark:to-rose-900/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Liabilitas
                    </CardTitle>
                    <ArrowDownLeft className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(450000000)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-600 font-medium inline-flex items-center">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        +2.3%
                      </span>{" "}
                      dari bulan lalu
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/40 dark:to-emerald-900/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Ekuitas
                    </CardTitle>
                    <ArrowUpLeft className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(800000000)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 font-medium inline-flex items-center">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        +8.1%
                      </span>{" "}
                      dari bulan lalu
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Trend Neraca</CardTitle>
                    <CardDescription>
                      Perkembangan aset, liabilitas, dan ekuitas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={balanceTrend}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `${value / 1000000}jt`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="assets"
                            name="Aset"
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                          />
                          <Area
                            type="monotone"
                            dataKey="liabilities"
                            name="Liabilitas"
                            stackId="2"
                            stroke="#f87171"
                            fill="#f87171"
                          />
                          <Area
                            type="monotone"
                            dataKey="equity"
                            name="Ekuitas"
                            stackId="3"
                            stroke="#4ade80"
                            fill="#4ade80"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rasio Keuangan</CardTitle>
                    <CardDescription>
                      Analisis kesehatan keuangan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Rasio Solvabilitas</p>
                          <p className="text-sm text-muted-foreground">Aset / Liabilitas</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">2.78</span>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Baik</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Rasio Likuiditas</p>
                          <p className="text-sm text-muted-foreground">Aset Lancar / Liabilitas Lancar</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">3.40</span>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Sangat Baik</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Rasio Hutang terhadap Ekuitas</p>
                          <p className="text-sm text-muted-foreground">Liabilitas / Ekuitas</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">0.56</span>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Baik</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Rasio Pengembalian Aset</p>
                          <p className="text-sm text-muted-foreground">Laba Bersih / Total Aset</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">12%</span>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Baik</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                            data={assetBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {assetBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Komposisi Liabilitas</CardTitle>
                    <CardDescription>
                      Distribusi liabilitas perusahaan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={liabilityBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {liabilityBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Neraca Keuangan Detail</CardTitle>
                  <CardDescription>
                    Per tanggal 31 Agustus 2023
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">Kategori</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balanceSheetItems.map((item, index) => (
                        <TableRow key={index} className={cn(
                          item.type === "header" && "font-bold bg-muted/30",
                          item.type === "subheader" && "font-semibold bg-muted/10"
                        )}>
                          <TableCell className={cn(
                            item.type === "header" && "text-lg",
                            item.type === "subheader" && "pl-6",
                            item.type === "item" && "pl-10"
                          )}>
                            {item.category}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cash-flow" className="space-y-4 mt-4">
              <div className="flex flex-col-reverse md:flex-row justify-between gap-4">
                <h3 className="text-xl font-semibold">Laporan Arus Kas</h3>
                <div className="flex items-center gap-4">
                  <Label htmlFor="cash-flow-period">Periode:</Label>
                  <Select defaultValue={periodCashFlow} onValueChange={setPeriodCashFlow}>
                    <SelectTrigger id="cash-flow-period" className="w-[180px]">
                      <SelectValue placeholder="Pilih periode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this-month">Bulan Ini</SelectItem>
                      <SelectItem value="last-month">Bulan Lalu</SelectItem>
                      <SelectItem value="this-quarter">Kuartal Ini</SelectItem>
                      <SelectItem value="this-year">Tahun Ini</SelectItem>
                      <SelectItem value="custom">Kustom...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/40 dark:to-emerald-900/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Arus Kas Operasional
                    </CardTitle>
                    <BarChart2 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(52000000)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 font-medium inline-flex items-center">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        +8.3%
                      </span>{" "}
                      dari bulan lalu
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/40 dark:to-rose-900/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Arus Kas Investasi
                    </CardTitle>
                    <ArrowDownLeft className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">({formatCurrency(20000000)})</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-600 font-medium inline-flex items-center">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        +11.1%
                      </span>{" "}
                      dari bulan lalu
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/40 dark:to-amber-900/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Arus Kas Pendanaan
                    </CardTitle>
                    <ArrowDownLeft className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">({formatCurrency(15000000)})</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 font-medium inline-flex items-center">
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                        -25.0%
                      </span>{" "}
                      dari bulan lalu
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-900/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Arus Kas Bersih
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(17000000)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-600 font-medium inline-flex items-center">
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                        -5.6%
                      </span>{" "}
                      dari bulan lalu
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ringkasan Arus Kas</CardTitle>
                    <CardDescription>
                      Tren arus kas berdasarkan kategori
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={cashFlowSummary}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `${value / 1000000}jt`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Bar 
                            dataKey="operatingCF" 
                            name="Operasional" 
                            stackId="a" 
                            fill="#4ade80"
                          />
                          <Bar 
                            dataKey="investingCF" 
                            name="Investasi" 
                            stackId="a" 
                            fill="#f87171"
                          />
                          <Bar 
                            dataKey="financingCF" 
                            name="Pendanaan" 
                            stackId="a" 
                            fill="#fb923c"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="netCF" 
                            name="Arus Kas Bersih" 
                            stroke="#60a5fa" 
                            strokeWidth={2}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Trend Cadangan Kas</CardTitle>
                    <CardDescription>
                      Perkembangan cadangan kas perusahaan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={cashReservesTrend}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `${value / 1000000}jt`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Area
                            type="monotone"
                            dataKey="value"
                            name="Cadangan Kas"
                            stroke="#8884d8"
                            fill="#8884d8"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Breakdown Arus Kas</span>
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-sm font-normal">Kas Masuk</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          <span className="text-sm font-normal">Kas Keluar</span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Kas Masuk</h4>
                        <div className="space-y-4">
                          {cashInBreakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>{item.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatCurrency(item.value)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(item.value / cashInBreakdown.reduce((acc, curr) => acc + curr.value, 0) * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                          <div className="pt-2 border-t">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Total Kas Masuk</span>
                              <span className="font-bold text-green-600">
                                {formatCurrency(cashInBreakdown.reduce((acc, curr) => acc + curr.value, 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Kas Keluar</h4>
                        <div className="space-y-4">
                          {cashOutBreakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>{item.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatCurrency(item.value)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(item.value / cashOutBreakdown.reduce((acc, curr) => acc + curr.value, 0) * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                          <div className="pt-2 border-t">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Total Kas Keluar</span>
                              <span className="font-bold text-red-600">
                                {formatCurrency(cashOutBreakdown.reduce((acc, curr) => acc + curr.value, 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Transaksi Arus Kas</CardTitle>
                    <CardDescription>
                      Daftar transaksi terbaru
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Lihat Semua
                  </Button>
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
                      {cashFlowTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatCashFlowDate(transaction.date)}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                transaction.category === "Operating" && "border-green-500 text-green-700 bg-green-50",
                                transaction.category === "Investing" && "border-blue-500 text-blue-700 bg-blue-50",
                                transaction.category === "Financing" && "border-purple-500 text-purple-700 bg-purple-50"
                              )}
                            >
                              {transaction.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={transaction.type === "cash_in" ? "text-green-600" : "text-red-600"}>
                              {transaction.type === "cash_in" ? "+" : "-"}{formatCurrency(transaction.amount)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

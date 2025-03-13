
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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

        <TabsContent value="income-expense">
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan & Pengeluaran</CardTitle>
              <CardDescription>
                Detail pendapatan dan pengeluaran berdasarkan kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Halaman detail pendapatan dan pengeluaran akan ditampilkan di sini.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>Neraca Keuangan</CardTitle>
              <CardDescription>
                Laporan neraca untuk periode saat ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detail neraca keuangan akan ditampilkan di sini.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Arus Kas</CardTitle>
              <CardDescription>
                Analisis arus kas untuk periode saat ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detail laporan arus kas akan ditampilkan di sini.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Reports;

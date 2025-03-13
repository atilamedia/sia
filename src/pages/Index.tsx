
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const cashFlowData = [
  { name: "Jan", masuk: 7500000, keluar: 6000000 },
  { name: "Feb", masuk: 8800000, keluar: 7200000 },
  { name: "Mar", masuk: 9500000, keluar: 7800000 },
  { name: "Apr", masuk: 8200000, keluar: 7500000 },
  { name: "Mei", masuk: 9900000, keluar: 8200000 },
  { name: "Jun", masuk: 10500000, keluar: 8800000 },
];

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-[250px] transition-all duration-300">
        <Header title="Dashboard" />
        <main className="p-6 pb-16 space-y-8 animate-fade-in">
          <FinancialSummary />
          
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
                      tickFormatter={(value) => `${value/1000000}jt`}
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
                      tickFormatter={(value) => `${value/1000000}jt`}
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
        </main>
      </div>
    </div>
  );
};

export default Index;

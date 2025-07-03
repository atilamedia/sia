
import React, { useState } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KasMasukForm } from "@/components/sia/KasMasukForm";
import { KasKeluarForm } from "@/components/sia/KasKeluarForm";
import { JurnalForm } from "@/components/sia/JurnalForm";
import { DollarSign, TrendingUp, TrendingDown, BookOpen } from "lucide-react";

const SiaDemo = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo SIA RSHD - Sistem Informasi Akuntansi
          </h1>
          <p className="text-gray-600">
            RSUD H. Damanhuri Barabai - Sistem Akuntansi Terintegrasi
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp 25,000,000</div>
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
              <div className="text-2xl font-bold text-green-600">Rp 15,500,000</div>
              <p className="text-xs text-muted-foreground">
                Bulan ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kas Keluar</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Rp 12,300,000</div>
              <p className="text-xs text-muted-foreground">
                Bulan ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jurnal Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                Total entries bulan ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="kas-masuk" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kas-masuk">Kas Masuk</TabsTrigger>
            <TabsTrigger value="kas-keluar">Kas Keluar</TabsTrigger>
            <TabsTrigger value="jurnal">Jurnal Umum</TabsTrigger>
          </TabsList>

          <TabsContent value="kas-masuk">
            <div className="space-y-6">
              <KasMasukForm onSuccess={handleFormSuccess} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Kas Masuk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Form ini digunakan untuk mencatat penerimaan kas dari berbagai sumber</p>
                    <p>• Setiap transaksi akan otomatis memperbarui saldo rekening kas yang dipilih</p>
                    <p>• ID transaksi akan di-generate otomatis dengan format KM+YYYYMMDD+NNN</p>
                    <p>• Data pembayar dan keterangan wajib diisi untuk keperluan audit</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="kas-keluar">
            <div className="space-y-6">
              <KasKeluarForm onSuccess={handleFormSuccess} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Kas Keluar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Form ini digunakan untuk mencatat pengeluaran kas untuk berbagai keperluan</p>
                    <p>• Setiap transaksi akan mengurangi saldo rekening kas yang dipilih</p>
                    <p>• ID transaksi akan di-generate otomatis dengan format KK+YYYYMMDD+NNN</p>
                    <p>• Bagian/Seksi dan Penerima wajib diisi untuk kontrol internal</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jurnal">
            <div className="space-y-6">
              <JurnalForm onSuccess={handleFormSuccess} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Jurnal Umum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Form ini digunakan untuk mencatat transaksi akuntansi dengan metode double entry</p>
                    <p>• Total debit harus sama dengan total kredit (balance)</p>
                    <p>• ID jurnal akan di-generate otomatis dengan format JU+YYYYMMDD+NNN</p>
                    <p>• Setiap entry harus memiliki deskripsi yang jelas untuk keperluan audit</p>
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

export default SiaDemo;

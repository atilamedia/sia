
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { siaApi, type MasterRekening, type KasKeluar } from "@/lib/sia-api";

interface KasKeluarFormProps {
  onSuccess?: () => void;
}

export function KasKeluarForm({ onSuccess }: KasKeluarFormProps) {
  const [formData, setFormData] = useState<KasKeluar>({
    tanggal: new Date().toISOString().split('T')[0],
    bagian_seksi: '',
    kode_rek: '',
    total: 0,
    keterangan: '',
    penerima: '',
    no_cek: '',
    usernya: 'admin',
    id_div: '01'
  });

  const [accounts, setAccounts] = useState<MasterRekening[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await siaApi.getMasterRekening();
      setAccounts(response.data.filter(acc => acc.k_level === 'Detail Kas' || acc.k_level === 'Detail Bk'));
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Gagal memuat data rekening');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await siaApi.createKasKeluar(formData);
      toast.success(response.message);
      
      // Reset form
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        bagian_seksi: '',
        kode_rek: '',
        total: 0,
        keterangan: '',
        penerima: '',
        no_cek: '',
        usernya: 'admin',
        id_div: '01'
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating kas keluar:', error);
      toast.error('Gagal menyimpan kas keluar');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof KasKeluar, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Kas Keluar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) => handleInputChange('tanggal', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="bagian_seksi">Bagian/Seksi</Label>
              <Input
                id="bagian_seksi"
                value={formData.bagian_seksi}
                onChange={(e) => handleInputChange('bagian_seksi', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="kode_rek">Rekening Kas</Label>
              <Select value={formData.kode_rek} onValueChange={(value) => handleInputChange('kode_rek', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih rekening kas" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.kode_rek} value={account.kode_rek}>
                      {account.kode_rek} - {account.nama_rek}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="total">Jumlah</Label>
              <Input
                id="total"
                type="number"
                min="0"
                step="0.01"
                value={formData.total}
                onChange={(e) => handleInputChange('total', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="penerima">Penerima</Label>
              <Input
                id="penerima"
                value={formData.penerima}
                onChange={(e) => handleInputChange('penerima', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="no_cek">No. Cek/Giro (Opsional)</Label>
              <Input
                id="no_cek"
                value={formData.no_cek}
                onChange={(e) => handleInputChange('no_cek', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              value={formData.keterangan}
              onChange={(e) => handleInputChange('keterangan', e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Menyimpan...' : 'Simpan Kas Keluar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

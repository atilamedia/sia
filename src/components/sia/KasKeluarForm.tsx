
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { siaApi, type KasKeluar } from "@/lib/sia-api";
import { AccountSelector } from "./AccountSelector";

interface KasKeluarFormProps {
  onSuccess?: () => void;
  editData?: any;
  onCancel?: () => void;
}

export function KasKeluarForm({ onSuccess, editData, onCancel }: KasKeluarFormProps) {
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

  const [loading, setLoading] = useState(false);
  const isEditing = !!editData;

  useEffect(() => {
    if (editData) {
      setFormData({
        id_kk: editData.id_kk,
        tanggal: editData.tanggal,
        bagian_seksi: editData.bagian_seksi || '',
        kode_rek: editData.kode_rek || '',
        total: editData.total || 0,
        keterangan: editData.keterangan || '',
        penerima: editData.penerima || '',
        no_cek: editData.no_cek || '',
        usernya: editData.usernya || 'admin',
        id_div: editData.id_div || '01'
      });
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const response = await siaApi.updateKasKeluar(formData);
        toast.success(response.message);
      } else {
        const response = await siaApi.createKasKeluar(formData);
        toast.success(response.message);
      }
      
      // Reset form if not editing
      if (!isEditing) {
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
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving kas keluar:', error);
      toast.error(`Gagal ${isEditing ? 'mengupdate' : 'menyimpan'} kas keluar`);
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
        <CardTitle>{isEditing ? 'Edit Kas Keluar' : 'Form Kas Keluar'}</CardTitle>
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
              <AccountSelector
                value={formData.kode_rek}
                onValueChange={(value) => handleInputChange('kode_rek', value)}
                placeholder="Pilih rekening kas"
              />
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

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? `${isEditing ? 'Mengupdate...' : 'Menyimpan...'}` : `${isEditing ? 'Update Kas Keluar' : 'Simpan Kas Keluar'}`}
            </Button>
            {isEditing && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

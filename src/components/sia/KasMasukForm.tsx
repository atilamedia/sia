
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { siaApi, type KasMasuk } from "@/lib/sia-api";
import { AccountSelector } from "./AccountSelector";

interface KasMasukFormProps {
  onSuccess?: () => void;
  editData?: KasMasuk;
  onCancel?: () => void;
}

export function KasMasukForm({ onSuccess, editData, onCancel }: KasMasukFormProps) {
  const [formData, setFormData] = useState<KasMasuk>({
    tanggal: new Date().toISOString().split('T')[0],
    kode_rek: '',
    total: 0,
    keterangan: '',
    pembayar: '',
    no_cek: '',
    usernya: 'admin',
    id_div: '01'
  });

  const [loading, setLoading] = useState(false);
  const isEditing = !!editData;

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        tanggal: editData.tanggal || new Date().toISOString().split('T')[0]
      });
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const response = await siaApi.updateKasMasuk(formData);
        toast.success(response.message);
      } else {
        const response = await siaApi.createKasMasuk(formData);
        toast.success(response.message);
      }
      
      // Reset form if creating new
      if (!isEditing) {
        setFormData({
          tanggal: new Date().toISOString().split('T')[0],
          kode_rek: '',
          total: 0,
          keterangan: '',
          pembayar: '',
          no_cek: '',
          usernya: 'admin',
          id_div: '01'
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving kas masuk:', error);
      toast.error(isEditing ? 'Gagal mengupdate kas masuk' : 'Gagal menyimpan kas masuk');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof KasMasuk, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    if (isEditing && onCancel) {
      onCancel();
    } else {
      // Reset form for new entry
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        kode_rek: '',
        total: 0,
        keterangan: '',
        pembayar: '',
        no_cek: '',
        usernya: 'admin',
        id_div: '01'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Kas Masuk' : 'Form Kas Masuk'}</CardTitle>
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
              <Label htmlFor="kode_rek">Rekening Kas</Label>
              <AccountSelector
                value={formData.kode_rek}
                onValueChange={(value) => handleInputChange('kode_rek', value)}
                placeholder="Pilih rekening kas"
                filterType="all"
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
              <Label htmlFor="pembayar">Pembayar</Label>
              <Input
                id="pembayar"
                value={formData.pembayar}
                onChange={(e) => handleInputChange('pembayar', e.target.value)}
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
              {loading ? (isEditing ? 'Mengupdate...' : 'Menyimpan...') : (isEditing ? 'Update Kas Masuk' : 'Simpan Kas Masuk')}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Batal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

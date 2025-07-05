
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { siaApi, AnggaranData, MasterRekening } from "@/lib/sia-api";
import { toast } from "sonner";

interface AnggaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  tahun: number;
  editData?: AnggaranData & { nama_rek?: string };
  mode: 'create' | 'edit';
}

export function AnggaranModal({ isOpen, onClose, tahun, editData, mode }: AnggaranModalProps) {
  const [formData, setFormData] = useState({
    kode_rek: editData?.kode_rek || '',
    total: editData?.total || 0,
    tanda: editData?.tanda || 'Y',
    validasi_realisasi: editData?.validasi_realisasi || 'Y',
    usernya: editData?.usernya || 'admin'
  });

  const queryClient = useQueryClient();

  // Query untuk mengambil data rekening
  const { data: rekeningData } = useQuery({
    queryKey: ['rekening'],
    queryFn: async () => {
      const response = await siaApi.getMasterRekening();
      return response;
    },
    enabled: mode === 'create'
  });

  const rekening: MasterRekening[] = rekeningData?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data: AnggaranData) => {
      return await siaApi.createAnggaran(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran', tahun] });
      toast.success("Anggaran berhasil dibuat!");
      onClose();
    },
    onError: (error) => {
      console.error('Error creating budget:', error);
      toast.error("Gagal membuat anggaran");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AnggaranData) => {
      return await siaApi.updateAnggaran(formData.kode_rek, tahun, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran', tahun] });
      toast.success("Anggaran berhasil diupdate!");
      onClose();
    },
    onError: (error) => {
      console.error('Error updating budget:', error);
      toast.error("Gagal mengupdate anggaran");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.kode_rek) {
      toast.error("Pilih rekening terlebih dahulu");
      return;
    }

    if (formData.total <= 0) {
      toast.error("Total anggaran harus lebih dari 0");
      return;
    }

    const anggaranData: AnggaranData = {
      kode_rek: formData.kode_rek,
      tahun: tahun,
      total: formData.total,
      tanda: formData.tanda,
      validasi_realisasi: formData.validasi_realisasi,
      usernya: formData.usernya
    };

    if (mode === 'create') {
      await createMutation.mutateAsync(anggaranData);
    } else {
      await updateMutation.mutateAsync(anggaranData);
    }
  };

  const selectedRekening = rekening.find(r => r.kode_rek === formData.kode_rek);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tambah Anggaran Baru' : 'Edit Anggaran'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Masukkan data anggaran baru untuk tahun ' + tahun
              : 'Update data anggaran untuk tahun ' + tahun
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="kode_rek">Rekening</Label>
              <Select value={formData.kode_rek} onValueChange={(value) => setFormData(prev => ({ ...prev, kode_rek: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih rekening..." />
                </SelectTrigger>
                <SelectContent>
                  {rekening.map((rek) => (
                    <SelectItem key={rek.kode_rek} value={rek.kode_rek}>
                      {rek.kode_rek} - {rek.nama_rek}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === 'edit' && (
            <div className="space-y-2">
              <Label>Rekening</Label>
              <div className="p-2 bg-gray-50 rounded text-sm">
                {formData.kode_rek} - {editData?.nama_rek}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="total">Total Anggaran</Label>
            <Input
              id="total"
              type="number"
              value={formData.total}
              onChange={(e) => setFormData(prev => ({ ...prev, total: parseFloat(e.target.value) || 0 }))}
              placeholder="Masukkan total anggaran"
              min="0"
              step="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanda">Status</Label>
            <Select value={formData.tanda} onValueChange={(value) => setFormData(prev => ({ ...prev, tanda: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Y">Aktif</SelectItem>
                <SelectItem value="N">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'Menyimpan...' : 
               (mode === 'create' ? 'Tambah' : 'Update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

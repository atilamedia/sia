
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { siaApi, AnggaranData, MasterRekening } from "@/lib/sia-api";
import { toast } from "sonner";

interface LRAModalProps {
  isOpen: boolean;
  onClose: () => void;
  tahun: number;
  editData?: AnggaranData | undefined;
  mode: 'create' | 'edit';
}

export function LRAModal({ isOpen, onClose, tahun, editData, mode }: LRAModalProps) {
  const [formData, setFormData] = useState({
    kode_rek: '',
    total: 0,
    tanda: 'Y' as 'Y' | 'N',
    validasi_realisasi: 'Y' as 'Y' | 'N'
  });

  const queryClient = useQueryClient();

  // Query untuk mengambil data rekening
  const { data: rekeningData } = useQuery({
    queryKey: ['rekening'],
    queryFn: async () => {
      const response = await siaApi.getMasterRekening();
      return response;
    }
  });

  const rekening: MasterRekening[] = rekeningData?.data || [];

  useEffect(() => {
    if (mode === 'edit' && editData) {
      setFormData({
        kode_rek: editData.kode_rek,
        total: editData.total,
        tanda: editData.tanda as 'Y' | 'N',
        validasi_realisasi: editData.validasi_realisasi as 'Y' | 'N' || 'Y'
      });
    } else {
      setFormData({
        kode_rek: '',
        total: 0,
        tanda: 'Y',
        validasi_realisasi: 'Y'
      });
    }
  }, [mode, editData, isOpen]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await siaApi.createAnggaran({
        ...data,
        tahun,
        usernya: 'admin'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran', tahun] });
      toast.success("Data anggaran berhasil ditambahkan!");
      onClose();
    },
    onError: (error) => {
      console.error('Error creating budget:', error);
      toast.error("Gagal menambahkan data anggaran");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await siaApi.updateAnggaran(editData!.kode_rek, tahun, {
        ...data,
        usernya: 'admin'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran', tahun] });
      toast.success("Data anggaran berhasil diperbarui!");
      onClose();
    },
    onError: (error) => {
      console.error('Error updating budget:', error);
      toast.error("Gagal memperbarui data anggaran");
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

    if (mode === 'create') {
      await createMutation.mutateAsync(formData);
    } else {
      await updateMutation.mutateAsync(formData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tambah' : 'Edit'} Data Anggaran
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? `Tambah data anggaran baru untuk tahun ${tahun}` 
              : `Edit data anggaran untuk tahun ${tahun}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kode_rek">Rekening</Label>
            <Select 
              value={formData.kode_rek} 
              onValueChange={(value) => handleChange('kode_rek', value)}
              disabled={mode === 'edit'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih rekening" />
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

          <div className="space-y-2">
            <Label htmlFor="total">Total Anggaran</Label>
            <Input
              id="total"
              type="number"
              value={formData.total}
              onChange={(e) => handleChange('total', parseFloat(e.target.value) || 0)}
              placeholder="Masukkan total anggaran"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanda">Status</Label>
            <Select 
              value={formData.tanda} 
              onValueChange={(value) => handleChange('tanda', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Y">Aktif</SelectItem>
                <SelectItem value="N">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validasi">Validasi Realisasi</Label>
            <Select 
              value={formData.validasi_realisasi} 
              onValueChange={(value) => handleChange('validasi_realisasi', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Y">Valid</SelectItem>
                <SelectItem value="N">Belum Valid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : (mode === 'create' ? 'Simpan' : 'Perbarui')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

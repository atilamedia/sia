
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { siaApi } from "@/lib/sia-api";

interface DeleteKasMasukDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kasMasuk: {
    id_km: string;
    keterangan: string;
    pembayar: string;
    total: number;
  } | null;
  onSuccess: () => void;
}

export function DeleteKasMasukDialog({ open, onOpenChange, kasMasuk, onSuccess }: DeleteKasMasukDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!kasMasuk?.id_km) return;

    setLoading(true);
    try {
      const response = await siaApi.deleteKasMasuk(kasMasuk.id_km);
      toast.success(response.message);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error deleting kas masuk:', error);
      toast.error('Gagal menghapus kas masuk');
    } finally {
      setLoading(false);
    }
  };

  if (!kasMasuk) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Kas Masuk</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus transaksi kas masuk ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 py-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">ID:</span>
            <span className="text-sm font-medium">{kasMasuk.id_km}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Pembayar:</span>
            <span className="text-sm font-medium">{kasMasuk.pembayar}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Jumlah:</span>
            <span className="text-sm font-medium text-green-600">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(kasMasuk.total)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Keterangan:</span>
            <span className="text-sm font-medium">{kasMasuk.keterangan}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

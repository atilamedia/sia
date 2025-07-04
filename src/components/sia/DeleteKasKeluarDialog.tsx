
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { siaApi } from "@/lib/sia-api";
import { toast } from "sonner";

interface DeleteKasKeluarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kasKeluar: any;
  onSuccess: () => void;
}

export function DeleteKasKeluarDialog({
  open,
  onOpenChange,
  kasKeluar,
  onSuccess,
}: DeleteKasKeluarDialogProps) {
  const handleDelete = async () => {
    try {
      const response = await siaApi.deleteKasKeluar(kasKeluar.id_kk);
      toast.success(response.message);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting kas keluar:', error);
      toast.error('Gagal menghapus kas keluar');
    }
  };

  if (!kasKeluar) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kas Keluar</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus kas keluar dengan ID{" "}
            <strong>{kasKeluar.id_kk}</strong>?
            <br />
            <br />
            <strong>Detail:</strong>
            <br />
            Tanggal: {kasKeluar.tanggal}
            <br />
            Penerima: {kasKeluar.penerima}
            <br />
            Jumlah: {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(kasKeluar.total)}
            <br />
            Keterangan: {kasKeluar.keterangan}
            <br />
            <br />
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

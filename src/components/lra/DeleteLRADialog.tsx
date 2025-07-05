
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { siaApi } from "@/lib/sia-api";
import { toast } from "sonner";

interface LRAData {
  kode_rek: string;
  nama_rek: string;
  anggaran: number;
  realisasi: number;
  selisih: number;
  persentase: number;
  jenis_rek: string;
}

interface DeleteLRADialogProps {
  isOpen: boolean;
  onClose: () => void;
  lraData: LRAData;
  tahun: number;
}

export function DeleteLRADialog({ isOpen, onClose, lraData, tahun }: DeleteLRADialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await siaApi.deleteAnggaran(lraData.kode_rek, tahun);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran', tahun] });
      toast.success("Data anggaran berhasil dihapus!");
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting budget:', error);
      toast.error("Gagal menghapus data anggaran");
    }
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Data Anggaran</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data anggaran untuk rekening{' '}
            <strong>{lraData.kode_rek} - {lraData.nama_rek}</strong>{' '}
            tahun {tahun}?
            <br />
            <br />
            Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi Laporan Realisasi Anggaran.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

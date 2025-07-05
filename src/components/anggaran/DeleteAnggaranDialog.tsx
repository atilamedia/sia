
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { siaApi, AnggaranData } from "@/lib/sia-api";
import { toast } from "sonner";

interface DeleteAnggaranDialogProps {
  isOpen: boolean;
  onClose: () => void;
  anggaran: AnggaranData & { nama_rek?: string };
  tahun: number;
}

export function DeleteAnggaranDialog({ isOpen, onClose, anggaran, tahun }: DeleteAnggaranDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await siaApi.deleteAnggaran(anggaran.kode_rek, tahun);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran', tahun] });
      toast.success("Anggaran berhasil dihapus!");
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting budget:', error);
      toast.error("Gagal menghapus anggaran");
    }
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Anggaran</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus anggaran untuk rekening{' '}
            <strong>{anggaran.kode_rek} - {anggaran.nama_rek}</strong>{' '}
            tahun {tahun}?
            <br />
            <br />
            Tindakan ini tidak dapat dibatalkan dan akan menghapus data anggaran secara permanen.
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

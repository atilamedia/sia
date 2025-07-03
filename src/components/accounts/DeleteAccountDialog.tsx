
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

interface DeleteAccountDialogProps {
  account: any;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountDialog({
  account,
  onClose,
  onConfirm,
}: DeleteAccountDialogProps) {
  if (!account) return null;

  return (
    <AlertDialog open={!!account} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Rekening</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus rekening <strong>{account.nama_rek}</strong> ({account.kode_rek})?
            <br /><br />
            Tindakan ini tidak dapat dibatalkan dan mungkin mempengaruhi data keuangan yang terkait.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

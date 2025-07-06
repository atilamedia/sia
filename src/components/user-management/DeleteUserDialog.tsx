
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
}

interface DeleteUserDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserDeleted: () => void;
}

export function DeleteUserDialog({ user, open, onOpenChange, onUserDeleted }: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Delete user permissions first
      const { error: permissionError } = await supabase
        .from('user_page_permissions')
        .delete()
        .eq('user_id', user.id);

      if (permissionError) {
        console.error('Permission deletion error:', permissionError);
      }

      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (roleError) {
        console.error('Role deletion error:', roleError);
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile deletion error:', profileError);
        toast.error('Gagal menghapus profil pengguna');
        return;
      }

      toast.success('Pengguna berhasil dihapus');
      onOpenChange(false);
      onUserDeleted();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Terjadi kesalahan saat menghapus pengguna');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus pengguna "{user.full_name || user.email}"? 
            Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait pengguna.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type UserRole = 'superadmin' | 'admin' | 'pengguna';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

interface EditUserDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function EditUserDialog({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'pengguna' as UserRole,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        role: user.role,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: formData.fullName })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile error:', profileError);
        toast.error('Gagal mengupdate profil');
        return;
      }

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: formData.role })
        .eq('user_id', user.id);

      if (roleError) {
        console.error('Role error:', roleError);
        toast.error('Gagal mengupdate role');
        return;
      }

      toast.success('Pengguna berhasil diperbarui');
      onOpenChange(false);
      onUserUpdated();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Terjadi kesalahan saat memperbarui pengguna');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>
            Perbarui informasi pengguna
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Nama Lengkap</Label>
              <Input
                id="edit-fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pengguna">Pengguna</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Perbarui
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

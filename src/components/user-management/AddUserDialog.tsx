
import { useState } from 'react';
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
  DialogTrigger,
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
import { UserPlus, Loader2 } from 'lucide-react';

type UserRole = 'superadmin' | 'admin' | 'pengguna';

interface AddUserDialogProps {
  onUserAdded: () => void;
}

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'pengguna' as UserRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast.error(authError.message);
        return;
      }

      if (authData.user) {
        // Update role if not default
        if (formData.role !== 'pengguna') {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: formData.role })
            .eq('user_id', authData.user.id);

          if (roleError) {
            console.error('Role error:', roleError);
            toast.error('Pengguna dibuat tapi gagal mengatur role');
          }
        }

        toast.success('Pengguna berhasil ditambahkan');
        setFormData({
          email: '',
          password: '',
          fullName: '',
          role: 'pengguna',
        });
        setOpen(false);
        onUserAdded();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Terjadi kesalahan saat menambah pengguna');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Pengguna
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi pengguna baru
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                minLength={6}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Pengguna
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

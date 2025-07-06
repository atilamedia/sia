
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User, Settings, Shield } from 'lucide-react';

type UserRole = 'superadmin' | 'admin' | 'pengguna';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

interface PageData {
  page_path: string;
  page_name: string;
  description: string;
}

interface UserPermission {
  page_path: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
}

export default function UserManagement() {
  const { userRole } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

  // Redirect if not superadmin
  if (userRole !== 'superadmin') {
    return (
      <Layout title="Akses Ditolak">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">Hanya superadmin yang dapat mengakses halaman ini.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        created_at,
        user_roles!inner(role)
      `);

    if (error) {
      toast.error('Gagal memuat data pengguna');
      return;
    }

    const formattedUsers = data.map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.user_roles.role as UserRole,
      created_at: user.created_at,
    }));

    setUsers(formattedUsers);
  };

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('page_path, page_name, description')
      .eq('is_active', true)
      .order('page_path');

    if (error) {
      toast.error('Gagal memuat data halaman');
      return;
    }

    setPages(data);
  };

  const fetchUserPermissions = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_page_permissions')
      .select('page_path, can_view, can_create, can_edit, can_delete, can_export')
      .eq('user_id', userId);

    if (error) {
      toast.error('Gagal memuat permission pengguna');
      return;
    }

    setUserPermissions(data);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
      await fetchPages();
      setLoading(false);
    };
    
    loadData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast.error('Gagal mengubah role pengguna');
      return;
    }

    toast.success('Role pengguna berhasil diubah');
    fetchUsers();
  };

  const handlePermissionChange = async (pagePath: string, permissionType: string, value: boolean) => {
    if (!selectedUser) return;

    const existingPermission = userPermissions.find(p => p.page_path === pagePath);
    
    if (existingPermission) {
      // Update existing permission
      const { error } = await supabase
        .from('user_page_permissions')
        .update({ [permissionType]: value })
        .eq('user_id', selectedUser.id)
        .eq('page_path', pagePath);

      if (error) {
        toast.error('Gagal mengubah permission');
        return;
      }
    } else {
      // Create new permission
      const pageData = pages.find(p => p.page_path === pagePath);
      if (!pageData) return;

      const { error } = await supabase
        .from('user_page_permissions')
        .insert({
          user_id: selectedUser.id,
          page_path: pagePath,
          page_name: pageData.page_name,
          [permissionType]: value,
          description: 'Manual permission'
        });

      if (error) {
        toast.error('Gagal menambah permission');
        return;
      }
    }

    fetchUserPermissions(selectedUser.id);
  };

  const openPermissionDialog = (user: UserData) => {
    setSelectedUser(user);
    fetchUserPermissions(user.id);
    setPermissionDialogOpen(true);
  };

  const getPermissionValue = (pagePath: string, permissionType: string) => {
    const permission = userPermissions.find(p => p.page_path === pagePath);
    return permission ? permission[permissionType as keyof UserPermission] : false;
  };

  if (loading) {
    return (
      <Layout title="Manajemen Pengguna">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Memuat data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manajemen Pengguna">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Daftar Pengguna
            </CardTitle>
            <CardDescription>
              Kelola pengguna dan permission akses halaman
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pengguna">Pengguna</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superadmin">Superadmin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPermissionDialog(user)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Permission
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Permission Dialog */}
        <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Kelola Permission - {selectedUser?.email}</DialogTitle>
              <DialogDescription>
                Atur permission akses untuk setiap halaman
              </DialogDescription>
            </DialogHeader>
            
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Halaman</TableHead>
                    <TableHead>View</TableHead>
                    <TableHead>Create</TableHead>
                    <TableHead>Edit</TableHead>
                    <TableHead>Delete</TableHead>
                    <TableHead>Export</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.page_path}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{page.page_name}</div>
                          <div className="text-sm text-gray-500">{page.page_path}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={getPermissionValue(page.page_path, 'can_view') as boolean}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(page.page_path, 'can_view', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={getPermissionValue(page.page_path, 'can_create') as boolean}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(page.page_path, 'can_create', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={getPermissionValue(page.page_path, 'can_edit') as boolean}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(page.page_path, 'can_edit', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={getPermissionValue(page.page_path, 'can_delete') as boolean}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(page.page_path, 'can_delete', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={getPermissionValue(page.page_path, 'can_export') as boolean}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(page.page_path, 'can_export', checked as boolean)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button onClick={() => setPermissionDialogOpen(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

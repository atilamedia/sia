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
          <div className="text-center p-4">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl md:text-2xl font-bold mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 text-sm md:text-base">Hanya superadmin yang dapat mengakses halaman ini.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      
      // First get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast.error('Gagal memuat data profil pengguna');
        return;
      }

      console.log('Profiles data:', profilesData);

      if (!profilesData || profilesData.length === 0) {
        console.log('No profiles found');
        setUsers([]);
        return;
      }

      // Then get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        toast.error('Gagal memuat data role pengguna');
        return;
      }

      console.log('Roles data:', rolesData);

      // Combine the data
      const formattedUsers = profilesData.map((profile: any) => {
        const userRole = rolesData?.find((role: any) => role.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: (userRole?.role || 'pengguna') as UserRole,
          created_at: profile.created_at,
        };
      });

      console.log('Formatted users:', formattedUsers);
      setUsers(formattedUsers);

    } catch (error) {
      console.error('Unexpected error fetching users:', error);
      toast.error('Terjadi kesalahan saat memuat data pengguna');
    }
  };

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('page_path, page_name, description')
        .eq('is_active', true)
        .order('page_path');

      if (error) {
        console.error('Error fetching pages:', error);
        toast.error('Gagal memuat data halaman');
        return;
      }

      setPages(data || []);
    } catch (error) {
      console.error('Unexpected error fetching pages:', error);
      toast.error('Terjadi kesalahan saat memuat data halaman');
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_page_permissions')
        .select('page_path, can_view, can_create, can_edit, can_delete, can_export')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user permissions:', error);
        toast.error('Gagal memuat permission pengguna');
        return;
      }

      setUserPermissions(data || []);
    } catch (error) {
      console.error('Unexpected error fetching permissions:', error);
      toast.error('Terjadi kesalahan saat memuat permission pengguna');
    }
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
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating role:', error);
        toast.error('Gagal mengubah role pengguna');
        return;
      }

      toast.success('Role pengguna berhasil diubah');
      fetchUsers();
    } catch (error) {
      console.error('Unexpected error updating role:', error);
      toast.error('Terjadi kesalahan saat mengubah role');
    }
  };

  const handlePermissionChange = async (pagePath: string, permissionType: string, value: boolean) => {
    if (!selectedUser) return;

    try {
      const existingPermission = userPermissions.find(p => p.page_path === pagePath);
      
      if (existingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from('user_page_permissions')
          .update({ [permissionType]: value })
          .eq('user_id', selectedUser.id)
          .eq('page_path', pagePath);

        if (error) {
          console.error('Error updating permission:', error);
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
          console.error('Error creating permission:', error);
          toast.error('Gagal menambah permission');
          return;
        }
      }

      fetchUserPermissions(selectedUser.id);
    } catch (error) {
      console.error('Unexpected error handling permission:', error);
      toast.error('Terjadi kesalahan saat mengatur permission');
    }
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
      <div className="space-y-4 md:space-y-6">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <User className="h-4 w-4 md:h-5 md:w-5" />
              Daftar Pengguna
            </CardTitle>
            <CardDescription className="text-sm">
              Kelola pengguna dan permission akses halaman
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm md:text-base">Tidak ada data pengguna yang ditemukan</p>
                <Button 
                  onClick={fetchUsers} 
                  variant="outline" 
                  className="mt-4"
                  size="sm"
                >
                  Muat Ulang
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead className="min-w-[150px] hidden md:table-cell">Nama Lengkap</TableHead>
                      <TableHead className="min-w-[120px]">Role</TableHead>
                      <TableHead className="min-w-[120px] hidden lg:table-cell">Tanggal Daftar</TableHead>
                      <TableHead className="min-w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="truncate max-w-[180px]" title={user.email}>
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-500 md:hidden">
                              {user.full_name || '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.full_name || '-'}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                          >
                            <SelectTrigger className="w-full min-w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pengguna">Pengguna</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="superadmin">Superadmin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {new Date(user.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPermissionDialog(user)}
                            className="w-full md:w-auto"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Permission</span>
                            <span className="sm:hidden">Izin</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permission Dialog */}
        <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg md:text-xl">
                Kelola Permission - {selectedUser?.email}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Atur permission akses untuk setiap halaman
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px] sticky left-0 bg-background z-10">
                        Halaman
                      </TableHead>
                      <TableHead className="min-w-[80px] text-center">View</TableHead>
                      <TableHead className="min-w-[80px] text-center">Create</TableHead>
                      <TableHead className="min-w-[80px] text-center">Edit</TableHead>
                      <TableHead className="min-w-[80px] text-center">Delete</TableHead>
                      <TableHead className="min-w-[80px] text-center">Export</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.page_path}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div>
                            <div className="font-medium text-sm">{page.page_name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[180px]" title={page.page_path}>
                              {page.page_path}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermissionValue(page.page_path, 'can_view') as boolean}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(page.page_path, 'can_view', checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermissionValue(page.page_path, 'can_create') as boolean}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(page.page_path, 'can_create', checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermissionValue(page.page_path, 'can_edit') as boolean}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(page.page_path, 'can_edit', checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermissionValue(page.page_path, 'can_delete') as boolean}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(page.page_path, 'can_delete', checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
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
            </div>

            <DialogFooter className="pt-4">
              <Button onClick={() => setPermissionDialogOpen(false)} className="w-full md:w-auto">
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

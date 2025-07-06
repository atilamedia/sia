import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
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
import { User, Settings, Shield, Edit, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AddUserDialog } from '@/components/user-management/AddUserDialog';
import { EditUserDialog } from '@/components/user-management/EditUserDialog';
import { DeleteUserDialog } from '@/components/user-management/DeleteUserDialog';

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
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<UserData[]>([]);
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);

  // Redirect if not superadmin
  if (userRole !== 'superadmin') {
    return (
      <Layout title="Akses Ditolak">
        <div className="flex items-center justify-center min-h-[50vh] px-4">
          <div className="text-center p-4 max-w-sm">
            <Shield className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 text-sm sm:text-base">Hanya superadmin yang dapat mengakses halaman ini.</p>
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

  const openEditDialog = (user: UserData) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserData) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const getPermissionValue = (pagePath: string, permissionType: string) => {
    const permission = userPermissions.find(p => p.page_path === pagePath);
    return permission ? permission[permissionType as keyof UserPermission] : false;
  };

  const PermissionTable = () => (
    <div className="w-full">
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px] sticky left-0 bg-background z-10 border-r">
                  <div className="font-semibold">Halaman</div>
                </TableHead>
                <TableHead className="min-w-[60px] text-center text-xs sm:text-sm">View</TableHead>
                <TableHead className="min-w-[60px] text-center text-xs sm:text-sm">Create</TableHead>
                <TableHead className="min-w-[60px] text-center text-xs sm:text-sm">Edit</TableHead>
                <TableHead className="min-w-[60px] text-center text-xs sm:text-sm">Delete</TableHead>
                <TableHead className="min-w-[60px] text-center text-xs sm:text-sm">Export</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.page_path}>
                  <TableCell className="sticky left-0 bg-background z-10 border-r">
                    <div className="min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate" title={page.page_name}>
                        {page.page_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate" title={page.page_path}>
                        {page.page_path}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center p-2">
                    <Checkbox
                      checked={getPermissionValue(page.page_path, 'can_view') as boolean}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(page.page_path, 'can_view', checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center p-2">
                    <Checkbox
                      checked={getPermissionValue(page.page_path, 'can_create') as boolean}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(page.page_path, 'can_create', checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center p-2">
                    <Checkbox
                      checked={getPermissionValue(page.page_path, 'can_edit') as boolean}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(page.page_path, 'can_edit', checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center p-2">
                    <Checkbox
                      checked={getPermissionValue(page.page_path, 'can_delete') as boolean}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(page.page_path, 'can_delete', checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center p-2">
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
    </div>
  );

  if (loading) {
    return (
      <Layout title="Manajemen Pengguna">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm sm:text-base">Memuat data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manajemen Pengguna">
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Daftar Pengguna
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Kelola pengguna dan permission akses halaman
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <AddUserDialog onUserAdded={fetchUsers} />
            
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Tidak ada data pengguna yang ditemukan</p>
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
              <>
                {/* Mobile View - Cards */}
                {isMobile && (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <Card key={`user-mobile-${user.id}`} className="p-3">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate" title={user.email}>
                                {user.email}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {user.full_name || '-'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Role</p>
                              <Select
                                value={user.role}
                                onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                              >
                                <SelectTrigger className="w-full h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pengguna">Pengguna</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="superadmin">Superadmin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPermissionDialog(user)}
                                className="flex-1 h-8 text-xs"
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Permission
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                                className="h-8 px-2 text-xs"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(user)}
                                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Desktop View - Table */}
                {!isMobile && (
                  <div className="w-full">
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[180px] sm:min-w-[200px]">
                                <div className="text-xs sm:text-sm font-semibold">Email</div>
                              </TableHead>
                              <TableHead className="min-w-[120px] hidden sm:table-cell">
                                <div className="text-xs sm:text-sm font-semibold">Nama Lengkap</div>
                              </TableHead>
                              <TableHead className="min-w-[100px]">
                                <div className="text-xs sm:text-sm font-semibold">Role</div>
                              </TableHead>
                              <TableHead className="min-w-[120px] hidden lg:table-cell">
                                <div className="text-xs sm:text-sm font-semibold">Tanggal Daftar</div>
                              </TableHead>
                              <TableHead className="min-w-[120px]">
                                <div className="text-xs sm:text-sm font-semibold">Aksi</div>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => (
                              <TableRow key={user.id} className="hover:bg-muted/50">
                                <TableCell className="p-2 sm:p-4">
                                  <div className="min-w-0">
                                    <div className="font-medium text-xs sm:text-sm truncate" title={user.email}>
                                      {user.email}
                                    </div>
                                    <div className="text-xs text-gray-500 sm:hidden mt-1">
                                      {user.full_name || '-'}
                                    </div>
                                    <div className="text-xs text-gray-400 lg:hidden mt-1">
                                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                                  <div className="text-xs sm:text-sm">
                                    {user.full_name || '-'}
                                  </div>
                                </TableCell>
                                <TableCell className="p-2 sm:p-4">
                                  <Select
                                    value={user.role}
                                    onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                                  >
                                    <SelectTrigger className="w-full min-w-[80px] h-8 text-xs sm:text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pengguna">Pengguna</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="superadmin">Superadmin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell p-2 sm:p-4">
                                  <div className="text-xs sm:text-sm">
                                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                                  </div>
                                </TableCell>
                                <TableCell className="p-2 sm:p-4">
                                  <div className="flex gap-1 sm:gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openPermissionDialog(user)}
                                      className="h-8 px-2 text-xs"
                                    >
                                      <Settings className="h-3 w-3" />
                                      <span className="hidden sm:inline ml-1">Permission</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditDialog(user)}
                                      className="h-8 px-2 text-xs"
                                    >
                                      <Edit className="h-3 w-3" />
                                      <span className="hidden sm:inline ml-1">Edit</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openDeleteDialog(user)}
                                      className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      <span className="hidden sm:inline ml-1">Hapus</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Permission Dialog for Desktop/Tablet */}
        {!isMobile && (
          <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-base sm:text-lg md:text-xl">
                  Kelola Permission - {selectedUser?.email}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Atur permission akses untuk setiap halaman
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-auto">
                <PermissionTable />
              </div>

              <DialogFooter className="pt-4">
                <Button onClick={() => setPermissionDialogOpen(false)} className="w-full sm:w-auto">
                  Tutup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Permission Drawer for Mobile */}
        {isMobile && (
          <Drawer open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader className="text-center">
                <DrawerTitle className="text-lg">
                  Kelola Permission
                </DrawerTitle>
                <DrawerDescription className="text-sm">
                  {selectedUser?.email}
                </DrawerDescription>
              </DrawerHeader>
              
              <div className="flex-1 overflow-auto px-4 pb-4">
                <PermissionTable />
              </div>

              <DrawerFooter>
                <Button onClick={() => setPermissionDialogOpen(false)} className="w-full">
                  Tutup
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}

        {/* Edit User Dialog */}
        <EditUserDialog
          user={editingUser}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onUserUpdated={fetchUsers}
        />

        {/* Delete User Dialog */}
        <DeleteUserDialog
          user={deletingUser}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onUserDeleted={fetchUsers}
        />
      </div>
    </Layout>
  );
}

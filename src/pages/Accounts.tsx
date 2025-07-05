
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { siaApi, type MasterRekening } from "@/lib/sia-api";
import { toast } from "sonner";
import { Search, Plus, FileEdit, Trash2, Download, Wallet, Calculator } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AccountBalanceModal } from "@/components/accounts/AccountBalanceModal";
import { AccountForm, type AccountFormValues } from "@/components/accounts/AccountForm";
import { Account } from "@/lib/types";

const Accounts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<MasterRekening | null>(null);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{ kode: string; nama: string } | null>(null);

  const { data: accountsData, isLoading, refetch } = useQuery({
    queryKey: ['master-rekening', refreshTrigger],
    queryFn: () => siaApi.getMasterRekening(),
  });

  const filteredAccounts = accountsData?.data?.filter(account => 
    account.kode_rek?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.nama_rek?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Convert MasterRekening to Account format and get parent accounts
  const convertedAccounts: Account[] = filteredAccounts.map(acc => ({
    code: acc.kode_rek,
    name: acc.nama_rek || '',
    balance: acc.saldo || 0,
    level: acc.level || 1,
    levelType: acc.k_level || 'Detail',
    parentCode: acc.rek_induk || '',
    division: acc.id_div || '01',
    accountType: acc.jenis_rek || 'NERACA'
  }));

  // Get potential parent accounts (excluding the account being edited)
  const parentAccounts = convertedAccounts.filter(acc => 
    acc.code !== editingAccount?.kode_rek
  );

  const handleSubmit = async (data: AccountFormValues) => {
    try {
      const masterRekeningData: Partial<MasterRekening> = {
        kode_rek: data.code,
        nama_rek: data.name,
        saldo: data.balance,
        level: data.level,
        k_level: data.levelType,
        rek_induk: data.parentCode === '-' ? ' ' : data.parentCode,
        id_div: data.division,
        jenis_rek: data.accountType
      };

      if (editingAccount) {
        await siaApi.updateMasterRekening(masterRekeningData as MasterRekening);
        toast.success('Rekening berhasil diupdate');
      } else {
        await siaApi.createMasterRekening(masterRekeningData as Omit<MasterRekening, 'created_at' | 'updated_at'>);
        toast.success('Rekening berhasil ditambahkan');
      }
      
      setEditingAccount(null);
      setIsDialogOpen(false);
      setRefreshTrigger(prev => prev + 1);
      refetch();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Gagal menyimpan rekening');
    }
  };

  const handleEdit = (account: MasterRekening) => {
    setEditingAccount(account);
    setIsDialogOpen(true);
  };

  const handleDelete = async (kodeRek: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus rekening ini?')) {
      try {
        await siaApi.deleteMasterRekening(kodeRek);
        toast.success('Rekening berhasil dihapus');
        setRefreshTrigger(prev => prev + 1);
        refetch();
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Gagal menghapus rekening');
      }
    }
  };

  const handleViewBalance = (account: MasterRekening) => {
    setSelectedAccount({ kode: account.kode_rek, nama: account.nama_rek || '' });
    setBalanceModalOpen(true);
  };

  const exportData = () => {
    const csvContent = [
      ['Kode Rekening', 'Nama Rekening', 'Saldo', 'Level', 'K-Level', 'Rekening Induk', 'Jenis'],
      ...filteredAccounts.map(account => [
        account.kode_rek,
        account.nama_rek,
        account.saldo,
        account.level,
        account.k_level,
        account.rek_induk,
        account.jenis_rek
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master-rekening-${Date.now()}.csv`;
    a.click();
  };

  const totalSaldo = filteredAccounts.reduce((sum, account) => sum + (account.saldo || 0), 0);
  const totalRekening = filteredAccounts.length;
  const rekeningNeraca = filteredAccounts.filter(acc => acc.jenis_rek === 'NERACA').length;
  const rekeningLRA = filteredAccounts.filter(acc => acc.jenis_rek === 'LRA').length;

  // Convert editing account to Account format
  const editingAccountConverted: Account | undefined = editingAccount ? {
    code: editingAccount.kode_rek,
    name: editingAccount.nama_rek || '',
    balance: editingAccount.saldo || 0,
    level: editingAccount.level || 1,
    levelType: editingAccount.k_level || 'Detail',
    parentCode: editingAccount.rek_induk || '',
    division: editingAccount.id_div || '01',
    accountType: editingAccount.jenis_rek || 'NERACA'
  } : undefined;

  return (
    <Layout title="Rekening">
      <div className="space-y-4 md:space-y-6">
        {/* Summary Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rekening</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{totalRekening}</div>
              <p className="text-xs text-muted-foreground">
                Akun aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saldo Awal</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(totalSaldo)}
              </div>
              <p className="text-xs text-muted-foreground">
                Saldo input manual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rekening Neraca</CardTitle>
              <Wallet className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">{rekeningNeraca}</div>
              <p className="text-xs text-muted-foreground">
                Akun neraca
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rekening LRA</CardTitle>
              <Wallet className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-purple-600">{rekeningLRA}</div>
              <p className="text-xs text-muted-foreground">
                Akun LRA
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <CardTitle className="text-lg md:text-xl">Master Rekening</CardTitle>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari rekening..."
                    className="pl-9 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={exportData} variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Download className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingAccount(null);
                      }} size="sm" className="flex-1 sm:flex-none">
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Tambah</span>
                        <span className="sm:hidden">+</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[90vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-base md:text-lg">
                          {editingAccount ? 'Edit Rekening' : 'Tambah Rekening Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                          Isi detail rekening untuk {editingAccount ? 'mengupdate' : 'menambahkan'} ke master rekening
                        </DialogDescription>
                      </DialogHeader>
                      
                      <AccountForm
                        account={editingAccountConverted}
                        parentAccounts={parentAccounts}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3 p-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  Loading...
                </div>
              ) : filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => (
                  <Card key={account.kode_rek} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{account.kode_rek}</div>
                        <div className="text-sm text-muted-foreground mt-1">{account.nama_rek}</div>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewBalance(account)}
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(account)}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(account.kode_rek)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Level:</span> {account.level}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Kategori:</span>
                        <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                          account.k_level === 'Induk' ? 'bg-blue-100 text-blue-700' :
                          account.k_level === 'Detail Kas' ? 'bg-green-100 text-green-700' :
                          account.k_level === 'Detail Bk' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {account.k_level}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Jenis:</span>
                        <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                          account.jenis_rek === 'NERACA' ? 'bg-purple-100 text-purple-700' :
                          account.jenis_rek === 'LRA' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {account.jenis_rek}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Saldo:</span>
                        <div className="font-medium text-right">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(account.saldo || 0)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Tidak ada data rekening yang ditemukan
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Kode Rekening
                    </th>
                    <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Nama Rekening
                    </th>
                    <th className="h-12 px-4 text-center align-middle text-xs font-medium text-muted-foreground">
                      Level
                    </th>
                    <th className="h-12 px-4 text-center align-middle text-xs font-medium text-muted-foreground">
                      Kategori
                    </th>
                    <th className="h-12 px-4 text-center align-middle text-xs font-medium text-muted-foreground">
                      Jenis
                    </th>
                    <th className="h-12 px-4 text-right align-middle text-xs font-medium text-muted-foreground">
                      Saldo Awal
                    </th>
                    <th className="h-12 px-4 text-center align-middle text-xs font-medium text-muted-foreground">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => (
                      <tr
                        key={account.kode_rek}
                        className="border-b transition-colors hover:bg-muted/30"
                      >
                        <td className="p-4 align-middle text-sm font-medium">
                          {account.kode_rek}
                        </td>
                        <td className="p-4 align-middle text-sm">
                          {account.nama_rek}
                        </td>
                        <td className="p-4 align-middle text-sm text-center">
                          {account.level}
                        </td>
                        <td className="p-4 align-middle text-sm text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            account.k_level === 'Induk' ? 'bg-blue-100 text-blue-700' :
                            account.k_level === 'Detail Kas' ? 'bg-green-100 text-green-700' :
                            account.k_level === 'Detail Bk' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {account.k_level}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-sm text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            account.jenis_rek === 'NERACA' ? 'bg-purple-100 text-purple-700' :
                            account.jenis_rek === 'LRA' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {account.jenis_rek}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-sm text-right font-medium">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(account.saldo || 0)}
                        </td>
                        <td className="p-4 align-middle text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewBalance(account)}
                              title="Lihat Saldo Terkini"
                            >
                              <Calculator className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(account)}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(account.kode_rek)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        Tidak ada data rekening yang ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Modal */}
      {selectedAccount && (
        <AccountBalanceModal
          isOpen={balanceModalOpen}
          onClose={() => setBalanceModalOpen(false)}
          kodeRek={selectedAccount.kode}
          namaRek={selectedAccount.nama}
        />
      )}
    </Layout>
  );
};

export default Accounts;

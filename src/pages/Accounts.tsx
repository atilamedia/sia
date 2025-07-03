
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountForm } from "@/components/accounts/AccountForm";
import { DeleteAccountDialog } from "@/components/accounts/DeleteAccountDialog";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { Pencil, Trash2, Search, Plus, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { useIsMobile } from "@/hooks/use-mobile";

const Accounts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [deletingAccount, setDeletingAccount] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();

  const { data: accountsData, isLoading, refetch } = useQuery({
    queryKey: ['master-rekening', refreshTrigger],
    queryFn: () => siaApi.getMasterRekening(),
  });

  const filteredAccounts = accountsData?.data?.filter(account => 
    account.kode_rek?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.nama_rek?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.jenis_rek?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setEditingAccount(null);
    setShowForm(false);
    refetch();
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = async (account: any) => {
    try {
      await siaApi.deleteMasterRekening(account.kode_rek);
      toast.success("Rekening berhasil dihapus");
      setRefreshTrigger(prev => prev + 1);
      refetch();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Gagal menghapus rekening");
    }
    setDeletingAccount(null);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Daftar Master Rekening'],
      [''],
      ['Total Rekening', filteredAccounts.length],
      [''],
      ['Tanggal Export', new Date().toLocaleDateString('id-ID')]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    // Detail sheet
    if (filteredAccounts.length > 0) {
      const detailSheet = XLSX.utils.json_to_sheet(
        filteredAccounts.map(account => ({
          'Kode Rekening': account.kode_rek,
          'Nama Rekening': account.nama_rek,
          'Jenis Rekening': account.jenis_rek,
          'Level': account.k_level,
          'Level Angka': account.level,
          'Rekening Induk': account.rek_induk,
          'Saldo': account.saldo || 0,
          'Divisi': account.id_div
        }))
      );
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Master Rekening');
    }

    const fileName = `master-rekening-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Master Rekening</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f5f5f5; }
          .positive { color: #10B981; }
          .negative { color: #EF4444; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Master Rekening</h1>
          <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
        </div>
        
        <div class="summary">
          <h2>Ringkasan</h2>
          <div class="summary-item">
            <span>Total Rekening:</span>
            <span><strong>${filteredAccounts.length}</strong></span>
          </div>
        </div>

        <div>
          <h2>Daftar Rekening</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Rekening</th>
                <th>Jenis</th>
                <th>Level</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAccounts.map(account => `
                <tr>
                  <td>${account.kode_rek}</td>
                  <td>${account.nama_rek}</td>
                  <td>${account.jenis_rek}</td>
                  <td>${account.k_level}</td>
                  <td class="${(account.saldo || 0) >= 0 ? 'positive' : 'negative'}">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(account.saldo || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Layout title="Master Rekening">
      <div className="space-y-4 md:space-y-6 p-2 md:p-0">
        {/* Header */}
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Master Rekening</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Kelola daftar rekening akuntansi perusahaan
            </p>
          </div>
          <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-2">
            <div className="flex space-x-2">
              <Button onClick={exportToExcel} variant="outline" size={isMobile ? "sm" : "default"}>
                <FileSpreadsheet className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                {!isMobile && "Excel"}
              </Button>
              <Button onClick={exportToPDF} variant="outline" size={isMobile ? "sm" : "default"}>
                <FileText className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                {!isMobile && "PDF"}
              </Button>
            </div>
            <Button onClick={() => setShowForm(true)} size={isMobile ? "sm" : "default"}>
              <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              {isMobile ? "Tambah" : "Tambah Rekening"}
            </Button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg md:text-xl">
                  {editingAccount ? 'Edit Rekening' : 'Tambah Rekening Baru'}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingAccount(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AccountForm 
                onSuccess={handleFormSuccess}
                editData={editingAccount}
              />
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-lg md:text-xl">Daftar Rekening</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari rekening..."
                  className="pl-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            {/* Mobile Card View */}
            {isMobile ? (
              <div className="divide-y">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <div key={account.kode_rek} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{account.kode_rek}</div>
                          <div className="text-xs text-muted-foreground">{account.nama_rek}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold text-sm ${(account.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                              notation: 'compact',
                              compactDisplay: 'short'
                            }).format(account.saldo || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex space-x-2">
                          <span className="bg-muted px-2 py-1 rounded text-xs">{account.jenis_rek}</span>
                          <span className="bg-muted px-2 py-1 rounded text-xs">{account.k_level}</span>
                        </div>
                        {account.rek_induk && (
                          <div className="text-xs text-muted-foreground">Induk: {account.rek_induk}</div>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 mt-3 pt-2 border-t">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(account)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeletingAccount(account)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Tidak ada rekening yang ditemukan
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Table View */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                        Kode
                      </th>
                      <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                        Nama Rekening
                      </th>
                      <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                        Jenis
                      </th>
                      <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                        Level
                      </th>
                      <th className="h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                        Induk
                      </th>
                      <th className="h-12 px-4 text-right align-middle text-xs font-medium text-muted-foreground">
                        Saldo
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
                          <td className="p-4 align-middle text-sm">
                            <span className="bg-muted px-2 py-1 rounded text-xs">
                              {account.jenis_rek}
                            </span>
                          </td>
                          <td className="p-4 align-middle text-sm">
                            <span className="bg-muted px-2 py-1 rounded text-xs">
                              {account.k_level}
                            </span>
                          </td>
                          <td className="p-4 align-middle text-sm text-muted-foreground">
                            {account.rek_induk || '-'}
                          </td>
                          <td className={`p-4 align-middle text-sm text-right font-medium ${(account.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                                onClick={() => handleEdit(account)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => setDeletingAccount(account)}
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
                          Tidak ada rekening yang ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <DeleteAccountDialog
          account={deletingAccount}
          onClose={() => setDeletingAccount(null)}
          onConfirm={() => handleDelete(deletingAccount)}
        />
      </div>
    </Layout>
  );
};

export default Accounts;

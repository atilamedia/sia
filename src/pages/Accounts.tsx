
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { sampleAccounts } from "@/lib/data";
import { Account } from "@/lib/types";
import { Download, Plus, Search, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AccountForm, AccountFormValues } from "@/components/accounts/AccountForm";
import { DeleteAccountDialog } from "@/components/accounts/DeleteAccountDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>(sampleAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const { toast } = useToast();

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    account.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parentAccounts = accounts.filter(account => 
    account.levelType === "Induk" || account.levelType === "Sendiri"
  );

  const handleAddAccount = () => {
    setCurrentAccount(null);
    setFormOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setCurrentAccount(account);
    setFormOpen(true);
  };

  const handleDeleteAccount = (account: Account) => {
    setCurrentAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: AccountFormValues) => {
    if (currentAccount) {
      // Update existing account
      const updatedAccounts = accounts.map(account => 
        account.code === currentAccount.code ? { ...account, ...data } : account
      );
      setAccounts(updatedAccounts);
      toast({
        title: "Rekening diperbarui",
        description: `Rekening ${data.name} berhasil diperbarui.`,
      });
    } else {
      // Add new account - ensure all required properties are provided
      const newAccount: Account = {
        code: data.code,
        name: data.name,
        level: data.level,
        levelType: data.levelType,
        parentCode: data.parentCode || "",
        division: data.division || "01",
        accountType: data.accountType,
        balance: data.balance || 0
      };
      setAccounts([...accounts, newAccount]);
      toast({
        title: "Rekening ditambahkan",
        description: `Rekening ${data.name} berhasil ditambahkan.`,
      });
    }
    setFormOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (currentAccount) {
      const filteredAccounts = accounts.filter(account => account.code !== currentAccount.code);
      setAccounts(filteredAccounts);
      toast({
        title: "Rekening dihapus",
        description: `Rekening ${currentAccount.name} berhasil dihapus.`,
      });
      setDeleteDialogOpen(false);
    }
  };

  const exportToExcel = () => {
    toast({
      title: "Data diexport",
      description: "Data rekening berhasil diexport ke Excel.",
    });
  };

  return (
    <Layout title="Rekening">
      <div className="container px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Rekening</h2>
            <p className="text-muted-foreground">
              Kelola semua rekening untuk transaksi keuangan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button onClick={handleAddAccount}>
              <Plus className="mr-2 h-4 w-4" />
              Rekening Baru
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari rekening..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="mt-6 overflow-hidden border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Rekening</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Induk</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.levelType}</TableCell>
                        <TableCell>{account.parentCode || "-"}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(account.balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteAccount(account)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Tidak ada data rekening
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentAccount ? "Edit Rekening" : "Tambah Rekening Baru"}
            </DialogTitle>
          </DialogHeader>
          <AccountForm
            account={currentAccount || undefined}
            parentAccounts={parentAccounts}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteAccountDialog
        account={currentAccount}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </Layout>
  );
}

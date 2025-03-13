
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CashFlow as CashFlowType } from "@/lib/types";
import { sampleCashFlows } from "@/lib/data";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  Download, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  MoreHorizontal 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateId } from "@/lib/utils";
import { sampleAccounts } from "@/lib/data";

export default function CashFlow() {
  const [cashFlows, setCashFlows] = useState<CashFlowType[]>(sampleCashFlows);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "in" | "out">("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFlow, setEditingFlow] = useState<CashFlowType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<CashFlowType | null>(null);
  const { toast } = useToast();
  
  const filteredCashFlows = cashFlows.filter(flow => {
    const matchesSearch = flow.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        flow.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || 
                      (filterType === "in" && flow.code.startsWith("CI")) || 
                      (filterType === "out" && flow.code.startsWith("CO"));
    return matchesSearch && matchesType;
  });

  const handleCreateNew = () => {
    setEditingFlow(null);
    setOpenDialog(true);
  };

  const handleEdit = (flow: CashFlowType) => {
    setEditingFlow(flow);
    setOpenDialog(true);
  };

  const handleDelete = (flow: CashFlowType) => {
    setFlowToDelete(flow);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (flowToDelete) {
      setCashFlows(cashFlows.filter(flow => flow.code !== flowToDelete.code));
      toast({
        title: "Transaksi dihapus",
        description: `Transaksi ${flowToDelete.code} berhasil dihapus.`,
      });
      setIsDeleteDialogOpen(false);
      setFlowToDelete(null);
    }
  };

  const exportToExcel = () => {
    // In a real app, you'd implement actual Excel export
    // For now we'll just show a toast notification
    toast({
      title: "Data diexport",
      description: "Data arus kas berhasil diexport ke Excel.",
    });
  };

  return (
    <Layout title="Arus Kas">
      <div className="container px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Arus Kas</h2>
            <p className="text-muted-foreground">
              Kelola semua transaksi arus kas masuk dan keluar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Transaksi Baru
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setFilterType("all")}>Semua</TabsTrigger>
              <TabsTrigger value="in" onClick={() => setFilterType("in")}>Kas Masuk</TabsTrigger>
              <TabsTrigger value="out" onClick={() => setFilterType("out")}>Kas Keluar</TabsTrigger>
            </TabsList>
            
            <div className="flex w-full sm:w-auto gap-2">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari transaksi..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <CashFlowTable 
              cashFlows={filteredCashFlows} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>
          <TabsContent value="in" className="mt-0">
            <CashFlowTable 
              cashFlows={filteredCashFlows} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>
          <TabsContent value="out" className="mt-0">
            <CashFlowTable 
              cashFlows={filteredCashFlows} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CashFlowFormDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
        editingFlow={editingFlow}
        onSave={(newFlow) => {
          if (editingFlow) {
            // Update existing flow
            setCashFlows(cashFlows.map(flow => 
              flow.code === editingFlow.code ? newFlow : flow
            ));
            toast({
              title: "Transaksi diperbarui",
              description: `Transaksi ${newFlow.code} berhasil diperbarui.`,
            });
          } else {
            // Add new flow
            setCashFlows([...cashFlows, newFlow]);
            toast({
              title: "Transaksi baru dibuat",
              description: `Transaksi ${newFlow.code} berhasil ditambahkan.`,
            });
          }
        }}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Transaksi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus transaksi {flowToDelete?.code}?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function CashFlowTable({ 
  cashFlows,
  onEdit,
  onDelete
}: { 
  cashFlows: CashFlowType[];
  onEdit: (flow: CashFlowType) => void;
  onDelete: (flow: CashFlowType) => void;
}) {
  return (
    <Card className="overflow-hidden border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left font-medium">Kode</th>
                <th className="h-10 px-4 text-left font-medium">Tanggal</th>
                <th className="h-10 px-4 text-left font-medium">Rekening</th>
                <th className="h-10 px-4 text-left font-medium">Deskripsi</th>
                <th className="h-10 px-4 text-left font-medium">Jenis</th>
                <th className="h-10 px-4 text-right font-medium">Jumlah</th>
                <th className="h-10 px-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cashFlows.length > 0 ? (
                cashFlows.map((flow) => (
                  <tr key={flow.code} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-medium">{flow.code}</td>
                    <td className="p-4">{formatDate(flow.date)}</td>
                    <td className="p-4">
                      <div className="font-medium">{flow.accountName}</div>
                      <div className="text-xs text-muted-foreground">{flow.accountCode}</div>
                    </td>
                    <td className="p-4 max-w-[300px] truncate">{flow.description}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${flow.code.startsWith('CI') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {flow.code.startsWith('CI') ? (
                            <>
                              <ArrowUpRight className="h-3 w-3" />
                              Kas Masuk
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="h-3 w-3" />
                              Kas Keluar
                            </>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium">
                      <span className={flow.code.startsWith('CI') ? 'text-green-600' : 'text-red-600'}>
                        {flow.code.startsWith('CI') ? '+' : '-'}{formatCurrency(flow.amount)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(flow)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(flow)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    Tidak ada data transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface CashFlowFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFlow: CashFlowType | null;
  onSave: (flow: CashFlowType) => void;
}

function CashFlowFormDialog({ 
  open, 
  onOpenChange, 
  editingFlow,
  onSave 
}: CashFlowFormDialogProps) {
  const [formData, setFormData] = useState<Partial<CashFlowType>>({
    code: '',
    date: new Date().toISOString().split('T')[0],
    accountCode: '',
    accountName: '',
    amount: 0,
    description: '',
    payer: '',
    receiver: '',
    checkNumber: '',
    division: '01',
    user: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [flowType, setFlowType] = useState<'in' | 'out'>('in');

  // Reset form when dialog opens/closes or editing flow changes
  useState(() => {
    if (editingFlow) {
      setFormData(editingFlow);
      setFlowType(editingFlow.code.startsWith('CI') ? 'in' : 'out');
    } else {
      setFormData({
        code: '',
        date: new Date().toISOString().split('T')[0],
        accountCode: '',
        accountName: '',
        amount: 0,
        description: '',
        payer: '',
        receiver: '',
        checkNumber: '',
        division: '01',
        user: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setFlowType('in');
    }
  });

  const handleSave = () => {
    // Generate code for new entries
    let code = formData.code;
    if (!editingFlow) {
      const prefix = flowType === 'in' ? 'CI-' : 'CO-';
      const currentYear = new Date().getFullYear();
      const randomId = Math.floor(1000 + Math.random() * 9000);
      code = `${prefix}${currentYear}-${randomId}`;
    }

    const newFlow: CashFlowType = {
      ...(formData as CashFlowType),
      code: code || '',
      updatedAt: new Date().toISOString()
    };

    onSave(newFlow);
    onOpenChange(false);
  };

  const handleAccountChange = (accountCode: string) => {
    const account = sampleAccounts.find(acc => acc.code === accountCode);
    if (account) {
      setFormData({
        ...formData,
        accountCode,
        accountName: account.name
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingFlow ? 'Edit Transaksi' : 'Transaksi Baru'}
          </DialogTitle>
          <DialogDescription>
            {editingFlow 
              ? 'Edit detail transaksi arus kas di bawah ini.' 
              : 'Tambahkan transaksi arus kas baru.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!editingFlow && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="flowType" className="text-right">
                Jenis Transaksi
              </Label>
              <div className="col-span-3">
                <Select 
                  value={flowType} 
                  onValueChange={(value: 'in' | 'out') => setFlowType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Kas Masuk</SelectItem>
                    <SelectItem value="out">Kas Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Tanggal
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date?.toString().split('T')[0]}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account" className="text-right">
              Rekening
            </Label>
            <div className="col-span-3">
              <Select 
                value={formData.accountCode} 
                onValueChange={handleAccountChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih rekening" />
                </SelectTrigger>
                <SelectContent>
                  {sampleAccounts.map(account => (
                    <SelectItem key={account.code} value={account.code}>
                      {account.name} ({account.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Jumlah
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Deskripsi
            </Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          {flowType === 'in' ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payer" className="text-right">
                Pembayar
              </Label>
              <Input
                id="payer"
                name="payer"
                value={formData.payer || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiver" className="text-right">
                Penerima
              </Label>
              <Input
                id="receiver"
                name="receiver"
                value={formData.receiver || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="checkNumber" className="text-right">
              Nomor Cek
            </Label>
            <Input
              id="checkNumber"
              name="checkNumber"
              value={formData.checkNumber || ''}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="submit" onClick={handleSave}>
            {editingFlow ? 'Perbarui' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

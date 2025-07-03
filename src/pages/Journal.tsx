import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JurnalForm } from "@/components/sia/JurnalForm";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, Download, FileEdit, Trash2, BookOpen } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const Journal = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingJurnal, setEditingJurnal] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingJurnalId, setDeletingJurnalId] = useState<string>("");
  const { toast } = useToast();

  const { data: jurnalData, isLoading, refetch } = useQuery({
    queryKey: ['jurnal', date?.from, date?.to, refreshTrigger],
    queryFn: () => siaApi.getJurnal(
      date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
    ),
  });

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    refetch();
  };

  const handleEdit = (jurnal: any) => {
    console.log('Editing jurnal:', jurnal);
    setEditingJurnal(jurnal);
    setIsEditFormOpen(true);
  };

  const handleDelete = (id_ju: string) => {
    setDeletingJurnalId(id_ju);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await siaApi.deleteJurnal(deletingJurnalId);
      toast({
        title: "Berhasil",
        description: "Jurnal berhasil dihapus",
      });
      handleFormSuccess();
    } catch (error) {
      console.error('Delete jurnal error:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus jurnal",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
    setDeletingJurnalId("");
  };

  const handleEditSave = async (entries: any[]) => {
    try {
      if (!editingJurnal) return;
      
      const updateData = {
        tanggal: editingJurnal.tanggal,
        usernya: editingJurnal.usernya,
        id_div: editingJurnal.id_div,
        id_jj: editingJurnal.id_jj,
        entries: entries.map(entry => ({
          kode_rek: entry.accountCode,
          deskripsi: entry.description,
          debit: entry.debit,
          kredit: entry.credit
        }))
      };

      await siaApi.updateJurnal(editingJurnal.id_ju, updateData);
      toast({
        title: "Berhasil",
        description: "Jurnal berhasil diupdate",
      });
      setIsEditFormOpen(false);
      setEditingJurnal(null);
      handleFormSuccess();
    } catch (error) {
      console.error('Update jurnal error:', error);
      toast({
        title: "Error",
        description: "Gagal mengupdate jurnal",
        variant: "destructive",
      });
    }
  };

  const filteredData = jurnalData?.data?.filter(item => 
    item.id_ju?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jurnal_jenis?.nm_jj?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalEntries = filteredData.reduce((sum, item) => sum + (item.jurnal?.length || 0), 0);
  const totalDebit = filteredData.reduce((sum, item) => 
    sum + (item.jurnal?.reduce((debitSum, entry) => debitSum + (entry.debit || 0), 0) || 0), 0
  );
  const totalKredit = filteredData.reduce((sum, item) => 
    sum + (item.jurnal?.reduce((kreditSum, entry) => kreditSum + (entry.kredit || 0), 0) || 0), 0
  );

  const exportData = () => {
    const csvContent = [
      ['ID Jurnal', 'Tanggal', 'Jenis', 'Rekening', 'Deskripsi', 'Debit', 'Kredit'],
      ...filteredData.flatMap(item => 
        item.jurnal?.map(entry => [
          item.id_ju,
          item.tanggal,
          item.jurnal_jenis?.nm_jj,
          entry.kode_rek,
          entry.deskripsi,
          entry.debit,
          entry.kredit
        ]) || []
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jurnal-${Date.now()}.csv`;
    a.click();
  };

  return (
    <Layout title="Jurnal">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div>
            <JurnalForm onSuccess={handleFormSuccess} />
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Jurnal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Jurnal:</span>
                    <span className="font-bold">{filteredData.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Entries:</span>
                    <span className="font-bold">{totalEntries}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Debit:</span>
                    <span className="font-bold text-blue-600">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(totalDebit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Kredit:</span>
                    <span className="font-bold text-green-600">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(totalKredit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span>Balance:</span>
                    <span className={`font-bold ${totalDebit === totalKredit ? 'text-green-600' : 'text-red-600'}`}>
                      {totalDebit === totalKredit ? 'Balanced' : 'Unbalanced'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Form digunakan untuk mencatat transaksi akuntansi dengan metode double entry</p>
                  <p>• Total debit harus sama dengan total kredit (balance)</p>
                  <p>• ID jurnal di-generate otomatis dengan format JU+YYYYMMDD+NNN</p>
                  <p>• Setiap entry harus memiliki deskripsi yang jelas untuk keperluan audit</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Table Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Daftar Jurnal Umum</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari jurnal..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DateRangePicker 
                  dateRange={date} 
                  onDateRangeChange={setDate}
                />
                <Button onClick={exportData} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading...
                </div>
              ) : filteredData.length > 0 ? (
                filteredData.map((jurnal) => (
                  <Card key={jurnal.id_ju} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{jurnal.id_ju}</span>
                          <span className="text-sm text-muted-foreground">
                            - {jurnal.tanggal}
                          </span>
                          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {jurnal.jurnal_jenis?.nm_jj}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(jurnal)}
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(jurnal.id_ju)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium">Rekening</th>
                              <th className="text-left p-2 font-medium">Deskripsi</th>
                              <th className="text-right p-2 font-medium">Debit</th>
                              <th className="text-right p-2 font-medium">Kredit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jurnal.jurnal?.map((entry, index) => (
                              <tr key={index} className="border-b last:border-b-0">
                                <td className="p-2">
                                  <div className="font-medium">{entry.kode_rek}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {entry.m_rekening?.nama_rek}
                                  </div>
                                </td>
                                <td className="p-2">{entry.deskripsi}</td>
                                <td className="p-2 text-right font-medium text-blue-600">
                                  {entry.debit > 0 ? new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                  }).format(entry.debit) : '-'}
                                </td>
                                <td className="p-2 text-right font-medium text-green-600">
                                  {entry.kredit > 0 ? new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                  }).format(entry.kredit) : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-between text-sm font-medium">
                        <span>Total:</span>
                        <div className="flex space-x-4">
                          <span className="text-blue-600">
                            Debit: {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(jurnal.jurnal?.reduce((sum, entry) => sum + (entry.debit || 0), 0) || 0)}
                          </span>
                          <span className="text-green-600">
                            Kredit: {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(jurnal.jurnal?.reduce((sum, entry) => sum + (entry.kredit || 0), 0) || 0)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Tidak ada data jurnal yang ditemukan
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form Dialog */}
      <JournalEntryForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setEditingJurnal(null);
        }}
        onSave={handleEditSave}
        journalTypes={[{ id: 'JU', name: 'Jurnal Umum' }]}
        initialEntries={editingJurnal?.jurnal?.map((entry: any) => ({
          code: editingJurnal.id_ju,
          date: editingJurnal.tanggal,
          accountCode: entry.kode_rek,
          description: entry.deskripsi,
          debit: entry.debit,
          credit: entry.kredit,
          user: editingJurnal.usernya,
          createdAt: editingJurnal.at_create
        }))}
        isEditing={true}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jurnal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jurnal {deletingJurnalId}? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Journal;

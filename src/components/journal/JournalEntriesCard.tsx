
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookText, Edit, Trash2 } from "lucide-react";
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
import { useState } from "react";

interface JournalEntry {
  kode_rek: string;
  deskripsi: string;
  debit: number;
  kredit: number;
  m_rekening?: {
    nama_rek: string;
  };
}

interface JournalData {
  id_ju: string;
  tanggal: string;
  usernya: string;
  jurnal_jenis?: {
    nm_jj: string;
  };
  jurnal: JournalEntry[];
}

interface JournalEntriesCardProps {
  journal: JournalData;
  onEdit: (journal: JournalData) => void;
  onDelete: (id: string) => void;
}

export function JournalEntriesCard({ journal, onEdit, onDelete }: JournalEntriesCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Calculate totals
  const totalDebit = journal.jurnal?.reduce((sum, entry) => sum + (entry.debit || 0), 0) || 0;
  const totalCredit = journal.jurnal?.reduce((sum, entry) => sum + (entry.kredit || 0), 0) || 0;

  const handleDelete = () => {
    onDelete(journal.id_ju);
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{journal.id_ju}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end text-sm">
                <span>{formatDate(journal.tanggal)}</span>
                <span className="text-muted-foreground">Oleh: {journal.usernya}</span>
              </div>
              <div className="flex gap-1 ml-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(journal)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              </div>
            </div>
          </div>
          {journal.jurnal_jenis && (
            <div className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded w-fit">
              {journal.jurnal_jenis.nm_jj}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="h-10 px-4 text-left font-medium">Kode Akun</th>
                  <th className="h-10 px-4 text-left font-medium">Deskripsi</th>
                  <th className="h-10 px-4 text-right font-medium">Debit</th>
                  <th className="h-10 px-4 text-right font-medium">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {journal.jurnal?.map((entry, index) => (
                  <tr key={`${journal.id_ju}-${entry.kode_rek}-${index}`} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-medium">{entry.kode_rek}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.m_rekening?.nama_rek}
                      </div>
                    </td>
                    <td className="p-4">{entry.deskripsi}</td>
                    <td className="p-4 text-right">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                    </td>
                    <td className="p-4 text-right">
                      {entry.kredit > 0 ? formatCurrency(entry.kredit) : '-'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/20 font-medium">
                  <td colSpan={2} className="p-4 text-right">Total</td>
                  <td className="p-4 text-right">{formatCurrency(totalDebit)}</td>
                  <td className="p-4 text-right">{formatCurrency(totalCredit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jurnal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jurnal {journal.id_ju}? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

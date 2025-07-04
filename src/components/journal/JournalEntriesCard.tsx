
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { JournalEntry } from "@/lib/types";
import { BookText, Pencil, Trash } from "lucide-react";
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

interface JournalEntriesCardProps {
  code: string;
  entries: JournalEntry[];
  onEdit: (entries: JournalEntry[]) => void;
  onDelete: (code: string) => void;
}

export function JournalEntriesCard({ code, entries, onEdit, onDelete }: JournalEntriesCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const firstEntry = entries[0];
  
  // Calculate totals
  const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);

  const handleDelete = () => {
    onDelete(code);
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{code}</CardTitle>
            </div>
            <div className="flex flex-col items-end text-sm">
              <span>{formatDate(firstEntry.date)}</span>
              <span className="text-muted-foreground">Oleh: {firstEntry.user}</span>
            </div>
          </div>
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
                {entries.map((entry, index) => (
                  <tr key={`${entry.code}-${entry.accountCode}-${index}`} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-medium">{entry.accountCode}</td>
                    <td className="p-4">{entry.description}</td>
                    <td className="p-4 text-right">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                    </td>
                    <td className="p-4 text-right">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
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
          <div className="flex justify-end p-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(entries)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jurnal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jurnal {code}? Tindakan ini tidak dapat dibatalkan.
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

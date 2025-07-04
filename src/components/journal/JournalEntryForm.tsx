
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JournalEntry, JournalType } from "@/lib/types";
import { formatDate, generateId } from "@/lib/utils";
import { sampleAccounts } from "@/lib/data";

interface JournalEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entries: JournalEntry[]) => void;
  journalTypes: JournalType[];
  initialEntries?: JournalEntry[];
  isEditing?: boolean;
}

export function JournalEntryForm({
  isOpen,
  onClose,
  onSave,
  journalTypes,
  initialEntries,
  isEditing = false
}: JournalEntryFormProps) {
  const [journalCode, setJournalCode] = useState("");
  const [journalDate, setJournalDate] = useState(formatDate(new Date()));
  const [journalType, setJournalType] = useState(journalTypes[0]?.id || "");
  const [entries, setEntries] = useState<Array<{ accountCode: string; description: string; debit: number; credit: number }>>([
    { accountCode: "", description: "", debit: 0, credit: 0 }
  ]);

  // Initialize form data when modal opens or initialEntries change
  useEffect(() => {
    if (isOpen) {
      if (initialEntries && initialEntries.length > 0) {
        console.log('Loading initial entries:', initialEntries);
        
        // Set journal header data from first entry
        const firstEntry = initialEntries[0];
        setJournalCode(firstEntry.code || "");
        setJournalDate(firstEntry.date || formatDate(new Date()));
        
        // Map all entries to form format
        const mappedEntries = initialEntries.map(entry => ({
          accountCode: entry.accountCode || "",
          description: entry.description || "",
          debit: entry.debit || 0,
          credit: entry.credit || 0
        }));
        
        setEntries(mappedEntries);
        console.log('Mapped entries:', mappedEntries);
      } else {
        // Reset to default values for new entry
        setJournalCode("");
        setJournalDate(formatDate(new Date()));
        setJournalType(journalTypes[0]?.id || "");
        setEntries([{ accountCode: "", description: "", debit: 0, credit: 0 }]);
      }
    }
  }, [isOpen, initialEntries, journalTypes]);

  const addEntry = () => {
    setEntries([...entries, { accountCode: "", description: "", debit: 0, credit: 0 }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: string, value: string | number) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setEntries(updatedEntries);
  };

  const handleSave = () => {
    const totalDebit = entries.reduce((sum, entry) => sum + Number(entry.debit), 0);
    const totalCredit = entries.reduce((sum, entry) => sum + Number(entry.credit), 0);
    
    if (totalDebit !== totalCredit) {
      alert("Total debit dan kredit harus sama!");
      return;
    }
    
    const newCode = isEditing ? journalCode : `JRN-${new Date().getFullYear()}-${generateId("").slice(0, 4)}`;
    
    const journalEntries: JournalEntry[] = entries.map(entry => ({
      code: newCode,
      date: journalDate,
      accountCode: entry.accountCode,
      description: entry.description,
      debit: Number(entry.debit),
      credit: Number(entry.credit),
      user: "admin",
      createdAt: new Date().toISOString()
    }));
    
    onSave(journalEntries);
    onClose();
  };

  const calculateTotals = () => {
    const totalDebit = entries.reduce((sum, entry) => sum + Number(entry.debit), 0);
    const totalCredit = entries.reduce((sum, entry) => sum + Number(entry.credit), 0);
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = totalDebit === totalCredit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Jurnal" : "Tambah Jurnal Baru"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="journalCode">Nomor Jurnal</Label>
              <Input
                id="journalCode"
                value={journalCode}
                onChange={(e) => setJournalCode(e.target.value)}
                disabled={isEditing}
                placeholder="Nomor jurnal akan di-generate otomatis"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={journalDate}
                onChange={(e) => setJournalDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="journalType">Jenis Jurnal</Label>
            <Select
              value={journalType}
              onValueChange={setJournalType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis jurnal" />
              </SelectTrigger>
              <SelectContent>
                {journalTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="font-medium mb-2">Detail Jurnal</div>
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-3">
                    <Label htmlFor={`account-${index}`}>Kode Akun</Label>
                    <Select
                      value={entry.accountCode}
                      onValueChange={(value) => updateEntry(index, "accountCode", value)}
                    >
                      <SelectTrigger id={`account-${index}`}>
                        <SelectValue placeholder="Pilih akun" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleAccounts.map((account) => (
                          <SelectItem key={account.code} value={account.code}>
                            {account.code} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-3">
                    <Label htmlFor={`description-${index}`}>Deskripsi</Label>
                    <Input
                      id={`description-${index}`}
                      value={entry.description}
                      onChange={(e) => updateEntry(index, "description", e.target.value)}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor={`debit-${index}`}>Debit</Label>
                    <Input
                      id={`debit-${index}`}
                      type="number"
                      min="0"
                      value={entry.debit}
                      onChange={(e) => updateEntry(index, "debit", Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor={`credit-${index}`}>Kredit</Label>
                    <Input
                      id={`credit-${index}`}
                      type="number"
                      min="0"
                      value={entry.credit}
                      onChange={(e) => updateEntry(index, "credit", Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="col-span-2 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEntry(index)}
                      disabled={entries.length <= 1}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addEntry}>
                Tambah Baris
              </Button>
              
              <div className="flex justify-between pt-2 border-t mt-4">
                <div className="font-medium">Total</div>
                <div className="space-x-4">
                  <span className={`font-medium ${!isBalanced ? 'text-destructive' : ''}`}>
                    Debit: {totalDebit.toLocaleString('id-ID')}
                  </span>
                  <span className={`font-medium ${!isBalanced ? 'text-destructive' : ''}`}>
                    Kredit: {totalCredit.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              
              {!isBalanced && (
                <div className="text-destructive text-sm">
                  Total debit dan kredit harus sama
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={!isBalanced}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

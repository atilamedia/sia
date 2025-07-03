import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Division {
  id_div: string;
  nama_div: string;
}

interface JournalType {
  id_jj: string;
  nm_jj: string;
}

interface Account {
  kode_rek: string;
  nama_rek: string;
}

interface JournalEntry {
  kode_rek: string;
  deskripsi: string;
  debit: number;
  kredit: number;
}

export function JurnalForm() {
  const [divisi, setDivisi] = useState("");
  const [jenisJurnal, setJenisJurnal] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([
    { kode_rek: "", deskripsi: "", debit: 0, kredit: 0 },
  ]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [journalTypes, setJournalTypes] = useState<JournalType[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch divisions
    fetch("https://next-full-app-lovy-lovanto.vercel.app/api/divisions")
      .then((res) => res.json())
      .then((data) => setDivisions(data))
      .catch((error) => {
        console.error("Error fetching divisions:", error);
        toast({
          title: "Error",
          description: "Failed to load divisions.",
          variant: "destructive",
        });
      });

    // Fetch journal types
    fetch("https://next-full-app-lovy-lovanto.vercel.app/api/journal-types")
      .then((res) => res.json())
      .then((data) => setJournalTypes(data))
      .catch((error) => {
        console.error("Error fetching journal types:", error);
        toast({
          title: "Error",
          description: "Failed to load journal types.",
          variant: "destructive",
        });
      });

    // Fetch accounts
    fetch("https://next-full-app-lovy-lovanto.vercel.app/api/accounts")
      .then((res) => res.json())
      .then((data) => setAccounts(data))
      .catch((error) => {
        console.error("Error fetching accounts:", error);
        toast({
          title: "Error",
          description: "Failed to load accounts.",
          variant: "destructive",
        });
      });
  }, [toast]);

  const addEntry = () => {
    setEntries([...entries, { kode_rek: "", deskripsi: "", debit: 0, kredit: 0 }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      const newEntries = [...entries];
      newEntries.splice(index, 1);
      setEntries(newEntries);
    } else {
      toast({
        title: "Warning",
        description: "Cannot remove the last entry.",
      });
    }
  };

  const updateEntry = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  const totalDebit = entries.reduce((acc, entry) => acc + entry.debit, 0);
  const totalKredit = entries.reduce((acc, entry) => acc + entry.kredit, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const jurnalData = {
      id_div: divisi,
      id_jj: jenisJurnal,
      tanggal: tanggal,
      details: entries.map((entry) => ({
        kode_rek: entry.kode_rek,
        deskripsi: entry.deskripsi,
        debit: entry.debit,
        kredit: entry.kredit,
      })),
    };

    try {
      const response = await fetch(
        "https://next-full-app-lovy-lovanto.vercel.app/api/journals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jurnalData),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Jurnal berhasil disimpan!",
        });
        // Reset form
        setDivisi("");
        setJenisJurnal("");
        setTanggal("");
        setEntries([{ kode_rek: "", deskripsi: "", debit: 0, kredit: 0 }]);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to save journal: ${
            errorData.message || "Unknown error"
          }`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error submitting journal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save journal.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Form Jurnal Umum</CardTitle>
            <CardDescription>Buat entri jurnal umum baru</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <HelpCircle className="w-4 h-4" />
                <span className="sr-only">Help</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Informasi Jurnal Umum</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Cara Penggunaan:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Pilih divisi dan jenis jurnal</li>
                    <li>Masukkan tanggal transaksi</li>
                    <li>
                      Tambahkan detail jurnal dengan kode rekening, keterangan,
                      dan nominal
                    </li>
                    <li>Pastikan total debet sama dengan total kredit</li>
                    <li>Klik simpan untuk menyimpan jurnal</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Catatan Penting:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Setiap jurnal harus seimbang (debet = kredit)</li>
                    <li>Keterangan harus jelas dan informatif</li>
                    <li>Pilih kode rekening yang sesuai</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Form - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="divisi">Divisi</Label>
                <Select value={divisi} onValueChange={setDivisi}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div.id_div} value={div.id_div}>
                        {div.nama_div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="jenis">Jenis Jurnal</Label>
                <Select value={jenisJurnal} onValueChange={setJenisJurnal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    {journalTypes.map((type) => (
                      <SelectItem key={type.id_jj} value={type.id_jj}>
                        {type.nm_jj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Detail Jurnal Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <Label className="text-base font-medium">Detail Jurnal</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEntry}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Baris
                </Button>
              </div>

              {/* Responsive Detail Entries */}
              <div className="space-y-4">
                {entries.map((entry, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Kode Rekening */}
                      <div>
                        <Label>Kode Rekening</Label>
                        <Select
                          value={entry.kode_rek}
                          onValueChange={(value) =>
                            updateEntry(index, "kode_rek", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Rekening" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((account) => (
                              <SelectItem
                                key={account.kode_rek}
                                value={account.kode_rek}
                              >
                                {account.kode_rek} - {account.nama_rek}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Remove Button - Desktop */}
                      <div className="hidden lg:flex justify-end items-start">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeEntry(index)}
                          disabled={entries.length === 1}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </div>

                      {/* Deskripsi - Full width */}
                      <div className="lg:col-span-2">
                        <Label>Keterangan</Label>
                        <Textarea
                          value={entry.deskripsi}
                          onChange={(e) =>
                            updateEntry(index, "deskripsi", e.target.value)
                          }
                          rows={3}
                          placeholder="Masukkan keterangan transaksi..."
                          required
                        />
                      </div>

                      {/* Debit dan Kredit - Responsive */}
                      <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                        <div>
                          <Label>Debet</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={entry.debit}
                            onChange={(e) =>
                              updateEntry(
                                index,
                                "debit",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="text-right"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label>Kredit</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={entry.kredit}
                            onChange={(e) =>
                              updateEntry(
                                index,
                                "kredit",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="text-right"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Remove Button - Mobile */}
                      <div className="flex lg:hidden justify-end lg:col-span-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeEntry(index)}
                          disabled={entries.length === 1}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Total - Responsive */}
            <div className="p-4 bg-gray-50 rounded">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Total Debet:</span>
                  <span>Rp {totalDebit.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Kredit:</span>
                  <span>Rp {totalKredit.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Selisih:</span>
                  <span
                    className={cn(
                      "font-bold",
                      Math.abs(totalDebit - totalKredit) > 0
                        ? "text-red-600"
                        : "text-green-600"
                    )}
                  >
                    Rp{" "}
                    {Math.abs(totalDebit - totalKredit).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button - Full width on mobile */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button
                type="submit"
                disabled={isLoading || Math.abs(totalDebit - totalKredit) > 0}
                className="flex-1 sm:flex-initial"
              >
                {isLoading ? "Menyimpan..." : "Simpan Jurnal"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Reset form logic
                  setDivisi("");
                  setJenisJurnal("");
                  setTanggal("");
                  setEntries([
                    { kode_rek: "", deskripsi: "", debit: 0, kredit: 0 },
                  ]);
                }}
                className="flex-1 sm:flex-initial"
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Jurnal</CardTitle>
          <CardDescription>
            Informasi total debet dan kredit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Total Debet</Label>
              <Input
                type="text"
                value={`Rp ${totalDebit.toLocaleString("id-ID")}`}
                readOnly
              />
            </div>
            <div>
              <Label>Total Kredit</Label>
              <Input
                type="text"
                value={`Rp ${totalKredit.toLocaleString("id-ID")}`}
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

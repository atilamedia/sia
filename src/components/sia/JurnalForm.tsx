
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";
import { useToast } from "@/hooks/use-toast";

interface JurnalEntry {
  kode_rek: string;
  deskripsi: string;
  debit: number;
  kredit: number;
}

interface JurnalFormProps {
  onSuccess?: () => void;
}

export function JurnalForm({ onSuccess }: JurnalFormProps) {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<JurnalEntry[]>([
    { kode_rek: '', deskripsi: '', debit: 0, kredit: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: rekeningData } = useQuery({
    queryKey: ['master-rekening'],
    queryFn: () => siaApi.getMasterRekening(),
  });

  const { data: jenisJurnalData } = useQuery({
    queryKey: ['jurnal-jenis'],
    queryFn: () => siaApi.getJurnalJenis(),
  });

  const accounts = rekeningData?.data || [];
  const jenisJurnal = jenisJurnalData?.data || [];

  const addEntry = () => {
    setEntries([...entries, { kode_rek: '', deskripsi: '', debit: 0, kredit: 0 }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: keyof JurnalEntry, value: string | number) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setEntries(updatedEntries);
  };

  const getTotalDebit = () => entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const getTotalKredit = () => entries.reduce((sum, entry) => sum + (entry.kredit || 0), 0);
  const isBalanced = getTotalDebit() === getTotalKredit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isBalanced) {
      toast({
        title: "Error",
        description: "Total debit dan kredit harus sama",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const defaultJenis = jenisJurnal.find(j => j.is_default === 'Y') || jenisJurnal[0];
      
      const jurnalData = {
        tanggal,
        usernya: 'admin',
        id_div: '01',
        id_jj: defaultJenis?.id_jj || 'JU',
        entries: entries.map(entry => ({
          kode_rek: entry.kode_rek,
          deskripsi: entry.deskripsi,
          debit: entry.debit,
          kredit: entry.kredit
        }))
      };

      const response = await siaApi.createJurnal(jurnalData);
      
      toast({
        title: "Berhasil",
        description: response.message || "Jurnal berhasil disimpan",
      });

      // Reset form
      setEntries([{ kode_rek: '', deskripsi: '', debit: 0, kredit: 0 }]);
      setTanggal(new Date().toISOString().split('T')[0]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating jurnal:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan jurnal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Jurnal Umum</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Detail Jurnal</Label>
              <Button type="button" onClick={addEntry} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Tambah Entry
              </Button>
            </div>

            {entries.map((entry, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-3">
                    <Label htmlFor={`kode_rek_${index}`}>Kode Rekening</Label>
                    <Select 
                      value={entry.kode_rek} 
                      onValueChange={(value) => updateEntry(index, 'kode_rek', value)}
                    >
                      <SelectTrigger id={`kode_rek_${index}`}>
                        <SelectValue placeholder="Pilih rekening" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.kode_rek} value={account.kode_rek}>
                            {account.kode_rek} - {account.nama_rek}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-4">
                    <Label htmlFor={`deskripsi_${index}`}>Deskripsi</Label>
                    <Textarea
                      id={`deskripsi_${index}`}
                      value={entry.deskripsi}
                      onChange={(e) => updateEntry(index, 'deskripsi', e.target.value)}
                      placeholder="Masukkan deskripsi transaksi"
                      className="min-h-[60px]"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`debit_${index}`}>Debit</Label>
                    <Input
                      id={`debit_${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.debit}
                      onChange={(e) => updateEntry(index, 'debit', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`kredit_${index}`}>Kredit</Label>
                    <Input
                      id={`kredit_${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.kredit}
                      onChange={(e) => updateEntry(index, 'kredit', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="md:col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEntry(index)}
                      disabled={entries.length <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                <div>Total Debit: {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(getTotalDebit())}</div>
                <div>Total Kredit: {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(getTotalKredit())}</div>
              </div>
              <div className={`text-sm font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                {isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !isBalanced} 
            className="w-full"
          >
            {loading ? 'Menyimpan...' : 'Simpan Jurnal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

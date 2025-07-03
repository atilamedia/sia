
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { siaApi, type MasterRekening, type JurnalData, type JurnalEntry } from "@/lib/sia-api";

interface JurnalFormProps {
  onSuccess?: () => void;
}

export function JurnalForm({ onSuccess }: JurnalFormProps) {
  const [headerData, setHeaderData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    usernya: 'admin',
    id_div: '01',
    id_jj: 'JU'
  });

  const [entries, setEntries] = useState<JurnalEntry[]>([
    { kode_rek: '', deskripsi: '', debit: 0, kredit: 0 }
  ]);

  const [accounts, setAccounts] = useState<MasterRekening[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await siaApi.getMasterRekening();
      setAccounts(response.data.filter(acc => acc.k_level === 'Detail'));
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Gagal memuat data rekening');
    }
  };

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
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };
    setEntries(updatedEntries);
  };

  const getTotalDebit = () => entries.reduce((sum, entry) => sum + entry.debit, 0);
  const getTotalKredit = () => entries.reduce((sum, entry) => sum + entry.kredit, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi balance
    const totalDebit = getTotalDebit();
    const totalKredit = getTotalKredit();
    
    if (totalDebit !== totalKredit) {
      toast.error('Total debit dan kredit harus sama');
      return;
    }

    if (totalDebit === 0) {
      toast.error('Total debit dan kredit tidak boleh nol');
      return;
    }

    setLoading(true);

    try {
      const jurnalData: JurnalData = {
        ...headerData,
        entries
      };

      const response = await siaApi.createJurnal(jurnalData);
      toast.success(response.message);
      
      // Reset form
      setHeaderData({
        tanggal: new Date().toISOString().split('T')[0],
        usernya: 'admin',
        id_div: '01',
        id_jj: 'JU'
      });
      setEntries([{ kode_rek: '', deskripsi: '', debit: 0, kredit: 0 }]);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating jurnal:', error);
      toast.error('Gagal menyimpan jurnal');
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
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={headerData.tanggal}
                onChange={(e) => setHeaderData(prev => ({ ...prev, tanggal: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="id_jj">Jenis Jurnal</Label>
              <Select 
                value={headerData.id_jj} 
                onValueChange={(value) => setHeaderData(prev => ({ ...prev, id_jj: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JU">Jurnal Umum</SelectItem>
                  <SelectItem value="JP">Jurnal Penyesuaian</SelectItem>
                  <SelectItem value="JT">Jurnal Penutup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="usernya">User</Label>
              <Input
                id="usernya"
                value={headerData.usernya}
                onChange={(e) => setHeaderData(prev => ({ ...prev, usernya: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Entries */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Detail Jurnal</Label>
              <Button type="button" onClick={addEntry} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Baris
              </Button>
            </div>

            <div className="space-y-4">
              {entries.map((entry, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">Entry {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeEntry(index)}
                        disabled={entries.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`account-${index}`}>Kode Rekening</Label>
                      <Select 
                        value={entry.kode_rek} 
                        onValueChange={(value) => updateEntry(index, 'kode_rek', value)}
                      >
                        <SelectTrigger>
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

                    <div>
                      <Label htmlFor={`description-${index}`}>Deskripsi</Label>
                      <Textarea
                        id={`description-${index}`}
                        value={entry.deskripsi}
                        onChange={(e) => updateEntry(index, 'deskripsi', e.target.value)}
                        placeholder="Masukkan deskripsi transaksi..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`debit-${index}`}>Debit</Label>
                        <Input
                          id={`debit-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.debit}
                          onChange={(e) => updateEntry(index, 'debit', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`kredit-${index}`}>Kredit</Label>
                        <Input
                          id={`kredit-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.kredit}
                          onChange={(e) => updateEntry(index, 'kredit', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Total */}
            <Card className="mt-4 bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Debit: Rp {getTotalDebit().toLocaleString()}</span>
                  <span className="font-semibold">Total Kredit: Rp {getTotalKredit().toLocaleString()}</span>
                </div>
                <div className="mt-2 text-center">
                  <span className={`font-semibold ${getTotalDebit() === getTotalKredit() ? 'text-green-600' : 'text-red-600'}`}>
                    {getTotalDebit() === getTotalKredit() ? 'BALANCE' : 'TIDAK BALANCE'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button type="submit" disabled={loading || getTotalDebit() !== getTotalKredit()} className="w-full">
            {loading ? 'Menyimpan...' : 'Simpan Jurnal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

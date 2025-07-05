
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateAccountBalance, type BalanceCalculation } from "@/lib/account-balance";
import { Loader2, Calculator } from "lucide-react";

interface AccountBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  kodeRek: string;
  namaRek: string;
}

export function AccountBalanceModal({ isOpen, onClose, kodeRek, namaRek }: AccountBalanceModalProps) {
  const [balance, setBalance] = useState<BalanceCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const result = await calculateAccountBalance(kodeRek);
      setBalance(result);
    } catch (error) {
      console.error('Error calculating balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Detail Saldo Rekening
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{kodeRek} - {namaRek}</h3>
          </div>

          {!balance ? (
            <div className="text-center py-8">
              <Button onClick={handleCalculate} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menghitung...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Hitung Saldo Terkini
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rincian Perhitungan Saldo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Saldo Awal</span>
                    <span className="font-medium">{formatCurrency(balance.saldo_awal)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>+ Kas Masuk</span>
                    <span className="font-medium">{formatCurrency(balance.kas_masuk)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- Kas Keluar</span>
                    <span className="font-medium">{formatCurrency(balance.kas_keluar)}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>+ Jurnal Debit</span>
                    <span className="font-medium">{formatCurrency(balance.jurnal_debit)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>- Jurnal Kredit</span>
                    <span className="font-medium">{formatCurrency(balance.jurnal_kredit)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Saldo Terkini</span>
                    <span className={balance.saldo_akhir >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(balance.saldo_akhir)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center">
                <Button onClick={handleCalculate} variant="outline" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menghitung Ulang...
                    </>
                  ) : (
                    'Hitung Ulang'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

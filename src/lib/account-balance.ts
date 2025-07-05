
import { siaApi } from "./sia-api";

export interface BalanceCalculation {
  kode_rek: string;
  saldo_awal: number;
  kas_masuk: number;
  kas_keluar: number;
  jurnal_debit: number;
  jurnal_kredit: number;
  saldo_akhir: number;
}

export async function calculateAccountBalance(kodeRek: string): Promise<BalanceCalculation> {
  try {
    // Get initial balance from master rekening
    const rekeningResponse = await siaApi.getMasterRekening();
    const rekening = rekeningResponse.data?.find((r: any) => r.kode_rek === kodeRek);
    const saldoAwal = rekening?.saldo || 0;

    // Get kas masuk for this account
    const kasMasukResponse = await siaApi.getKasMasuk();
    const kasMasukTotal = kasMasukResponse.data
      ?.filter((km: any) => km.kode_rek === kodeRek)
      ?.reduce((sum: number, km: any) => sum + (km.total || 0), 0) || 0;

    // Get kas keluar for this account
    const kasKeluarResponse = await siaApi.getKasKeluar();
    const kasKeluarTotal = kasKeluarResponse.data
      ?.filter((kk: any) => kk.kode_rek === kodeRek)
      ?.reduce((sum: number, kk: any) => sum + (kk.total || 0), 0) || 0;

    // Get jurnal entries for this account
    const jurnalResponse = await siaApi.getJurnal();
    let jurnalDebit = 0;
    let jurnalKredit = 0;

    if (jurnalResponse.data) {
      jurnalResponse.data.forEach((ju: any) => {
        if (ju.jurnal) {
          ju.jurnal.forEach((entry: any) => {
            if (entry.kode_rek === kodeRek) {
              jurnalDebit += entry.debit || 0;
              jurnalKredit += entry.kredit || 0;
            }
          });
        }
      });
    }

    // Calculate final balance
    // For asset accounts: saldo_awal + kas_masuk - kas_keluar + jurnal_debit - jurnal_kredit
    // For liability/equity accounts: saldo_awal - kas_masuk + kas_keluar - jurnal_debit + jurnal_kredit
    // Simplified calculation: saldo_awal + kas_masuk - kas_keluar + jurnal_debit - jurnal_kredit
    const saldoAkhir = saldoAwal + kasMasukTotal - kasKeluarTotal + jurnalDebit - jurnalKredit;

    return {
      kode_rek: kodeRek,
      saldo_awal: saldoAwal,
      kas_masuk: kasMasukTotal,
      kas_keluar: kasKeluarTotal,
      jurnal_debit: jurnalDebit,
      jurnal_kredit: jurnalKredit,
      saldo_akhir: saldoAkhir
    };
  } catch (error) {
    console.error('Error calculating account balance:', error);
    return {
      kode_rek: kodeRek,
      saldo_awal: 0,
      kas_masuk: 0,
      kas_keluar: 0,
      jurnal_debit: 0,
      jurnal_kredit: 0,
      saldo_akhir: 0
    };
  }
}

export async function calculateAllAccountBalances(): Promise<BalanceCalculation[]> {
  try {
    const rekeningResponse = await siaApi.getMasterRekening();
    if (!rekeningResponse.data) return [];

    const balances = await Promise.all(
      rekeningResponse.data.map((rekening: any) => 
        calculateAccountBalance(rekening.kode_rek)
      )
    );

    return balances;
  } catch (error) {
    console.error('Error calculating all account balances:', error);
    return [];
  }
}

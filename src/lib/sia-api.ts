
import { supabase } from "@/integrations/supabase/client";

const SIA_API_URL = 'https://dcvhzuqlsiwudygwwhhr.supabase.co/functions/v1/sia-api';

export interface MasterRekening {
  kode_rek: string;
  nama_rek: string;
  saldo: number;
  level: number;
  k_level: 'Induk' | 'Detail Kas' | 'Detail Bk' | 'Detail' | 'Sendiri';
  rek_induk: string;
  id_div: string;
  jenis_rek: 'NERACA' | 'LRA' | 'LO';
  created_at?: string;
  updated_at?: string;
}

export interface KasMasuk {
  id_km?: string;
  tanggal: string;
  kode_rek: string;
  total: number;
  keterangan: string;
  pembayar: string;
  no_cek?: string;
  usernya: string;
  id_div?: string;
}

export interface KasKeluar {
  id_kk?: string;
  tanggal: string;
  bagian_seksi: string;
  kode_rek: string;
  total: number;
  keterangan: string;
  penerima: string;
  no_cek?: string;
  usernya: string;
  id_div?: string;
}

export interface JurnalEntry {
  kode_rek: string;
  deskripsi: string;
  debit: number;
  kredit: number;
}

export interface JurnalData {
  tanggal: string;
  usernya: string;
  id_div?: string;
  id_jj?: string;
  entries: JurnalEntry[];
}

export class SiaApiClient {
  private async callApi(endpoint: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
      ...options.headers,
    };

    const response = await fetch(`${SIA_API_URL}/${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API call failed');
    }

    return response.json();
  }

  // Master Rekening methods
  async getMasterRekening(): Promise<{ data: MasterRekening[] }> {
    return this.callApi('master-rekening');
  }

  async createMasterRekening(data: Omit<MasterRekening, 'created_at' | 'updated_at'>): Promise<{ data: MasterRekening; message: string }> {
    return this.callApi('master-rekening', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMasterRekening(data: MasterRekening): Promise<{ data: MasterRekening; message: string }> {
    return this.callApi('master-rekening', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMasterRekening(kodeRek: string): Promise<{ message: string }> {
    return this.callApi(`master-rekening?kode_rek=${kodeRek}`, {
      method: 'DELETE',
    });
  }

  // Kas Masuk methods
  async getKasMasuk(startDate?: string, endDate?: string): Promise<{ data: any[] }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return this.callApi(`kas-masuk${params.toString() ? '?' + params.toString() : ''}`);
  }

  async createKasMasuk(data: KasMasuk): Promise<{ data: any; message: string }> {
    return this.callApi('kas-masuk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Kas Keluar methods
  async getKasKeluar(startDate?: string, endDate?: string): Promise<{ data: any[] }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return this.callApi(`kas-keluar${params.toString() ? '?' + params.toString() : ''}`);
  }

  async createKasKeluar(data: KasKeluar): Promise<{ data: any; message: string }> {
    return this.callApi('kas-keluar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Jurnal methods
  async getJurnal(startDate?: string, endDate?: string): Promise<{ data: any[] }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return this.callApi(`jurnal${params.toString() ? '?' + params.toString() : ''}`);
  }

  async createJurnal(data: JurnalData): Promise<{ data: any; message: string }> {
    return this.callApi('jurnal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Laporan methods
  async getLaporan(type: string, startDate?: string, endDate?: string): Promise<{ data: any[] }> {
    const params = new URLSearchParams({ type });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return this.callApi(`laporan?${params.toString()}`);
  }
}

export const siaApi = new SiaApiClient();


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

export interface JurnalJenis {
  id_jj: string;
  nm_jj: string;
  is_default: 'Y' | 'N';
  created_at?: string;
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
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      console.log(`Making API call to: ${SIA_API_URL}/${endpoint}`);

      const response = await fetch(`${SIA_API_URL}/${endpoint}`, {
        ...options,
        headers,
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = 'API call failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API Error Details:', errorData);
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`API call successful:`, data);
      return data;
    } catch (error) {
      console.error(`API call error for ${endpoint}:`, error);
      throw error;
    }
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

  // Jurnal Jenis methods
  async getJurnalJenis(): Promise<{ data: JurnalJenis[] }> {
    return this.callApi('jurnal-jenis');
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

  async updateJurnal(id_ju: string, data: any): Promise<{ data: any; message: string }> {
    return this.callApi('jurnal', {
      method: 'PUT',
      body: JSON.stringify({ id_ju, ...data }),
    });
  }

  async deleteJurnal(id_ju: string): Promise<{ message: string }> {
    return this.callApi(`jurnal?id_ju=${id_ju}`, {
      method: 'DELETE',
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

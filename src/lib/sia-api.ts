import { Account, CashFlow, JournalEntry, JournalType } from "./types";

// Type definitions for SIA API
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
  no_cek: string;
  usernya: string;
  id_div: string;
  at_create?: string;
  last_update?: string;
  m_rekening?: {
    kode_rek: string;
    nama_rek: string;
  };
}

export interface KasKeluar {
  id_kk?: string;
  tanggal: string;
  bagian_seksi: string;
  kode_rek: string;
  total: number;
  keterangan: string;
  penerima: string;
  no_cek: string;
  usernya: string;
  id_div: string;
  at_create?: string;
  last_update?: string;
  m_rekening?: {
    kode_rek: string;
    nama_rek: string;
  };
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
  id_div: string;
  id_jj: string;
  entries: JurnalEntry[];
}

export interface AnggaranData {
  kode_rek: string;
  tahun: number;
  total: number;
  tanda: string;
  validasi_realisasi?: string;
  usernya?: string;
  nama_rek?: string;
  realisasi?: number;
  persentase?: number;
  status?: string;
}

class SiaApiService {
  private baseUrl = 'https://dcvhzuqlsiwudygwwhhr.supabase.co/functions/v1/sia-api';

  private async request(endpoint: string, options?: RequestInit) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('Making request to:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdmh6dXFsc2l3dWR5Z3d3aGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mzg0MTcsImV4cCI6MjA2NzExNDQxN30.uxBK0gLaodF7CcFaZBuqloI9OJAdZJ_TA5c3iylF-eo`,
        ...options?.headers,
      },
      ...options,
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    return response.json();
  }

  async getKasMasuk(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    return this.request(`/kas-masuk${queryString ? `?${queryString}` : ''}`);
  }

  async createKasMasuk(data: KasMasuk) {
    return this.request('/kas-masuk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKasMasuk(data: KasMasuk) {
    return this.request(`/kas-masuk/${data.id_km}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteKasMasuk(id: string) {
    return this.request(`/kas-masuk/${id}`, {
      method: 'DELETE',
    });
  }

  async getKasKeluar(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    return this.request(`/kas-keluar${queryString ? `?${queryString}` : ''}`);
  }

  async createKasKeluar(data: KasKeluar) {
    return this.request('/kas-keluar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKasKeluar(data: KasKeluar) {
    return this.request(`/kas-keluar/${data.id_kk}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteKasKeluar(id: string) {
    return this.request(`/kas-keluar/${id}`, {
      method: 'DELETE',
    });
  }

  async getJurnal(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    return this.request(`/jurnal${queryString ? `?${queryString}` : ''}`);
  }

  async createJurnal(data: JurnalData) {
    return this.request('/jurnal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJurnal(id: string, data: any) {
    return this.request(`/jurnal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJurnal(id: string) {
    return this.request(`/jurnal/${id}`, {
      method: 'DELETE',
    });
  }

  async getRekening() {
    return this.request('/rekening');
  }

  async getMasterRekening() {
    return this.request('/rekening');
  }

  async createRekening(data: MasterRekening) {
    return this.request('/rekening', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createMasterRekening(data: MasterRekening) {
    return this.request('/rekening', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRekening(code: string, data: MasterRekening) {
    // Ensure proper URL encoding
    const encodedCode = encodeURIComponent(code);
    console.log('Updating rekening with code:', code, 'encoded as:', encodedCode);
    
    return this.request(`/rekening/${encodedCode}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateMasterRekening(data: MasterRekening) {
    // Ensure proper URL encoding
    const encodedCode = encodeURIComponent(data.kode_rek);
    console.log('Updating master rekening with code:', data.kode_rek, 'encoded as:', encodedCode);
    
    return this.request(`/rekening/${encodedCode}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRekening(code: string) {
    // Ensure proper URL encoding
    const encodedCode = encodeURIComponent(code);
    console.log('Deleting rekening with code:', code, 'encoded as:', encodedCode);
    
    return this.request(`/rekening/${encodedCode}`, {
      method: 'DELETE',
    });
  }

  async deleteMasterRekening(code: string) {
    // Ensure proper URL encoding
    const encodedCode = encodeURIComponent(code);
    console.log('Deleting master rekening with code:', code, 'encoded as:', encodedCode);
    
    return this.request(`/rekening/${encodedCode}`, {
      method: 'DELETE',
    });
  }

  async getAnggaran(tahun: number) {
    return this.request(`/anggaran?tahun=${tahun}`);
  }

  async createAnggaran(data: any) {
    return this.request('/anggaran', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAnggaran(kodeRek: string, tahun: number, data: any) {
    return this.request(`/anggaran/${kodeRek}/${tahun}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAnggaran(kodeRek: string, tahun: number) {
    return this.request(`/anggaran/${kodeRek}/${tahun}`, {
      method: 'DELETE',
    });
  }
}

export const siaApi = new SiaApiService();

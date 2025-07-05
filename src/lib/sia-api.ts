import { Account, CashFlow, JournalEntry, JournalType } from "./types";

class SiaApiService {
  private baseUrl = 'https://dcvhzuqlsiwudygwwhhr.supabase.co/functions/v1/sia-api';

  private async request(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdmh6dXFsc2l3dWR5Z3d3aGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mzg0MTcsImV4cCI6MjA2NzExNDQxN30.uxBK0gLaodF7CcFaZBuqloI9OJAdZJ_TA5c3iylF-eo`,
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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

  async createKasMasuk(data: any) {
    return this.request('/kas-masuk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKasMasuk(id: string, data: any) {
    return this.request(`/kas-masuk/${id}`, {
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

  async createKasKeluar(data: any) {
    return this.request('/kas-keluar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKasKeluar(id: string, data: any) {
    return this.request(`/kas-keluar/${id}`, {
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

  async createJurnal(data: any) {
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

  async createRekening(data: any) {
    return this.request('/rekening', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRekening(code: string, data: any) {
    return this.request(`/rekening/${code}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRekening(code: string) {
    return this.request(`/rekening/${code}`, {
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


import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from 'xlsx';

interface AccountExportProps {
  accounts: any[];
  searchTerm: string;
}

export const AccountExport = ({ accounts, searchTerm }: AccountExportProps) => {
  const filteredAccounts = accounts.filter(account =>
    account.nama_rek?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.kode_rek?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Laporan Daftar Akun'],
      [''],
      ['Total Akun', filteredAccounts.length],
      ['Filter Pencarian', searchTerm || 'Semua'],
      [''],
      ['Tanggal Cetak:', new Date().toLocaleString('id-ID')]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    // Detail sheet
    if (filteredAccounts.length > 0) {
      const detailSheet = XLSX.utils.json_to_sheet(
        filteredAccounts.map(account => ({
          'Kode Rekening': account.kode_rek,
          'Nama Rekening': account.nama_rek,
          'Jenis': account.jenis_rek,
          'Level': account.k_level,
          'Rekening Induk': account.rek_induk,
          'Saldo': account.saldo,
          'Divisi': account.id_div
        }))
      );
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Daftar Akun');
    }

    const fileName = `daftar-akun-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const totalSaldo = filteredAccounts.reduce((sum, account) => sum + (account.saldo || 0), 0);
    const rekeningNeraca = filteredAccounts.filter(acc => acc.jenis_rek === 'NERACA').length;
    const rekeningLRA = filteredAccounts.filter(acc => acc.jenis_rek === 'LRA').length;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Daftar Akun Rekening</title>
        <style>
          @page {
            margin: 15mm;
            size: A4 landscape;
          }
          
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
          }
          
          .letterhead {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
          }
          
          .letterhead img {
            width: 80px;
            height: 80px;
            float: left;
            margin-right: 20px;
          }
          
          .letterhead-content {
            text-align: center;
            display: inline-block;
            width: calc(100% - 100px);
          }
          
          .letterhead h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 5px 0;
            color: #000;
          }
          
          .letterhead h2 {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #000;
          }
          
          .letterhead .address {
            font-size: 11px;
            line-height: 1.3;
            margin: 5px 0;
          }
          
          .clearfix::after {
            content: "";
            display: table;
            clear: both;
          }
          
          .report-title { 
            text-align: center; 
            margin: 30px 0; 
          }
          
          .report-title h1 {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
          }
          
          .summary { 
            margin-bottom: 30px; 
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .summary-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 12px; 
            border: 1px solid #ddd;
            background-color: #f9f9f9;
          }
          
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
          }
          
          .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
            font-size: 10px;
          }
          
          .table th { 
            background-color: #f5f5f5; 
            font-weight: bold;
          }
          
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          
          .badge {
            padding: 3px 6px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .badge-induk { background: #dbeafe; color: #1e40af; }
          .badge-detail-kas { background: #d1fae5; color: #047857; }
          .badge-detail-bk { background: #fef3c7; color: #92400e; }
          .badge-detail { background: #f3f4f6; color: #374151; }
          .badge-sendiri { background: #e5e7eb; color: #374151; }
          
          .badge-neraca { background: #f3e8ff; color: #7c2d12; }
          .badge-lra { background: #fed7aa; color: #9a3412; }
          .badge-lo { background: #fecaca; color: #991b1b; }
          
          @media print { 
            body { margin: 0; }
            .summary-grid { grid-template-columns: repeat(2, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="letterhead clearfix">
          <img src="/sia/uploads/3acae2a7-53c9-48ab-9ca1-08dc49ee0f14.png" alt="Logo RSUD" />
          <div class="letterhead-content">
            <h1>PEMERINTAH KABUPATEN HULU SUNGAI TENGAH</h1>
            <h2>RSUD H. DAMANHURI BARABAI</h2>
            <div class="address">
              Jalan Murakata Nomor 4 Barabai 71314 Telepon/Faxmile : 08115008080<br>
              Laman: www.rshdbarabai.com, Pos-el: rshd@hstkab.go.id<br>
              Terakreditasi Paripurna Nomor: KARS-SERT/456/XI/2022
            </div>
          </div>
        </div>
        
        <div class="report-title">
          <h1>LAPORAN DAFTAR AKUN REKENING</h1>
        </div>
        
        <div class="summary">
          <h3>Ringkasan Akun</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span>Total Akun:</span>
              <span><strong>${filteredAccounts.length}</strong></span>
            </div>
            <div class="summary-item">
              <span>Total Saldo:</span>
              <span><strong>Rp ${totalSaldo.toLocaleString('id-ID')}</strong></span>
            </div>
            <div class="summary-item">
              <span>Akun Neraca:</span>
              <span><strong>${rekeningNeraca}</strong></span>
            </div>
            <div class="summary-item">
              <span>Akun LRA:</span>
              <span><strong>${rekeningLRA}</strong></span>
            </div>
          </div>
          <div style="text-align: center; margin-top: 10px; font-size: 11px;">
            <strong>Filter Pencarian:</strong> ${searchTerm || 'Semua Data'} | 
            <strong>Jumlah Data:</strong> ${filteredAccounts.length} dari ${accounts.length} akun
          </div>
        </div>

        <div>
          <h3>Detail Akun</h3>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 12%;">Kode</th>
                <th style="width: 30%;">Nama Rekening</th>
                <th style="width: 8%;" class="text-center">Level</th>
                <th style="width: 12%;" class="text-center">Kategori</th>
                <th style="width: 8%;" class="text-center">Jenis</th>
                <th style="width: 12%;" class="text-center">Induk</th>
                <th style="width: 18%;" class="text-right">Saldo Awal</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAccounts.map((account, index) => `
                <tr>
                  <td><strong>${account.kode_rek}</strong></td>
                  <td>${account.nama_rek || '-'}</td>
                  <td class="text-center">${account.level || '-'}</td>
                  <td class="text-center">
                    <span class="badge ${
                      account.k_level === 'Induk' ? 'badge-induk' :
                      account.k_level === 'Detail Kas' ? 'badge-detail-kas' :
                      account.k_level === 'Detail Bk' ? 'badge-detail-bk' :
                      account.k_level === 'Sendiri' ? 'badge-sendiri' :
                      'badge-detail'
                    }">${account.k_level || 'Detail'}</span>
                  </td>
                  <td class="text-center">
                    <span class="badge ${
                      account.jenis_rek === 'NERACA' ? 'badge-neraca' :
                      account.jenis_rek === 'LRA' ? 'badge-lra' :
                      'badge-lo'
                    }">${account.jenis_rek || 'NERACA'}</span>
                  </td>
                  <td class="text-center">${account.rek_induk && account.rek_induk.trim() !== '' && account.rek_induk !== ' ' ? account.rek_induk : '-'}</td>
                  <td class="text-right"><strong>Rp ${(account.saldo || 0).toLocaleString('id-ID')}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="margin-top: 30px; text-align: right; font-size: 10px;">
          Dicetak pada: ${currentDate}<br>
          Halaman ini berisi ${filteredAccounts.length} data akun rekening
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportToExcel} variant="outline" size="sm">
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Excel
      </Button>
      <Button onClick={exportToPDF} variant="outline" size="sm">
        <FileText className="mr-2 h-4 w-4" />
        PDF
      </Button>
    </div>
  );
};

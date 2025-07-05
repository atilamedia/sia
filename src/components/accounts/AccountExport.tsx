
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
            margin: 20mm;
            size: A4 landscape;
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          
          .header h1 {
            color: #1e40af;
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: bold;
          }
          
          .header p {
            margin: 5px 0;
            color: #64748b;
            font-size: 14px;
          }
          
          .summary { 
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
          }
          
          .summary h2 {
            color: #1e40af;
            margin: 0 0 15px 0;
            font-size: 18px;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 15px;
          }
          
          .summary-item { 
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .summary-item .label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .summary-item .value {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
          }
          
          .summary-item.currency .value {
            color: #059669;
          }
          
          .filters {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            font-size: 11px;
            color: #64748b;
          }
          
          .table-container {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .table { 
            width: 100%; 
            border-collapse: collapse;
            margin: 0;
          }
          
          .table thead {
            background: #1e40af;
            color: white;
          }
          
          .table th, .table td { 
            padding: 12px 8px; 
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .table th {
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .table td {
            font-size: 11px;
          }
          
          .table tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          
          .table tbody tr:hover {
            background: #e2e8f0;
          }
          
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          
          .badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
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
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          
          @media print { 
            body { margin: 0; }
            .summary-grid { grid-template-columns: repeat(2, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN DAFTAR AKUN REKENING</h1>
          <p>Sistem Informasi Akuntansi</p>
          <p>Dicetak pada: ${currentDate}</p>
        </div>
        
        <div class="summary">
          <h2>Ringkasan Akun</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="label">Total Akun</div>
              <div class="value">${filteredAccounts.length}</div>
            </div>
            <div class="summary-item currency">
              <div class="label">Total Saldo</div>
              <div class="value">${new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR', 
                minimumFractionDigits: 0 
              }).format(totalSaldo)}</div>
            </div>
            <div class="summary-item">
              <div class="label">Akun Neraca</div>
              <div class="value">${rekeningNeraca}</div>
            </div>
            <div class="summary-item">
              <div class="label">Akun LRA</div>
              <div class="value">${rekeningLRA}</div>
            </div>
          </div>
          <div class="filters">
            <span><strong>Filter Pencarian:</strong> ${searchTerm || 'Semua Data'}</span>
            <span><strong>Jumlah Data:</strong> ${filteredAccounts.length} dari ${accounts.length} akun</span>
          </div>
        </div>

        <div class="table-container">
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
                  <td class="text-right"><strong>${new Intl.NumberFormat('id-ID', { 
                    style: 'currency', 
                    currency: 'IDR', 
                    minimumFractionDigits: 0 
                  }).format(account.saldo || 0)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>Laporan ini digenerate secara otomatis oleh Sistem Informasi Akuntansi</p>
          <p>Halaman ini berisi ${filteredAccounts.length} data akun rekening</p>
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

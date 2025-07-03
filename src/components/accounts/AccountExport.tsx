
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

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Daftar Akun</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f5f5f5; }
          .neraca { color: #3B82F6; }
          .lra { color: #10B981; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Daftar Akun</h1>
          <p>Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</p>
        </div>
        
        <div class="summary">
          <h2>Ringkasan</h2>
          <div class="summary-item">
            <span>Total Akun:</span>
            <span><strong>${filteredAccounts.length}</strong></span>
          </div>
          <div class="summary-item">
            <span>Filter Pencarian:</span>
            <span><strong>${searchTerm || 'Semua'}</strong></span>
          </div>
        </div>

        <div>
          <h2>Daftar Akun</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Rekening</th>
                <th>Jenis</th>
                <th>Level</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAccounts.map(account => `
                <tr>
                  <td>${account.kode_rek}</td>
                  <td>${account.nama_rek}</td>
                  <td><span class="${account.jenis_rek === 'NERACA' ? 'neraca' : 'lra'}">${account.jenis_rek}</span></td>
                  <td>${account.k_level}</td>
                  <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(account.saldo || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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

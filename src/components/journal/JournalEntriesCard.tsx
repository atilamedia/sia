
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileEdit, Trash2 } from "lucide-react";

interface JournalEntriesCardProps {
  data: any[];
  isLoading: boolean;
}

export function JournalEntriesCard({ data, isLoading }: JournalEntriesCardProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Tidak ada data jurnal yang ditemukan
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <Card key={item.id_ju}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">{item.id_ju}</h3>
                <p className="text-sm text-muted-foreground">{item.tanggal}</p>
                <p className="text-sm text-muted-foreground">{item.jurnal_jenis?.nm_jj}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <FileEdit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {item.jurnal?.map((entry: any, idx: number) => (
                <div key={idx} className="p-2 bg-muted/50 rounded text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{entry.kode_rek}</div>
                      <div className="text-muted-foreground">{entry.m_rekening?.nama_rek}</div>
                      <div className="text-muted-foreground">{entry.deskripsi}</div>
                    </div>
                    <div className="text-right">
                      {entry.debit > 0 && (
                        <div className="text-green-600 font-medium">
                          D: {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(entry.debit)}
                        </div>
                      )}
                      {entry.kredit > 0 && (
                        <div className="text-red-600 font-medium">
                          K: {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(entry.kredit)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

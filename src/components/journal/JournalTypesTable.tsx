
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { siaApi } from "@/lib/sia-api";

export function JournalTypesTable() {
  const { data: journalTypesData, isLoading } = useQuery({
    queryKey: ['jurnal-jenis'],
    queryFn: () => siaApi.getJurnalJenis(),
  });

  const journalTypes = journalTypesData?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jenis Jurnal</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-10 px-4 text-left font-medium">Kode</th>
                  <th className="h-10 px-4 text-left font-medium">Nama</th>
                  <th className="h-10 px-4 text-center font-medium">Default</th>
                  <th className="h-10 px-4 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {journalTypes.length > 0 ? (
                  journalTypes.map((type: any) => (
                    <tr key={type.id_jj} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 font-medium">{type.id_jj}</td>
                      <td className="p-4">{type.nm_jj}</td>
                      <td className="p-4 text-center">
                        {type.is_default === 'Y' ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Ya
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            Tidak
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      Tidak ada jenis jurnal yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

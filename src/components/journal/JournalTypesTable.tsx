
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JournalType } from "@/lib/types";
import { MoreHorizontal } from "lucide-react";

interface JournalTypesTableProps {
  journalTypes: JournalType[];
}

export function JournalTypesTable({ journalTypes }: JournalTypesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jenis Jurnal</CardTitle>
      </CardHeader>
      <CardContent>
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
            {journalTypes.map((type) => (
              <tr key={type.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 font-medium">{type.id}</td>
                <td className="p-4">{type.name}</td>
                <td className="p-4 text-center">
                  {type.isDefault ? (
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
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

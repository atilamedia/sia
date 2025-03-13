
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { JournalEntry, JournalType } from "@/lib/types";
import { sampleJournalEntries, sampleJournalTypes } from "@/lib/data";
import { BookText, Download, Filter, Plus, Search } from "lucide-react";

export default function Journal() {
  const [journals, setJournals] = useState<JournalEntry[]>(sampleJournalEntries);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJournalType, setSelectedJournalType] = useState<string>("");
  
  // Group journal entries by code
  const journalGroups = journals.reduce((groups, entry) => {
    if (!groups[entry.code]) {
      groups[entry.code] = [];
    }
    groups[entry.code].push(entry);
    return groups;
  }, {} as Record<string, JournalEntry[]>);

  const filteredJournalGroups = Object.entries(journalGroups)
    .filter(([code, entries]) => {
      const matchesSearch = code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         entries.some(entry => 
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.accountCode.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .reduce((obj, [code, entries]) => {
      obj[code] = entries;
      return obj;
    }, {} as Record<string, JournalEntry[]>);

  return (
    <Layout>
      <div className="container px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Jurnal</h2>
            <p className="text-muted-foreground">
              Kelola entri jurnal akuntansi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Jurnal Baru
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="journals" className="mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="journals">Jurnal</TabsTrigger>
              <TabsTrigger value="journal-types">Jenis Jurnal</TabsTrigger>
            </TabsList>
            
            <div className="flex w-full sm:w-auto gap-2">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari jurnal..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedJournalType} onValueChange={setSelectedJournalType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Jenis Jurnal" />
                </SelectTrigger>
                <SelectContent>
                  {/* Changed empty string to "all" to avoid the empty value error */}
                  <SelectItem value="all">Semua</SelectItem>
                  {sampleJournalTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="journals" className="mt-0 space-y-4">
            {Object.keys(filteredJournalGroups).length > 0 ? (
              Object.entries(filteredJournalGroups).map(([code, entries]) => (
                <JournalEntriesCard key={code} code={code} entries={entries} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <BookText className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Tidak ada entri jurnal</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Belum ada entri jurnal yang sesuai dengan filter pencarian.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="journal-types" className="mt-0">
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
                    {sampleJournalTypes.map((type) => (
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function JournalEntriesCard({ code, entries }: { code: string, entries: JournalEntry[] }) {
  const firstEntry = entries[0];
  
  // Calculate totals
  const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{code}</CardTitle>
          </div>
          <div className="flex flex-col items-end text-sm">
            <span>{formatDate(firstEntry.date)}</span>
            <span className="text-muted-foreground">Oleh: {firstEntry.user}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="h-10 px-4 text-left font-medium">Kode Akun</th>
                <th className="h-10 px-4 text-left font-medium">Deskripsi</th>
                <th className="h-10 px-4 text-right font-medium">Debit</th>
                <th className="h-10 px-4 text-right font-medium">Kredit</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={`${entry.code}-${entry.accountCode}-${index}`} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 font-medium">{entry.accountCode}</td>
                  <td className="p-4">{entry.description}</td>
                  <td className="p-4 text-right">
                    {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                  </td>
                  <td className="p-4 text-right">
                    {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/20 font-medium">
                <td colSpan={2} className="p-4 text-right">Total</td>
                <td className="p-4 text-right">{formatCurrency(totalDebit)}</td>
                <td className="p-4 text-right">{formatCurrency(totalCredit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end p-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Detail</Button>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

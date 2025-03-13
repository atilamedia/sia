
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookText, Download, Filter, Plus, Search, Calendar, X } from "lucide-react";
import { JournalEntry, JournalType } from "@/lib/types";
import { sampleJournalEntries, sampleJournalTypes } from "@/lib/data";
import { JournalEntriesCard } from "@/components/journal/JournalEntriesCard";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { JournalTypesTable } from "@/components/journal/JournalTypesTable";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

export default function Journal() {
  const [journals, setJournals] = useState<JournalEntry[]>(sampleJournalEntries);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJournalType, setSelectedJournalType] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntries, setEditingEntries] = useState<JournalEntry[] | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
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
      
      // Date filtering
      const entryDate = new Date(entries[0].date);
      const matchesStartDate = !startDate || entryDate >= startDate;
      const matchesEndDate = !endDate || entryDate <= endDate;
      
      // If "all" is selected or no filter, show all journals
      if (selectedJournalType === "all") {
        return matchesSearch && matchesStartDate && matchesEndDate;
      }
      
      // Filter by journal type (in a real app, you'd have a type field)
      // For now, we'll just simulate this with the first digit of the code
      const journalTypePrefix = selectedJournalType.charAt(0);
      return matchesSearch && code.charAt(0) === journalTypePrefix && matchesStartDate && matchesEndDate;
    })
    .reduce((obj, [code, entries]) => {
      obj[code] = entries;
      return obj;
    }, {} as Record<string, JournalEntry[]>);

  const activeFiltersCount = [
    startDate !== undefined,
    endDate !== undefined,
    selectedJournalType !== "all"
  ].filter(Boolean).length;

  const handleAddJournal = () => {
    setEditingEntries(null);
    setIsFormOpen(true);
  };

  const handleEditJournal = (entries: JournalEntry[]) => {
    setEditingEntries(entries);
    setIsFormOpen(true);
  };

  const handleDeleteJournal = (code: string) => {
    setJournals(journals.filter(journal => journal.code !== code));
    toast.success(`Jurnal ${code} berhasil dihapus`);
  };

  const handleSaveJournal = (entries: JournalEntry[]) => {
    if (editingEntries) {
      // Update existing journal entries
      const code = editingEntries[0].code;
      const updatedJournals = journals.filter(journal => journal.code !== code);
      setJournals([...updatedJournals, ...entries]);
      toast.success(`Jurnal ${code} berhasil diperbarui`);
    } else {
      // Add new journal entries
      setJournals([...journals, ...entries]);
      toast.success(`Jurnal baru berhasil ditambahkan`);
    }
    setIsFormOpen(false);
    setEditingEntries(null);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedJournalType("all");
  };

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
            <Button onClick={handleAddJournal}>
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
                  <SelectItem value="all">Semua</SelectItem>
                  {sampleJournalTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={activeFiltersCount > 0 ? "relative" : ""}
              >
                <Filter className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <Card className="p-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="date-from">Tanggal Dari</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-from"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="date-to">Tanggal Sampai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-to"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button
                  variant="outline" 
                  size="icon" 
                  onClick={clearFilters}
                  className="h-10 mt-auto"
                  title="Reset filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {startDate && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Dari: {format(startDate, "dd/MM/yyyy")}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setStartDate(undefined)} />
                    </Badge>
                  )}
                  {endDate && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Sampai: {format(endDate, "dd/MM/yyyy")}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setEndDate(undefined)} />
                    </Badge>
                  )}
                  {selectedJournalType !== "all" && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Jenis: {sampleJournalTypes.find(t => t.id === selectedJournalType)?.name || selectedJournalType}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedJournalType("all")} />
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          )}
          
          <TabsContent value="journals" className="mt-0 space-y-4">
            {Object.keys(filteredJournalGroups).length > 0 ? (
              Object.entries(filteredJournalGroups).map(([code, entries]) => (
                <JournalEntriesCard 
                  key={code} 
                  code={code} 
                  entries={entries} 
                  onEdit={handleEditJournal}
                  onDelete={handleDeleteJournal}
                />
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
            <JournalTypesTable journalTypes={sampleJournalTypes} />
          </TabsContent>
        </Tabs>
      </div>
      
      {isFormOpen && (
        <JournalEntryForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingEntries(null);
          }}
          onSave={handleSaveJournal}
          journalTypes={sampleJournalTypes}
          initialEntries={editingEntries || undefined}
          isEditing={!!editingEntries}
        />
      )}
    </Layout>
  );
}

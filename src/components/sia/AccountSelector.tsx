
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { siaApi, type MasterRekening } from "@/lib/sia-api";

interface AccountSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  filterType?: 'kas' | 'all';
}

export function AccountSelector({ 
  value, 
  onValueChange, 
  placeholder = "Pilih rekening...",
  filterType = 'kas'
}: AccountSelectorProps) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<MasterRekening[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await siaApi.getMasterRekening();
      let filteredAccounts = response.data;
      
      if (filterType === 'kas') {
        filteredAccounts = response.data.filter(acc => 
          acc.k_level === 'Detail Kas' || acc.k_level === 'Detail Bk'
        );
      }
      
      setAccounts(filteredAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find(account => account.kode_rek === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={loading}
        >
          {selectedAccount ? (
            <span className="truncate">
              {selectedAccount.kode_rek} - {selectedAccount.nama_rek}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput placeholder="Cari rekening..." />
          <CommandList>
            <CommandEmpty>Tidak ada rekening ditemukan.</CommandEmpty>
            <CommandGroup>
              {accounts.map((account) => (
                <CommandItem
                  key={account.kode_rek}
                  value={`${account.kode_rek} ${account.nama_rek}`}
                  onSelect={() => {
                    onValueChange(account.kode_rek);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === account.kode_rek ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{account.kode_rek}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {account.nama_rek}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

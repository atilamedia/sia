
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Account } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const accountSchema = z.object({
  code: z.string().min(1, "Kode rekening diperlukan"),
  name: z.string().min(1, "Nama rekening diperlukan"),
  level: z.coerce.number().int().positive(),
  levelType: z.enum(["Induk", "Detail Kas", "Detail Bk", "Detail", "Sendiri"]),
  parentCode: z.string().optional(),
  division: z.string().default("01"),
  accountType: z.enum(["NERACA", "LRA", "LO"]),
  balance: z.coerce.number().default(0),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormProps {
  account?: Account;
  parentAccounts: Account[];
  onSubmit: (data: AccountFormValues) => void;
  onCancel: () => void;
}

export function AccountForm({ account, parentAccounts, onSubmit, onCancel }: AccountFormProps) {
  const { toast } = useToast();
  const isEditMode = !!account;

  // Prepare default values, ensuring parentCode is properly set
  const defaultValues = account ? {
    code: account.code,
    name: account.name,
    level: account.level,
    levelType: account.levelType,
    parentCode: account.parentCode === ' ' || account.parentCode === '' ? '-' : account.parentCode,
    division: account.division,
    accountType: account.accountType,
    balance: account.balance,
  } : {
    code: "",
    name: "",
    level: 1,
    levelType: "Detail" as const,
    parentCode: "-",
    division: "01",
    accountType: "NERACA" as const,
    balance: 0,
  };

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues,
  });

  function handleSubmit(data: AccountFormValues) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Rekening</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1.1.1.01"
                    {...field}
                    disabled={isEditMode}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Rekening</FormLabel>
                <FormControl>
                  <Input placeholder="Kas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="levelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Induk">Induk</SelectItem>
                    <SelectItem value="Detail Kas">Detail Kas</SelectItem>
                    <SelectItem value="Detail Bk">Detail Bk</SelectItem>
                    <SelectItem value="Detail">Detail</SelectItem>
                    <SelectItem value="Sendiri">Sendiri</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="parentCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rekening Induk</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih rekening induk" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="-">-</SelectItem>
                    {parentAccounts.map(parent => (
                      <SelectItem key={parent.code} value={parent.code}>
                        {parent.code} - {parent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Rekening</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe rekening" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NERACA">NERACA</SelectItem>
                    <SelectItem value="LRA">LRA</SelectItem>
                    <SelectItem value="LO">LO</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditMode && (
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Batal
          </Button>
          <Button type="submit">
            {isEditMode ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

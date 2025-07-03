
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { toast } from "sonner";
import { siaApi } from "@/lib/sia-api";
import { useQuery } from "@tanstack/react-query";

const accountSchema = z.object({
  kode_rek: z.string().min(1, "Kode rekening diperlukan"),
  nama_rek: z.string().min(1, "Nama rekening diperlukan"),
  level: z.coerce.number().int().positive(),
  k_level: z.enum(["Induk", "Detail Kas", "Detail Bk", "Detail", "Sendiri"]),
  rek_induk: z.string().optional(),
  id_div: z.string().default("01"),
  jenis_rek: z.enum(["NERACA", "LRA", "LO"]),
  saldo: z.coerce.number().default(0),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormProps {
  onSuccess: () => void;
  editData?: any;
}

export function AccountForm({ onSuccess, editData }: AccountFormProps) {
  const isEditMode = !!editData;

  const { data: parentAccountsData } = useQuery({
    queryKey: ['master-rekening-parent'],
    queryFn: () => siaApi.getMasterRekening(),
  });

  const parentAccounts = parentAccountsData?.data?.filter(acc => acc.k_level === 'Induk') || [];

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: editData || {
      kode_rek: "",
      nama_rek: "",
      level: 1,
      k_level: "Detail",
      rek_induk: "",
      id_div: "01",
      jenis_rek: "NERACA",
      saldo: 0,
    },
  });

  async function handleSubmit(data: AccountFormValues) {
    try {
      if (isEditMode) {
        await siaApi.updateMasterRekening(editData.kode_rek, data);
        toast.success("Rekening berhasil diperbarui");
      } else {
        await siaApi.createMasterRekening(data);
        toast.success("Rekening berhasil ditambahkan");
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error("Gagal menyimpan rekening");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="kode_rek"
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
            name="nama_rek"
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
            name="k_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
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
            name="rek_induk"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rekening Induk</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih rekening induk" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {parentAccounts.map(parent => (
                      <SelectItem key={parent.kode_rek} value={parent.kode_rek}>
                        {parent.kode_rek} - {parent.nama_rek}
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
            name="jenis_rek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Rekening</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
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
            name="saldo"
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
          <Button type="submit">
            {isEditMode ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

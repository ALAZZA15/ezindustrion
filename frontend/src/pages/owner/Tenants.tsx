import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import TenantFormDialog from "@/components/TenantFormDialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiDelete, apiGet, errorMessage } from "@/lib/api";
import { formatDate, formatPhone } from "@/lib/format";
import type { Tenant } from "@/lib/types";
import { t } from "@/i18n";

export default function Tenants() {
  const qc = useQueryClient();
  const { data, isPending, isError } = useQuery({ queryKey: ["tenants"], queryFn: () => apiGet<Tenant[]>("/tenants") });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [deleting, setDeleting] = useState<Tenant | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/tenants/${id}`),
    onSuccess: () => {
      ["tenants", "rooms", "dashboard"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      toast.success(t.tenants.deleted);
      setDeleting(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const openForm = (tenant: Tenant | null) => {
    setEditing(tenant);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-forest sm:text-3xl" data-testid="tenants-title">{t.tenants.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t.tenants.subtitle}</p>
        </div>
        <Button onClick={() => openForm(null)} className="h-11 gap-2 rounded-xl px-5 active:scale-[0.98]" data-testid="add-tenant-button">
          <Plus className="size-4" /> {t.tenants.add}
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-white">
        {isPending && <p className="p-6 text-sm text-muted-foreground">{t.common.loading}</p>}
        {isError && <p className="p-6 text-sm text-muted-foreground" data-testid="tenants-error">{t.common.unavailable}</p>}
        {data && !isError && data.length === 0 && <p className="p-8 text-center text-muted-foreground" data-testid="tenants-empty">{t.tenants.empty}</p>}
        {data && !isError && data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="bg-page hover:bg-page">
                <TableHead className="pl-5 text-xs font-semibold uppercase tracking-wider">{t.tenants.name}</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t.tenants.room}</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t.tenants.phone}</TableHead>
                <TableHead className="hidden text-xs font-semibold uppercase tracking-wider md:table-cell">Email</TableHead>
                <TableHead className="hidden text-xs font-semibold uppercase tracking-wider md:table-cell">{t.tenants.moveIn}</TableHead>
                <TableHead className="pr-5 text-right text-xs font-semibold uppercase tracking-wider">{t.tenants.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((tenant) => {
                const slug = tenant.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                return (
                  <TableRow key={tenant.id} data-testid="tenant-table-row">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-full bg-lime-soft font-heading font-bold text-forest">
                          {tenant.name.charAt(0)}
                        </span>
                        <span className="font-semibold text-forest" data-testid={`tenant-${slug}-name`}>{tenant.name}</span>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`tenant-${slug}-room`}>
                      {tenant.room_number ? (
                        <span className="rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-xs font-semibold text-[#0F5132]">
                          {t.rooms.room} {tenant.room_number}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t.tenants.noRoom}</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatPhone(tenant.phone)}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{tenant.email ?? "-"}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{formatDate(tenant.move_in_date)}</TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => openForm(tenant)} aria-label={t.common.edit} data-testid={`tenant-${slug}-edit-button`}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setDeleting(tenant)}
                          aria-label={t.common.delete}
                          data-testid={`tenant-${slug}-delete-button`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <TenantFormDialog open={formOpen} onOpenChange={setFormOpen} tenant={editing} />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t.tenants.deleteTitle}
        body={t.tenants.deleteBody}
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        testId="tenant-delete"
      />
    </div>
  );
}
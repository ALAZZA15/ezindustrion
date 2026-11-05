import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPost, apiPut, errorMessage } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import type { Room, Tenant, TenantCreate, TenantUpdate } from "@/lib/types";
import { t } from "@/i18n";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
}

const NO_ROOM = "none";

export default function TenantFormDialog({ open, onOpenChange, tenant }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl sm:max-w-lg" data-testid="tenant-form-dialog">
        {open && <TenantForm key={tenant?.id ?? "new"} tenant={tenant} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function TenantForm({ tenant, onDone }: { tenant: Tenant | null; onDone: () => void }) {
  const qc = useQueryClient();
  const rooms = useQuery({ queryKey: ["rooms"], queryFn: () => apiGet<Room[]>("/rooms") });
  const [name, setName] = useState(tenant?.name ?? "");
  const [phone, setPhone] = useState(tenant ? `0${tenant.phone.replace(/^62/, "")}` : "");
  const [email, setEmail] = useState(tenant?.email ?? "");
  const [password, setPassword] = useState("");
  const [roomId, setRoomId] = useState<string>(tenant?.room_id ?? NO_ROOM);
  const [moveIn, setMoveIn] = useState(tenant?.move_in_date ?? "");
  const [emergency, setEmergency] = useState(tenant?.emergency_contact ?? "");

  const available = (rooms.data ?? []).filter((r) => r.status === "Vacant" || r.id === tenant?.room_id);
  const roomLabel = (id: string) => {
    if (id === NO_ROOM) return t.tenants.noRoom;
    const r = rooms.data?.find((x) => x.id === id);
    return r ? `${t.rooms.room} ${r.number}` : t.tenants.noRoom;
  };

  const save = useMutation({
    mutationFn: () => {
      const base = {
        name,
        phone,
        email: email.trim() || null,
        room_id: roomId === NO_ROOM ? null : roomId,
        move_in_date: moveIn || null,
        emergency_contact: emergency,
      };
      if (tenant) {
        const body: TenantUpdate = { ...base, password: password || null };
        return apiPut<Tenant>(`/tenants/${tenant.id}`, body);
      }
      const body: TenantCreate = { ...base, password };
      return apiPost<Tenant>("/tenants", body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(tenant ? t.tenants.updated : t.tenants.created);
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <DialogHeader>
        <DialogTitle className="font-heading text-xl">{tenant ? t.tenants.formEditTitle : t.tenants.formAddTitle}</DialogTitle>
        <DialogDescription>{t.tenants.formHint}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tenant-name">{t.tenants.name}</Label>
        <Input id="tenant-name" required value={name} onChange={(e) => setName(e.target.value)} data-testid="tenant-name-input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tenant-phone">{t.tenants.phone}</Label>
          <Input
            id="tenant-phone"
            required
            inputMode="tel"
            placeholder={t.tenants.phonePlaceholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-testid="tenant-phone-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tenant-email">{t.tenants.email}</Label>
          <Input
            id="tenant-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="tenant-email-input"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tenant-password">{tenant ? t.tenants.newPassword : t.tenants.password}</Label>
        <Input
          id="tenant-password"
          type="text"
          required={!tenant}
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="tenant-password-input"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>{t.tenants.room}</Label>
          <Select value={roomId} onValueChange={(v: string) => setRoomId(v)}>
            <SelectTrigger className="w-full" data-testid="tenant-room-select">
              <SelectValue placeholder={t.tenants.noRoom}>{roomLabel(roomId)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_ROOM} data-testid="tenant-room-option-none">
                {t.tenants.noRoom}
              </SelectItem>
              {available.map((r) => (
                <SelectItem key={r.id} value={r.id} data-testid={`tenant-room-option-${r.number}`}>
                  {t.rooms.room} {r.number} · {formatRupiah(r.price)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tenant-move-in">{t.tenants.moveIn}</Label>
          <Input
            id="tenant-move-in"
            type="date"
            value={moveIn}
            onChange={(e) => setMoveIn(e.target.value)}
            data-testid="tenant-move-in-input"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tenant-emergency">{t.tenants.emergency}</Label>
        <Input
          id="tenant-emergency"
          placeholder={t.tenants.emergencyPlaceholder}
          value={emergency}
          onChange={(e) => setEmergency(e.target.value)}
          data-testid="tenant-emergency-input"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} data-testid="tenant-form-cancel-button">
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={save.isPending} data-testid="tenant-form-submit-button">
          {save.isPending ? t.common.saving : t.common.save}
        </Button>
      </DialogFooter>
    </form>
  );
}
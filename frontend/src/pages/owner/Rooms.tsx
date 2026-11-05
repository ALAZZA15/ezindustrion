import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BedDouble, Camera, Pencil, Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import RoomFormDialog from "@/components/RoomFormDialog";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { apiDelete, apiGet, errorMessage } from "@/lib/api";
import { formatRupiah, ordinal } from "@/lib/format";
import type { Room } from "@/lib/types";
import { t } from "@/i18n";

export default function Rooms() {
  const qc = useQueryClient();
  const { data, isPending, isError } = useQuery({ queryKey: ["rooms"], queryFn: () => apiGet<Room[]>("/rooms") });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState<Room | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/rooms/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(t.rooms.deleted);
      setDeleting(null);
    },
    onError: (e) => {
      toast.error(errorMessage(e));
      setDeleting(null);
    },
  });

  const openForm = (room: Room | null) => {
    setEditing(room);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-forest sm:text-3xl" data-testid="rooms-title">{t.rooms.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t.rooms.subtitle}</p>
        </div>
        <Button onClick={() => openForm(null)} className="h-11 gap-2 rounded-xl px-5 active:scale-[0.98]" data-testid="add-room-button">
          <Plus className="size-4" /> {t.rooms.add}
        </Button>
      </div>

      {isPending && <p className="text-sm text-muted-foreground">{t.common.loading}</p>}
      {isError && <p className="text-sm text-muted-foreground" data-testid="rooms-error">{t.common.unavailable}</p>}
      {data && !isError && data.length === 0 && (
        <p className="rounded-2xl border border-dashed bg-white p-8 text-center text-muted-foreground" data-testid="rooms-empty">{t.rooms.empty}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {!isError &&
          data?.map((room, i) => (
            <article
              key={room.id}
              className="animate-rise-in group flex flex-col overflow-hidden rounded-3xl border bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ animationDelay: `${i * 50}ms` }}
              data-testid="room-card-item"
            >
              <div className="relative aspect-[16/10] bg-muted">
                {room.photos[0] ? (
                  <img src={room.photos[0]} alt={`${t.rooms.room} ${room.number}`} className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-1 text-xs">
                      <BedDouble className="size-8" /> {t.rooms.noPhotos}
                    </div>
                  </div>
                )}
                <div className="absolute left-3 top-3">
                  <StatusBadge status={room.status} testId={`room-${room.number}-status-badge`} />
                </div>
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white backdrop-blur">
                  <Camera className="size-3" /> {room.photos.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-forest" data-testid={`room-${room.number}-title`}>{t.rooms.room} {room.number}</h3>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <User className="size-3.5" /> {room.tenant_name ?? "-"}
                    </p>
                  </div>
                  <p className="text-right">
                    <span className="font-heading text-lg font-extrabold text-forest" data-testid={`room-${room.number}-price`}>{formatRupiah(room.price)}</span>
                    <span className="block text-xs text-muted-foreground">{t.common.perMonth}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {room.amenities.map((a) => (
                    <span key={a} className="rounded-full bg-lime-soft/70 px-2.5 py-0.5 text-xs font-medium text-forest">{a}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.rooms.dueDay} {ordinal(room.due_day)} {t.rooms.dueDaySuffix}
                </p>
                <div className="mt-auto flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 gap-1.5 rounded-xl" onClick={() => openForm(room)} data-testid={`room-${room.number}-edit-button`}>
                    <Pencil className="size-3.5" /> {t.common.edit}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeleting(room)}
                    aria-label={t.common.delete}
                    data-testid={`room-${room.number}-delete-button`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
      </div>

      <RoomFormDialog open={formOpen} onOpenChange={setFormOpen} room={editing} />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t.rooms.deleteTitle}
        body={t.rooms.deleteBody}
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        testId="room-delete"
      />
    </div>
  );
}
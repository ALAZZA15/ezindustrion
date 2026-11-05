import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPost, apiPut, apiUpload, errorMessage } from "@/lib/api";
import type { Room, RoomInput } from "@/lib/types";
import { t } from "@/i18n";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null; // null = create
}

const EMPTY: RoomInput = {
  number: "",
  price: 900000,
  due_day: 1,
  amenities: ["Private bathroom", "WiFi", "Bed + wardrobe"],
  description: "",
  size: "",
  floor: "",
};

function toInput(room: Room | null): RoomInput {
  if (!room) return EMPTY;
  const { number, price, due_day, amenities, description, size, floor } = room;
  return { number, price, due_day, amenities, description, size, floor };
}

export default function RoomFormDialog({ open, onOpenChange, room }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl sm:max-w-xl" data-testid="room-form-dialog">
        {open && <RoomForm key={room?.id ?? "new"} initial={room} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function RoomForm({ initial, onDone }: { initial: Room | null; onDone: () => void }) {
  const qc = useQueryClient();
  const [room, setRoom] = useState<Room | null>(initial);
  const [form, setForm] = useState<RoomInput>(toInput(initial));
  const fileRef = useRef<HTMLInputElement>(null);
  const amenityOptions = Array.from(new Set([...t.amenities, ...form.amenities]));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["rooms"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const save = useMutation({
    mutationFn: (body: RoomInput) => (room ? apiPut<Room>(`/rooms/${room.id}`, body) : apiPost<Room>("/rooms", body)),
    onSuccess: (saved) => {
      invalidate();
      if (room) {
        toast.success(t.rooms.updated);
        onDone();
      } else {
        toast.success(t.rooms.created);
        setRoom(saved);
      }
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const upload = useMutation({
    mutationFn: (files: FileList) => {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      return apiUpload<Room>(`/rooms/${room!.id}/photos`, fd);
    },
    onSuccess: (saved) => {
      setRoom(saved);
      invalidate();
      toast.success(t.rooms.photoAdded);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const removePhoto = useMutation({
    mutationFn: (url: string) => apiPost<Room>(`/rooms/${room!.id}/photos/delete`, { url }),
    onSuccess: (saved) => {
      setRoom(saved);
      invalidate();
      toast.success(t.rooms.photoRemoved);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const toggleAmenity = (a: string, checked: boolean) =>
    setForm((f) => ({ ...f, amenities: checked ? [...f.amenities, a] : f.amenities.filter((x) => x !== a) }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(form);
      }}
      className="flex flex-col gap-5"
    >
      <DialogHeader>
        <DialogTitle className="font-heading text-xl">{room ? t.rooms.formEditTitle : t.rooms.formAddTitle}</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="room-number">{t.rooms.number}</Label>
          <Input
            id="room-number"
            required
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            placeholder="6"
            data-testid="room-number-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="room-price">{t.rooms.price}</Label>
          <Input
            id="room-price"
            type="number"
            min={1}
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            data-testid="room-price-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="room-due">{t.rooms.due}</Label>
          <Input
            id="room-due"
            type="number"
            min={1}
            max={28}
            required
            value={form.due_day}
            onChange={(e) => setForm({ ...form, due_day: Number(e.target.value) })}
            data-testid="room-due-day-input"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="room-size">{t.rooms.size}</Label>
            <Input
              id="room-size"
              value={form.size}
              placeholder={t.rooms.sizePlaceholder}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              data-testid="room-size-input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="room-floor">{t.rooms.floor}</Label>
            <Input
              id="room-floor"
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: e.target.value })}
              data-testid="room-floor-input"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="room-desc">{t.rooms.description}</Label>
        <Textarea
          id="room-desc"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          data-testid="room-description-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t.rooms.amenities}</Label>
        <div className="grid grid-cols-2 gap-2">
          {amenityOptions.map((a) => {
            const slug = a.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return (
              <label
                key={a}
                className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-xl border bg-white px-3 text-sm transition-colors hover:border-lime-500"
              >
                <Checkbox
                  checked={form.amenities.includes(a)}
                  onCheckedChange={(c) => toggleAmenity(a, c === true)}
                  data-testid={`amenity-checkbox-${slug}`}
                />
                {a}
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t.rooms.photos}</Label>
        {room ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {room.photos.map((url, i) => (
                <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  <img src={url} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto.mutate(url)}
                    className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={t.rooms.removePhoto}
                    data-testid={`room-photo-remove-${i}`}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={upload.isPending}
                className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-lime-500/60 bg-lime-soft/40 text-xs font-medium text-forest transition-colors hover:bg-lime-soft"
                data-testid="room-photo-upload-button"
              >
                {upload.isPending ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                {upload.isPending ? t.rooms.uploading : t.rooms.uploadPhotos}
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files?.length) upload.mutate(e.target.files);
                e.target.value = "";
              }}
              data-testid="room-photo-file-input"
            />
            <p className="text-xs text-muted-foreground">{t.rooms.photosHint}</p>
          </>
        ) : (
          <p className="rounded-xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">{t.rooms.photosAfterSave}</p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} data-testid="room-form-cancel-button">
          {room && !initial ? t.common.close : t.common.cancel}
        </Button>
        <Button type="submit" disabled={save.isPending} className="active:scale-[0.98]" data-testid="room-form-submit-button">
          {save.isPending ? t.common.saving : t.common.save}
        </Button>
      </DialogFooter>
    </form>
  );
}
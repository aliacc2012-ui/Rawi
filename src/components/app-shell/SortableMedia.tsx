"use client";

import { useState, useTransition } from "react";
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderProjectMedia, deleteProjectMedia, setGalleryCover } from "@/app/(app)/actions";

type MediaItem = {
  id: string;
  original_name: string;
  media_type: "image" | "video" | "raw";
  processing_status: string;
  preview_url?: string | null;
};

export function SortableMedia({
  projectId,
  galleryId,
  initialMedia,
  initialCoverId,
}: {
  projectId: string;
  galleryId: string;
  initialMedia: MediaItem[];
  initialCoverId?: string | null;
}) {
  const [items, setItems] = useState(initialMedia);
  const [coverId, setCoverId] = useState<string | null>(initialCoverId ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    setMessage("Saving order…");
    startTransition(async () => {
      const result = await reorderProjectMedia(projectId, next.map((item) => item.id));
      if (result?.error) {
        setItems(previous);
        setMessage(result.error);
      } else {
        setMessage("Order saved ✓");
        window.setTimeout(() => setMessage(null), 1800);
      }
    });
  }

  function handleDelete(mediaId: string) {
    const previous = items;
    setItems((curr) => curr.filter((i) => i.id !== mediaId));
    if (coverId === mediaId) setCoverId(null);
    startTransition(async () => {
      const result = await deleteProjectMedia(projectId, mediaId);
      if (result?.error) {
        setItems(previous);
        setMessage(result.error);
      }
    });
  }

  function handleSetCover(mediaId: string | null) {
    const previous = coverId;
    setCoverId(mediaId);
    setMessage(mediaId ? "Setting cover…" : "Removing cover…");
    startTransition(async () => {
      const result = await setGalleryCover(galleryId, mediaId);
      if (result?.error) {
        setCoverId(previous);
        setMessage(result.error);
      } else {
        setMessage(mediaId ? "Cover set ✓" : "Cover removed ✓");
        window.setTimeout(() => setMessage(null), 1800);
      }
    });
  }

  if (!items.length) return <p className="text-sm text-white/45">No media yet — upload photos or video below.</p>;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-white/45">Drag media to set the order your client will see.</p>
        {message && (
          <span className={`text-xs font-semibold ${message.includes("✓") ? "text-emerald-400" : message.includes("…") ? "text-white/45" : "text-red-500"}`}>
            {message}
          </span>
        )}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
          <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${isPending ? "opacity-80" : ""}`}>
            {items.map((item, index) => (
              <SortableCard
                key={item.id}
                item={item}
                index={index}
                isCover={coverId === item.id}
                onDelete={() => handleDelete(item.id)}
                onSetCover={() => handleSetCover(coverId === item.id ? null : item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableCard({
  item,
  index,
  isCover,
  onDelete,
  onSetCover,
}: {
  item: MediaItem;
  index: number;
  isCover: boolean;
  onDelete: () => void;
  onSetCover: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative cursor-grab overflow-hidden rounded-2xl border bg-rawi-panel active:cursor-grabbing ${
        isCover ? "border-[#FFD400] ring-1 ring-[#FFD400]/30" : isDragging ? "border-[#FFD400] shadow-xl" : "border-white/[.07]"
      }`}
    >
      <div className="relative aspect-[4/3] bg-rawi-panel/[.06]">
        {item.media_type === "image" && item.preview_url
          ? <img src={item.preview_url} alt={item.original_name} className="h-full w-full object-cover" draggable={false} />
          : <div className="grid h-full place-items-center text-3xl text-white/60">{item.media_type === "video" ? "▶" : "▧"}</div>
        }

        {/* Cover badge */}
        {isCover && (
          <span className="absolute left-2 top-2 rounded-full bg-[#FFD400] px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-black">
            COVER
          </span>
        )}
        {!isCover && (
          <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-1 text-[10px] font-bold text-white">{index + 1}</span>
        )}

        <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/65 text-sm text-white opacity-80">⠿</span>

        {/* Hover action bar */}
        {!confirming && item.media_type === "image" && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 flex justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-5 opacity-0 transition group-hover:opacity-100"
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSetCover(); }}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                isCover ? "bg-[#FFD400]/20 text-[#FFD400] hover:bg-[#FFD400]/30" : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              {isCover ? "✓ Cover" : "Set cover"}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
              className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70 hover:bg-red-600/80 hover:text-white transition"
            >
              Delete
            </button>
          </div>
        )}

        {/* Delete confirmation overlay */}
        {confirming && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80"
          >
            <p className="text-center text-xs font-semibold text-white">Delete this photo?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-500"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirming(false); }}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white hover:bg-white/25"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Delete button for non-image (video/raw) — no cover option */}
        {!confirming && item.media_type !== "image" && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
            className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      <div className="p-2.5">
        <div className="truncate text-xs font-semibold text-white/65">{item.original_name}</div>
        <div className="mt-1 text-[10px] capitalize text-white/45">{item.processing_status}</div>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderProjectMedia } from "@/app/(app)/actions";

type MediaItem = {
  id: string;
  original_name: string;
  media_type: "image" | "video" | "raw";
  processing_status: string;
  preview_url?: string | null;
};

export function SortableMedia({ projectId, initialMedia }: { projectId: string; initialMedia: MediaItem[] }) {
  const [items, setItems] = useState(initialMedia);
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

  if (!items.length) return <p className="text-sm text-white/45">No media yet — upload photos or video below.</p>;

  return <div>
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-xs text-white/45">Drag media to set the order your client will see.</p>
      {message && <span className={`text-xs font-semibold ${message.includes("✓") ? "text-emerald-600" : message.includes("Saving") ? "text-white/45" : "text-red-500"}`}>{message}</span>}
    </div>
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
        <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${isPending ? "opacity-80" : ""}`}>
          {items.map((item, index) => <SortableCard key={item.id} item={item} index={index} />)}
        </div>
      </SortableContext>
    </DndContext>
  </div>;
}

function SortableCard({ item, index }: { item: MediaItem; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined };
  return <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`group cursor-grab overflow-hidden rounded-2xl border bg-rawi-panel active:cursor-grabbing ${isDragging ? "border-[#FFD400] shadow-xl" : "border-white/[.07]"}`}>
    <div className="relative aspect-[4/3] bg-rawi-panel/[.06]">
      {item.media_type === "image" && item.preview_url ? <img src={item.preview_url} alt={item.original_name} className="h-full w-full object-cover" draggable={false}/> : <div className="grid h-full place-items-center text-3xl text-white/60">{item.media_type === "video" ? "▶" : "▧"}</div>}
      <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-1 text-[10px] font-bold text-white">{index + 1}</span>
      <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/65 text-sm text-white opacity-80">⠿</span>
    </div>
    <div className="p-2.5">
      <div className="truncate text-xs font-semibold text-white/65">{item.original_name}</div>
      <div className="mt-1 text-[10px] capitalize text-white/45">{item.processing_status}</div>
    </div>
  </div>;
}

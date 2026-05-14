import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createHabit,
  deleteHabit,
  listHabits,
  updateHabit,
} from "../api/habits";
import type { Frequency, Habit } from "../types/habit";

const ICONS = [
  "⭐", "🏃", "💧", "📚", "🧘", "💪", "🥗", "😴",
  "🎨", "🎵", "💻", "🌱", "🧹", "🪥", "☕", "📝",
  "🚴", "🧠", "🙏", "🔥",
];

const COLORS = [
  "#a78bfa", "#f472b6", "#34d399", "#fbbf24",
  "#60a5fa", "#fb923c", "#f87171", "#22d3ee",
];

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export default function HabitsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const habitsQuery = useQuery({ queryKey: ["habits"], queryFn: listHabits });
  const habits = habitsQuery.data?.habits ?? [];

  const reorder = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await Promise.all(
        orderedIds.map((id, idx) => updateHabit(id, { order: idx }))
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateHabit(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });

  const removeHabit = useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = habits.findIndex((h) => h.id === active.id);
    const newIdx = habits.findIndex((h) => h.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(habits, oldIdx, newIdx);
    qc.setQueryData(["habits"], { habits: reordered });
    reorder.mutate(reordered.map((h) => h.id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink-900">Mes habitudes</h2>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="btn-primary text-sm"
        >
          + Nouvelle
        </button>
      </div>

      {habitsQuery.isLoading && (
        <div className="space-y-2">
          <div className="skeleton h-14" />
          <div className="skeleton h-14" />
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {habits.map((h) => (
              <SortableHabit
                key={h.id}
                habit={h}
                onEdit={() => {
                  setEditing(h);
                  setShowModal(true);
                }}
                onDelete={() => removeHabit.mutate(h.id)}
                onToggleActive={() =>
                  toggleActive.mutate({ id: h.id, is_active: !h.is_active })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showModal && (
        <HabitModal
          initial={editing}
          onClose={() => setShowModal(false)}
          onSubmit={async (data) => {
            if (editing) {
              await updateHabit(editing.id, data);
            } else {
              await createHabit(data);
            }
            await qc.invalidateQueries({ queryKey: ["habits"] });
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function SortableHabit({
  habit,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: habit.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card p-3 flex items-center gap-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-pulse-300 hover:text-pulse-500 px-1"
        aria-label="drag"
      >
        ⋮⋮
      </button>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ backgroundColor: `${habit.color}33` }}
      >
        {habit.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink-900 truncate">{habit.name}</div>
        <div className="text-xs text-muted">
          🔥 {habit.streak_current}d · best {habit.streak_best}d · {habit.frequency}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="px-2 py-1 rounded hover:bg-pulse-50 text-sm"
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={onToggleActive}
          className="px-2 py-1 rounded hover:bg-pulse-50 text-sm"
          title={habit.is_active ? "Désactiver" : "Activer"}
        >
          {habit.is_active ? "👁" : "🚫"}
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-1 rounded hover:bg-pulse-50 text-sm text-red-500"
          title="Supprimer"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

function HabitModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial: Habit | null;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    icon: string;
    color: string;
    frequency: Frequency;
    frequency_days: number[];
  }) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "⭐");
  const [color, setColor] = useState(initial?.color ?? "#a78bfa");
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? "daily");
  const [days, setDays] = useState<number[]>(initial?.frequency_days ?? []);
  const [busy, setBusy] = useState(false);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onSubmit({
        name: name.trim(),
        icon,
        color,
        frequency,
        frequency_days: frequency === "custom" ? days : [],
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-pulse-100 rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto shadow-xl animate-slide-up">
        <h3 className="text-lg font-semibold text-ink-900">
          {initial ? "Modifier l'habitude" : "Nouvelle habitude"}
        </h3>

        <div>
          <label className="block text-sm mb-1 text-ink-700">Nom</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-pulse-50 border border-pulse-100 focus:outline-none focus:border-pulse-400"
            placeholder="Ex : Boire 2L d'eau"
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-ink-700">Icône</label>
          <div className="grid grid-cols-10 gap-1">
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={`aspect-square rounded-lg text-xl transition ${
                  icon === i ? "bg-pulse-400 text-white" : "bg-pulse-50 hover:bg-pulse-100"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2 text-ink-700">Couleur</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition ${
                  color === c ? "ring-2 ring-offset-2 ring-offset-white ring-pulse-500" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2 text-ink-700">Fréquence</label>
          <div className="flex gap-2">
            {(["daily", "weekly", "custom"] as Frequency[]).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`flex-1 py-2 rounded-xl text-sm capitalize ${
                  frequency === f
                    ? "bg-pulse-400 text-white"
                    : "bg-pulse-50 hover:bg-pulse-100 text-ink-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {frequency === "custom" && (
            <div className="flex gap-1 mt-3">
              {DAY_LABELS.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={`flex-1 py-2 rounded-xl text-sm ${
                    days.includes(idx)
                      ? "bg-pulse-400 text-white"
                      : "bg-pulse-50 hover:bg-pulse-100 text-ink-700"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary text-sm">
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={busy || !name.trim()}
            className="btn-primary text-sm"
          >
            {busy ? "…" : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listJournal, updateEntry, upsertTodayEntry } from "../api/journal";
import { EnergySlider } from "../components/EnergySlider";
import type { JournalEntry } from "../types/journal";

export default function JournalPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [creating, setCreating] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [draftEnergy, setDraftEnergy] = useState(3);

  const q = useQuery({
    queryKey: ["journal", page],
    queryFn: () => listJournal(page, 10),
  });

  const save = useMutation({
    mutationFn: async () => {
      if (selected) {
        return updateEntry(selected.id, {
          content: draftContent,
          energy_level: draftEnergy,
        });
      }
      return upsertTodayEntry({ content: draftContent, energy_level: draftEnergy });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      qc.invalidateQueries({ queryKey: ["journal-today"] });
      setSelected(null);
      setCreating(false);
      setDraftContent("");
      setDraftEnergy(3);
    },
  });

  function openEntry(e: JournalEntry) {
    setSelected(e);
    setCreating(false);
    setDraftContent(e.content);
    setDraftEnergy(e.energy_level);
  }

  function openNew() {
    setCreating(true);
    setSelected(null);
    setDraftContent("");
    setDraftEnergy(3);
  }

  const entries = q.data?.entries ?? [];
  const pagination = q.data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink-900">Journal</h2>
        <button onClick={openNew} className="btn-primary text-sm">
          + Nouvelle entrée
        </button>
      </div>

      {q.isLoading && (
        <div className="space-y-2">
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
        </div>
      )}
      {!q.isLoading && entries.length === 0 && (
        <div className="card p-6 text-center text-muted">
          Aucune entrée. Commence par écrire ta première !
        </div>
      )}

      <div className="space-y-2">
        {entries.map((e) => (
          <button
            key={e.id}
            onClick={() => openEntry(e)}
            className="w-full text-left card hover:border-pulse-200 p-4 transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-ink-900 font-semibold">
                {new Date(e.entry_date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className="text-xs text-muted">⚡ {e.energy_level}/5</span>
            </div>
            <p className="text-sm text-muted line-clamp-2">{e.content}</p>
          </button>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-lg bg-white border border-pulse-100 disabled:opacity-50 text-sm"
          >
            ‹
          </button>
          <span className="text-sm text-muted">
            {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-3 py-1 rounded-lg bg-white border border-pulse-100 disabled:opacity-50 text-sm"
          >
            ›
          </button>
        </div>
      )}

      {(selected || creating) && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-pulse-100 rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto shadow-xl animate-slide-up">
            <h3 className="text-lg font-semibold text-ink-900">
              {selected
                ? new Date(selected.entry_date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "Nouvelle entrée (aujourd'hui)"}
            </h3>
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              rows={8}
              className="w-full bg-pulse-50 border border-pulse-100 rounded-xl p-3 focus:outline-none focus:border-pulse-400 resize-none text-ink-900"
              placeholder="Écris ici…"
            />
            <EnergySlider value={draftEnergy} onChange={setDraftEnergy} />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelected(null);
                  setCreating(false);
                }}
                className="btn-secondary text-sm"
              >
                Fermer
              </button>
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending || draftContent.trim().length === 0}
                className="btn-primary text-sm"
              >
                {save.isPending ? "…" : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

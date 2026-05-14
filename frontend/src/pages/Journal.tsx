import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listJournal, updateEntry, upsertTodayEntry } from "../api/journal";
import { EnergySlider } from "../components/EnergySlider";
import type { JournalEntry } from "../types/journal";
import { useToast } from "../components/Toast";

export default function JournalPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
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
      toast("Entrée sauvegardée.", "success");
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
    <div className="space-y-4 stagger pt-2">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="eyebrow">Journal</div>
          <h1 className="display text-[1.7rem] sm:text-[2rem] leading-none mt-1">
            Mes <span className="flourish">pages</span>
          </h1>
        </div>
        <button onClick={openNew} className="btn-primary whitespace-nowrap shrink-0">
          + Entrée
        </button>
      </header>

      {q.isLoading && (
        <div className="space-y-2">
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
        </div>
      )}
      {!q.isLoading && entries.length === 0 && (
        <div className="card card-tinted-butter p-8 text-center">
          <div className="text-4xl mb-2">✍️</div>
          <h3 className="display text-xl mb-1">Pages blanches</h3>
          <p className="text-sm text-ink-soft mb-4 max-w-xs mx-auto">
            Écris ta première entrée — même quelques mots.
          </p>
          <button onClick={openNew} className="btn-primary">Commencer</button>
        </div>
      )}

      <div className="relative">
        {entries.length > 0 && (
          <div
            aria-hidden
            className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-peach-200 via-rose-200 to-lavender-200"
          />
        )}
        <div className="space-y-3 stagger">
          {entries.map((e) => {
            const date = new Date(e.entry_date);
            const day = date.getDate();
            const monthShort = date.toLocaleDateString("fr-FR", { month: "short" });
            const weekday = date.toLocaleDateString("fr-FR", { weekday: "long" });
            return (
              <button
                key={e.id}
                onClick={() => openEntry(e)}
                className="relative w-full text-left card card-hover pl-14 pr-4 py-4 transition"
              >
                <span
                  aria-hidden
                  className="absolute left-1 top-4 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold uppercase text-ink border border-hairline"
                  style={{ background: "var(--grad-sunrise-soft)" }}
                >
                  {day}
                </span>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm font-semibold capitalize text-ink">
                    {weekday} {day} {monthShort}
                  </span>
                  <span className="chip">⚡ {e.energy_level}/5</span>
                </div>
                <p className="text-sm text-ink-soft line-clamp-2 font-display">
                  {e.content}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-40"
          >
            ‹
          </button>
          <span className="font-mono text-xs text-muted">
            {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="btn-secondary disabled:opacity-40"
          >
            ›
          </button>
        </div>
      )}

      {(selected || creating) && (
        <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="bg-paper border border-hairline rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full sm:max-w-lg space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl animate-slide-up"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">{selected ? "Édition" : "Aujourd'hui"}</div>
                <h3 className="display text-xl">
                  {selected
                    ? new Date(selected.entry_date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    : "Nouvelle entrée"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelected(null);
                  setCreating(false);
                }}
                className="text-muted hover:text-ink w-9 h-9 rounded-full flex items-center justify-center hover:bg-peach-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="m5 5 14 14M19 5 5 19" />
                </svg>
              </button>
            </div>
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              rows={9}
              className="w-full bg-cream border border-hairline rounded-xl p-4 focus:outline-none focus:border-peach-300 focus:ring-4 focus:ring-peach-200/40 resize-none font-display text-[15px] leading-relaxed text-ink"
              placeholder="Écris ici…"
              autoFocus
            />
            <EnergySlider value={draftEnergy} onChange={setDraftEnergy} />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelected(null);
                  setCreating(false);
                }}
                className="btn-secondary"
              >
                Fermer
              </button>
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending || draftContent.trim().length === 0}
                className="btn-primary"
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

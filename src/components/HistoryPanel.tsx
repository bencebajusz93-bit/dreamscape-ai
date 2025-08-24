"use client";

import { useDreamStore, type HistoryItem } from "@/store/useDreamStore";

type HistoryPanelProps = {
  onReRender: (item: HistoryItem) => void;
  onLoad: (item: HistoryItem) => void;
};

export default function HistoryPanel({ onReRender, onLoad }: HistoryPanelProps) {
  const history = useDreamStore((s) => s.history);
  const removeHistoryItem = useDreamStore((s) => s.removeHistoryItem);
  const clearHistory = useDreamStore((s) => s.clearHistory);

  if (!history.length) return null;

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-white/70">Session History</h3>
        <button
          type="button"
          onClick={clearHistory}
          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/[0.12]"
        >
          Clear all
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {history.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.result.imageUrl ?? `https://source.unsplash.com/320x180/?dream&sig=${item.id}`}
                alt="Thumb"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate text-xs text-white/60">{item.style} • {item.aspectRatio} • {item.lengthPreference}</span>
                <span className="ml-2 shrink-0 text-[10px] text-white/40">{new Date(item.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-white/80">{item.dream}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => onLoad(item)}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-white/80 transition hover:bg-white/[0.12]"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => onReRender(item)}
                  className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2.5 py-1 text-xs font-medium text-white"
                >
                  Re-render
                </button>
                <button
                  type="button"
                  onClick={() => removeHistoryItem(item.id)}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-white/70 transition hover:bg-white/[0.12]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



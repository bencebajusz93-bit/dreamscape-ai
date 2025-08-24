"use client";

import { useDreamStore } from "@/store/useDreamStore";

export default function AdvancedControls() {
  const lengthPreference = useDreamStore((s) => s.lengthPreference);
  const temperature = useDreamStore((s) => s.temperature);
  const aspectRatio = useDreamStore((s) => s.aspectRatio);
  const setLengthPreference = useDreamStore((s) => s.setLengthPreference);
  const setTemperature = useDreamStore((s) => s.setTemperature);
  const setAspectRatio = useDreamStore((s) => s.setAspectRatio);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-medium uppercase tracking-wider text-white/70">Advanced Controls</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs text-white/60">Length</label>
          <div className="mt-2 flex gap-2">
            {(["short", "medium", "long"] as const).map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => setLengthPreference(len)}
                className={
                  `rounded-full px-3 py-1.5 text-sm transition ` +
                  (lengthPreference === len
                    ? "border border-violet-400/70 bg-white/[0.14] text-white"
                    : "border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.12]")
                }
                aria-pressed={lengthPreference === len}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-white/60">Temperature: {temperature.toFixed(2)}</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="mt-2 w-full"
            aria-label="Temperature"
          />
        </div>

        <div>
          <label className="text-xs text-white/60">Aspect Ratio</label>
          <div className="mt-2 flex gap-2">
            {(["1:1", "16:9", "9:16"] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                className={
                  `rounded-full px-3 py-1.5 text-sm transition ` +
                  (aspectRatio === ratio
                    ? "border border-violet-400/70 bg-white/[0.14] text-white"
                    : "border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.12]")
                }
                aria-pressed={aspectRatio === ratio}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



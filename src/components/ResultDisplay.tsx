import { useEffect, useState } from "react";
import { useDreamStore } from "@/store/useDreamStore";

export default function ResultDisplay() {
  const isLoading = useDreamStore((s) => s.isLoading);
  const result = useDreamStore((s) => s.result);
  const aspectRatio = useDreamStore((s) => s.aspectRatio);
  const dream = useDreamStore((s) => s.dreamDescription);
  const style = useDreamStore((s) => s.selectedStyle);
  const lengthPreference = useDreamStore((s) => s.lengthPreference);
  const temperature = useDreamStore((s) => s.temperature);

  // Hooks must run on every render; initialize image state unconditionally
  const [imgSrc, setImgSrc] = useState<string | null>(result.imageUrl ?? null);

  useEffect(() => {
    setImgSrc(result.imageUrl ?? null);
  }, [result.imageUrl]);

  const handleImgError = () => {
    const sig = Date.now();
    const dims = aspectRatio === "1:1" ? "1200x1200" : aspectRatio === "9:16" ? "900x1600" : "1600x900";
    setImgSrc(`https://source.unsplash.com/${dims}/?dream,surreal,art&sig=${sig}`);
  };

  const hasResult = Boolean(result?.imageUrl || result?.analysisText);

  if (isLoading) {
    return (
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-white/80">
        <div className="flex flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />
          <p className="mt-4 text-sm">Visualizing the void...</p>
        </div>
      </div>
    );
  }

  if (!hasResult) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {result.analysisText ? (
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(result.analysisText ?? "");
              } catch {}
            }}
            className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/[0.12]"
          >
            Copy analysis
          </button>
        ) : null}
        {result.imageUrl ? (
          <button
            type="button"
            onClick={async () => {
              const url = result.imageUrl as string;
              try {
                // Try to fetch and force a same-origin blob for reliable download
                const resp = await fetch(url);
                const blob = await resp.blob();
                const obj = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = obj;
                a.download = "dreamscape.png";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(obj);
              } catch {
                // Fallback to opening in a new tab
                const a = document.createElement("a");
                a.href = url;
                a.target = "_blank";
                a.rel = "noopener";
                document.body.appendChild(a);
                a.click();
                a.remove();
              }
            }}
            className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/[0.12]"
          >
            Download image
          </button>
        ) : null}
        <button
          type="button"
          onClick={async () => {
            try {
              const base = window.location.origin + window.location.pathname;
              const payload = { d: dream, s: style, l: lengthPreference, t: temperature, r: aspectRatio };
              const json = JSON.stringify(payload);
              // URL-safe base64
              const encoded = btoa(unescape(encodeURIComponent(json))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
              const shareUrl = `${base}?p=${encoded}`;
              await navigator.clipboard.writeText(shareUrl);
            } catch {}
          }}
          className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1.5 text-xs font-medium text-white"
        >
          Share link
        </button>
      </div>

      {imgSrc ? (
        <div className={`overflow-hidden rounded-xl bg-black/20 ${aspectRatio === "1:1" ? "aspect-square" : aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-[16/9]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt="Dream visualization"
            onError={handleImgError}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      {result.analysisText ? (
        <p className="mt-4 leading-relaxed text-white/80">{result.analysisText}</p>
      ) : null}
    </div>
  );
}



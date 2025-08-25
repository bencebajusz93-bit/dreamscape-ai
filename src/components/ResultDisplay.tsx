import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
            className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs sm:text-sm text-white/80 transition hover:bg-white/[0.12]"
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
            className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs sm:text-sm text-white/80 transition hover:bg-white/[0.12]"
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
          className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3.5 py-2 text-xs sm:text-sm font-medium text-white"
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
            className="h-full w-full object-cover touch-pan-y select-none"
          />
        </div>
      ) : null}
      {result.analysisText ? (
        <div className="prose prose-invert prose-sm sm:prose-base max-w-none mt-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h3: ({ node, ...props }) => (
                <h3 className="mt-6 text-xl font-semibold text-white" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="mt-4 text-lg font-semibold text-white" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="leading-relaxed text-white/80" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-5 space-y-1" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="marker:text-white/60" {...props} />
              ),
              hr: () => <hr className="my-6 border-white/10" />,
              strong: ({ node, ...props }) => (
                <strong className="text-white" {...props} />
              ),
              em: ({ node, ...props }) => <em className="text-white/90" {...props} />,
            }}
          >
            {result.analysisText}
          </ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}



import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDreamStore } from "@/store/useDreamStore";
import EnhancedLoadingScreen from "@/components/EnhancedLoadingScreen";

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
  const [, setImageLoaded] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    setImgSrc(result.imageUrl ?? null);
    setImageLoaded(false);
    setShowImage(false);
  }, [result.imageUrl]);

  const handleImgLoad = () => {
    setImageLoaded(true);
    // Trigger animation after a small delay
    setTimeout(() => setShowImage(true), 50);
  };

  const handleImgError = () => {
    const sig = Date.now();
    const dims = aspectRatio === "1:1" ? "1200x1200" : aspectRatio === "9:16" ? "900x1600" : "1600x900";
    setImgSrc(`https://source.unsplash.com/${dims}/?dream,surreal,art&sig=${sig}`);
  };

  const hasResult = Boolean(result?.imageUrl || result?.analysisText);

  if (isLoading) {
    return <EnhancedLoadingScreen className="mt-8" />;
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
        <div className={`overflow-hidden rounded-xl bg-black/20 ${aspectRatio === "1:1" ? "aspect-square" : aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-[16/9]"} mt-6`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt="Dream visualization"
            onError={handleImgError}
            onLoad={handleImgLoad}
            className={`h-full w-full object-cover touch-pan-y select-none transition-all duration-1000 ease-out ${
              showImage 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-105 translate-y-4'
            }`}
          />
        </div>
      ) : null}
      {result.analysisText ? (
        <div className="mt-8 relative">
          {/* Journal-style background with paper texture */}
          <div className="relative bg-gradient-to-br from-amber-50/5 to-yellow-50/5 rounded-2xl border border-amber-200/10 shadow-2xl overflow-hidden">
            {/* Decorative elements for journal aesthetic */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
              <div className="absolute top-4 left-4 w-2 h-2 bg-amber-300 rounded-full"></div>
              <div className="absolute top-6 right-6 w-1 h-1 bg-amber-300 rounded-full"></div>
              <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-amber-300 rounded-full"></div>
            </div>
            
            {/* Left margin line like in a real journal */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-red-300/20 to-transparent"></div>
            
            {/* Journal header */}
            <div className="px-8 py-6 border-b border-amber-200/10 bg-gradient-to-r from-amber-50/3 to-yellow-50/3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📔</div>
                <div>
                  <h3 className="text-xl font-serif text-amber-100 tracking-wide">Dream Analysis</h3>
                  <p className="text-sm text-amber-200/60 font-light">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Journal content */}
            <div className="px-8 py-8 pl-12 relative">
              <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h3: ({ ...props }) => (
                      <h3 className="mt-8 mb-4 text-2xl font-serif text-amber-100 border-b border-amber-200/20 pb-2 relative group" {...props}>
                        <span className="absolute -left-6 top-1 text-amber-300/40 text-sm font-light">✦</span>
                        {props.children}
                      </h3>
                    ),
                    h4: ({ ...props }) => (
                      <h4 className="mt-6 mb-3 text-xl font-serif text-amber-200 relative" {...props}>
                        <span className="absolute -left-4 top-1 text-amber-400/40 text-xs">•</span>
                        {props.children}
                      </h4>
                    ),
                    p: ({ ...props }) => (
                      <p className="mb-4 leading-8 text-amber-50/90 font-light text-lg tracking-wide indent-4" 
                         style={{ fontFamily: 'Georgia, Times, serif', lineHeight: '1.8' }} 
                         {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="my-6 space-y-3 text-amber-50/85" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="my-6 space-y-3 text-amber-50/85" {...props} />
                    ),
                    li: ({ ...props }) => (
                      <li className="relative pl-2 leading-7" {...props}>
                        <span className="absolute -left-4 top-2 text-amber-400/60 text-sm">→</span>
                        {props.children}
                      </li>
                    ),
                    hr: () => (
                      <div className="my-8 flex items-center justify-center">
                        <div className="flex space-x-2">
                          <div className="w-1 h-1 bg-amber-300/40 rounded-full"></div>
                          <div className="w-2 h-2 bg-amber-300/40 rounded-full"></div>
                          <div className="w-1 h-1 bg-amber-300/40 rounded-full"></div>
                        </div>
                      </div>
                    ),
                    strong: ({ ...props }) => (
                      <strong className="text-amber-100 font-semibold relative" {...props}>
                        {props.children}
                      </strong>
                    ),
                    em: ({ ...props }) => (
                      <em className="text-amber-200/95 italic font-light" style={{ fontFamily: 'Georgia, serif' }} {...props} />
                    ),
                  }}
                >
                  {result.analysisText}
                </ReactMarkdown>
                
                {/* Journal signature/flourish */}
                <div className="mt-12 pt-6 border-t border-amber-200/10 flex justify-end">
                  <div className="text-right text-amber-300/60 font-light italic">
                    <p className="text-sm" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                      ~ DreamScape Oracle
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}



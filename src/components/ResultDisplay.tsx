import { useEffect, useState } from "react";
import { useDreamStore } from "@/store/useDreamStore";

export default function ResultDisplay() {
  const isLoading = useDreamStore((s) => s.isLoading);
  const result = useDreamStore((s) => s.result);

  // Hooks must run on every render; initialize image state unconditionally
  const [imgSrc, setImgSrc] = useState<string | null>(result.imageUrl ?? null);

  useEffect(() => {
    setImgSrc(result.imageUrl ?? null);
  }, [result.imageUrl]);

  const handleImgError = () => {
    const sig = Date.now();
    setImgSrc(`https://source.unsplash.com/1600x900/?dream,surreal,art&sig=${sig}`);
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
      {imgSrc ? (
        <div className="overflow-hidden rounded-xl bg-black/20 aspect-[16/9]">
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



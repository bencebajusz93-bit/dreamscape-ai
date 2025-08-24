"use client";

import StyleSelector from "@/components/StyleSelector";
import ResultDisplay from "@/components/ResultDisplay";
import { useDreamStore } from "@/store/useDreamStore";
import Image from "next/image";
import logo from "../../dreamscapeailogo.png";
export default function Home() {
  const dreamDescription = useDreamStore((s) => s.dreamDescription);
  const selectedStyle = useDreamStore((s) => s.selectedStyle);
  const isLoading = useDreamStore((s) => s.isLoading);
  const setDreamDescription = useDreamStore((s) => s.setDreamDescription);
  const setSelectedStyle = useDreamStore((s) => s.setSelectedStyle);
  const setIsLoading = useDreamStore((s) => s.setIsLoading);
  const setResult = useDreamStore((s) => s.setResult);

  const handleVisualize = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream: dreamDescription, style: selectedStyle }),
        cache: "no-store",
      });
      const data = await response.json();
      setResult({ imageUrl: data.imageUrl ?? null, analysisText: data.analysisText ?? null });
    } catch (error) {
      console.error("Visualization failed", error);
      setResult({ imageUrl: null, analysisText: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <div className="w-full">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Image src={logo} alt="DreamScape" priority className="h-28 sm:h-36 md:h-44 w-auto" />
            </div>
            <p className="mt-2 text-sm text-white/50">Where your dreams take shape</p>
          </div>

          <div className="mt-8">
            <textarea
              value={dreamDescription}
              onChange={(e) => setDreamDescription(e.target.value)}
              placeholder="Describe your dream in as much detail as you can..."
              className="w-full min-h-[220px] rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/90 placeholder-white/40 shadow-inner shadow-black/20 backdrop-blur-sm outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

          <div className="mt-8">
            <StyleSelector selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} />
          </div>

          <div className="mt-10">
            <button
              onClick={handleVisualize}
              disabled={isLoading}
              className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-500/20 outline-none transition will-change-transform hover:-translate-y-[1px] hover:shadow-[0_0_32px_rgba(139,92,246,0.45)] focus:ring-2 focus:ring-violet-400/50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative">{isLoading ? "Visualizing..." : "Visualize Dream ✨"}</span>
            </button>
          </div>

          <ResultDisplay />
        </div>
      </div>
    </div>
  );
}

"use client";

import StyleSelector from "@/components/StyleSelector";
import ResultDisplay from "@/components/ResultDisplay";
import AdvancedControls from "@/components/AdvancedControls";
import HistoryPanel from "@/components/HistoryPanel";
import { useDreamStore } from "@/store/useDreamStore";
import Image from "next/image";
import logo from "../../dreamscapeailogo.png";
import { useState } from "react";
export default function Home() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const dreamDescription = useDreamStore((s) => s.dreamDescription);
  const selectedStyle = useDreamStore((s) => s.selectedStyle);
  const lengthPreference = useDreamStore((s) => s.lengthPreference);
  const temperature = useDreamStore((s) => s.temperature);
  const aspectRatio = useDreamStore((s) => s.aspectRatio);
  const isLoading = useDreamStore((s) => s.isLoading);
  const setDreamDescription = useDreamStore((s) => s.setDreamDescription);
  const setSelectedStyle = useDreamStore((s) => s.setSelectedStyle);
  const setIsLoading = useDreamStore((s) => s.setIsLoading);
  const setResult = useDreamStore((s) => s.setResult);
  const addToHistory = useDreamStore((s) => s.addToHistory);
  const loadFromHistory = useDreamStore((s) => s.loadFromHistory);

  const EXAMPLES = [
    "I'm walking through a city where all the buildings are made of glass. A fox keeps appearing in reflections, guiding me to a rooftop garden.",
    "I’m floating in a library where books hum like beehives. A storm gathers outside but the pages glow with warm light.",
    "I’m on a train that dives into the ocean. Jellyfish illuminate the cabin while I search for a lost photograph.",
    "In a moonlit forest, doors hang from tree branches. Each door opens to a childhood memory—one is locked and I can’t find the key.",
  ];

  const handleSurprise = () => {
    const i = Math.floor(Math.random() * EXAMPLES.length);
    setDreamDescription(EXAMPLES[i]);
  };

  const handleVisualize = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dream: dreamDescription,
          style: selectedStyle,
          lengthPreference,
          temperature,
          aspectRatio,
        }),
        cache: "no-store",
      });
      const data = await response.json();
      const nextResult = { imageUrl: data.imageUrl ?? null, analysisText: data.analysisText ?? null };
      setResult(nextResult);
      addToHistory({
        dream: dreamDescription,
        style: selectedStyle,
        lengthPreference,
        temperature,
        aspectRatio,
        result: nextResult,
      });
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

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setDreamDescription(ex)}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/[0.12] disabled:opacity-60"
                >
                  Example {idx + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSurprise}
                className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1.5 text-xs font-medium text-white shadow-violet-500/20 transition hover:shadow-[0_0_18px_rgba(139,92,246,0.45)] disabled:opacity-60"
              >
                Surprise me ✨
              </button>
            </div>
          </div>

          <div className="mt-8">
            <StyleSelector selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} />
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.12]"
            >
              {showAdvanced ? "Hide advanced" : "Show advanced"}
            </button>
          </div>

          {showAdvanced ? <AdvancedControls /> : null}

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

          <HistoryPanel
            onLoad={(item) => loadFromHistory(item)}
            onReRender={(item) => {
              loadFromHistory(item);
              void handleVisualize();
            }}
          />
        </div>
      </div>
    </div>
  );
}

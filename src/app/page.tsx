"use client";

import { useState } from "react";
import { useDreamStore } from "@/store/useDreamStore";
import logo from "../../dreamscapeailogo3removebg.png";
import Link from "next/link";
import { 
  ProgressiveLoadingProvider, 
  ProgressiveComponent, 
  OptimizedMotion,
  usePerformanceMonitor,
  useReducedMotion
} from "@/components/ProgressiveLoader";
import { ErrorBoundary, GenerationErrorFallback, NetworkErrorFallback } from "@/components/ErrorBoundary";

// Critical components loaded immediately
import DreamyBackground from "@/components/DreamyBackground";
import AnimatedLogo from "@/components/AnimatedLogo";
import DynamicTagline from "@/components/DynamicTagline";
import EnhancedDreamInput from "@/components/EnhancedDreamInput";

// Non-critical components loaded progressively
import StyleSelector from "@/components/StyleSelector";
import ResultDisplay from "@/components/ResultDisplay";
import AdvancedControls from "@/components/AdvancedControls";
import HistoryPanel from "@/components/HistoryPanel";
import SuccessAnimation from "@/components/SuccessAnimation";
import ShareDreamModal from "@/components/ShareDreamModal";
// Performance monitoring component
function PerformanceIndicator() {
  const metrics = usePerformanceMonitor();
  const [showMetrics, setShowMetrics] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowMetrics(!showMetrics)}
        className="performance-indicator"
        style={{ 
          opacity: showMetrics ? 1 : 0.3,
          transition: 'opacity 0.2s ease'
        }}
      >
        {metrics.fps} FPS
      </button>
      {showMetrics && (
        <div className="performance-indicator" style={{ top: '30px', left: '10px', fontSize: '8px' }}>
          Memory: {metrics.memoryUsage}MB<br />
          Load: {Math.round(metrics.loadTime)}ms
        </div>
      )}
    </>
  );
}

export default function Home() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const reducedMotion = useReducedMotion();

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
  const clearCurrent = useDreamStore((s) => s.clearCurrent);
  const showShareModal = useDreamStore((s) => s.showShareModal);
  const setShowShareModal = useDreamStore((s) => s.setShowShareModal);
  const settings = useDreamStore((s) => s.settings);

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.imageUrl && !data.analysisText) {
        throw new Error("No content was generated. Try adjusting your dream description.");
      }

      const nextResult = { 
        imageUrl: data.imageUrl ?? null, 
        analysisText: data.analysisText ?? null 
      };
      
      setResult(nextResult);
      addToHistory({
        dream: dreamDescription,
        style: selectedStyle,
        lengthPreference,
        temperature,
        aspectRatio,
        result: nextResult,
      });
      
      // Trigger success animation (respecting reduced motion)
      if (!reducedMotion) {
        setShowSuccess(true);
      }

      // Show share modal if user hasn't opted for automatic sharing
      if (!settings.sharePublicly) {
        setTimeout(() => {
          setShowShareModal(true);
        }, reducedMotion ? 500 : 2000); // Delay to allow success animation
      }
    } catch (error) {
      console.error("Visualization failed", error);
      
      // Set error result with contextual message
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const errorMessage = isNetworkError 
        ? "Network connection failed. Please check your internet and try again."
        : error instanceof Error 
          ? error.message 
          : "Something went wrong. Please try again.";
      
      setResult({ 
        imageUrl: null, 
        analysisText: errorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProgressiveLoadingProvider 
      onLoadComplete={() => console.log('Progressive loading completed')}
    >
      <ErrorBoundary 
        fallback={(error, retry) => {
          const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
          return isNetworkError ? 
            <NetworkErrorFallback retry={retry} /> :
            <GenerationErrorFallback 
              retry={retry} 
              onSimplify={() => {
                setDreamDescription(dreamDescription.slice(0, 100) + "...");
                retry();
              }} 
            />;
        }}
      >
        <div className="min-h-screen text-white relative">
          <DreamyBackground />
          <PerformanceIndicator />
          
          {/* Gallery Navigation Button */}
          <div className="absolute top-6 right-6 z-20">
            <Link
              href="/gallery"
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 w-12 h-12 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:from-violet-500/30 hover:to-purple-500/30 hover:border-violet-400/50 hover:shadow-xl ${
                reducedMotion ? '' : 'hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'
              }`}
              title="Gallery"
            >
              <span className="relative z-10 text-xl">🌍</span>
              {!reducedMotion && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
            </Link>
          </div>
          
          <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16 relative z-10">
            <div className="w-full above-fold">
              {/* Critical UI - Logo and Input */}
              <OptimizedMotion 
                className="text-center"
                animationClass="animate-slideInUp"
                reducedMotionClass="opacity-100"
              >
                <div className="flex items-center justify-center">
                  <AnimatedLogo 
                    src={logo}
                    alt="DreamScape AI"
                    priority
                    className="h-28 sm:h-36 md:h-44 w-auto will-change-transform gpu-accelerated"
                  />
                </div>
                <div className="mt-4">
                  <DynamicTagline className="text-white/80" />
                </div>
              </OptimizedMotion>

              <div className="mt-8">
                <EnhancedDreamInput
                  value={dreamDescription}
                  onChange={setDreamDescription}
                />
              </div>

              {/* Example buttons - High priority */}
              <ProgressiveComponent
                id="example-buttons"
                priority="high"
                component={(props: unknown) => {
                  const { EXAMPLES, isLoading, setDreamDescription, handleSurprise, reducedMotion } = props as {
                    EXAMPLES: string[]; 
                    isLoading: boolean; 
                    setDreamDescription: (desc: string) => void; 
                    handleSurprise: () => void; 
                    reducedMotion: boolean;
                  };
                  return (
                  <OptimizedMotion 
                    className="mt-4"
                    animationClass="animate-slideInUp"
                    style={{ animationDelay: '0.2s' }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {EXAMPLES.map((ex: string, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isLoading}
                          onClick={() => setDreamDescription(ex)}
                          className={`group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 transition-all duration-300 ${
                            reducedMotion 
                              ? 'hover:bg-white/[0.12] hover:text-white' 
                              : 'optimized-hover hover:bg-white/[0.12] hover:border-violet-400/30 hover:scale-105 hover:shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                          } disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none will-change-transform`}
                        >
                          <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                            Example {idx + 1}
                          </span>
                          {!reducedMotion && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-full opacity-0 blur transition-opacity duration-300 group-hover:opacity-70" />
                            </>
                          )}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleSurprise}
                        className={`group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1.5 text-xs font-medium text-white shadow-violet-500/20 transition-all duration-300 ${
                          reducedMotion 
                            ? 'hover:from-violet-400 hover:to-fuchsia-400' 
                            : 'hover:shadow-[0_0_24px_rgba(139,92,246,0.6)] hover:scale-110 hover:from-violet-400 hover:to-fuchsia-400'
                        } disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-violet-500/20 will-change-transform`}
                      >
                        <span className="relative z-10">Surprise me ✨</span>
                        {!reducedMotion && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="absolute -inset-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full opacity-0 blur-sm transition-all duration-300 group-hover:opacity-60 group-hover:animate-pulse" />
                          </>
                        )}
                      </button>
                    </div>
                  </OptimizedMotion>
                  );
                }}
                EXAMPLES={EXAMPLES}
                isLoading={isLoading}
                setDreamDescription={setDreamDescription}
                handleSurprise={handleSurprise}
                reducedMotion={reducedMotion}
                fallback={
                  <div className="mt-4 space-y-2">
                    <div className="h-8 bg-white/5 rounded-full w-full animate-pulse" />
                    <div className="h-8 bg-white/5 rounded-full w-3/4 animate-pulse" />
                  </div>
                }
              />

              {/* Style Selector - Medium priority */}
              <ProgressiveComponent
                id="style-selector"
                priority="medium"
                component={StyleSelector as React.ComponentType<unknown>}
                selectedStyle={selectedStyle}
                setSelectedStyle={setSelectedStyle}
                className="mt-8"
                fallback={
                  <div className="mt-8 h-32 bg-white/5 rounded-xl animate-pulse" />
                }
              />

              {/* Advanced Controls Toggle */}
              <OptimizedMotion
                className="mt-6"
                animationClass="animate-slideInUp"
                style={{ animationDelay: '0.4s' }}
              >
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className={`group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 transition-all duration-300 ${
                    reducedMotion 
                      ? 'hover:bg-white/[0.12] hover:text-white'
                      : 'optimized-hover hover:bg-white/[0.12] hover:border-violet-400/30 hover:scale-105 hover:shadow-[0_0_16px_rgba(139,92,246,0.3)]'
                  } hover:text-white will-change-transform`}
                >
                  <span className="relative z-10 flex items-center gap-2 transition-all duration-300">
                    <span className={`transform transition-transform duration-300 ${
                      showAdvanced ? 'rotate-180' : 'rotate-0'
                    } ${reducedMotion ? 'transition-none' : ''}`}>
                      ⚙️
                    </span>
                    {showAdvanced ? "Hide advanced" : "Show advanced"}
                  </span>
                  {!reducedMotion && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/20 to-violet-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-full opacity-0 blur transition-opacity duration-300 group-hover:opacity-70" />
                    </>
                  )}
                </button>
              </OptimizedMotion>

              {/* Advanced Controls Panel */}
              <div className={`transition-all duration-500 ease-out overflow-hidden ${
                showAdvanced 
                  ? 'max-h-[500px] opacity-100 transform translate-y-0' 
                  : 'max-h-0 opacity-0 transform -translate-y-2'
              } ${reducedMotion ? 'transition-none' : ''}`}>
                <ProgressiveComponent
                  id="advanced-controls"
                  priority="low"
                  component={AdvancedControls as React.ComponentType<unknown>}
                  className="mt-6"
                  fallback={
                    <div className="mt-6 h-40 bg-white/5 rounded-xl animate-pulse" />
                  }
                />
              </div>

              {/* Action Buttons */}
              <OptimizedMotion
                className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2"
                animationClass="animate-slideInUp"
                style={{ animationDelay: '0.6s' }}
              >
                <button
                  onClick={handleVisualize}
                  disabled={isLoading}
                  className={`group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-500/20 outline-none transition-all duration-300 will-change-transform focus:ring-2 focus:ring-violet-400/50 ${
                    reducedMotion 
                      ? 'hover:from-violet-400 hover:to-fuchsia-400' 
                      : 'hover:-translate-y-[2px] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:scale-[1.02]'
                  } disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100`}
                >
                  <span className={`relative z-10 transition-all duration-300 ${
                    reducedMotion ? '' : 'group-hover:scale-110'
                  }`}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Visualizing...
                      </span>
                    ) : (
                      "Visualize Dream ✨"
                    )}
                  </span>
                  {!reducedMotion && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <div className="absolute -inset-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-2xl opacity-0 blur-sm transition-all duration-300 group-hover:opacity-70 group-hover:animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={clearCurrent}
                  disabled={isLoading}
                  className={`group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-lg font-semibold text-white/80 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 ${
                    reducedMotion 
                      ? 'hover:text-white' 
                      : 'hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:scale-[1.02] hover:-translate-y-[2px]'
                  } disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 will-change-transform`}
                >
                  <span className={`relative z-10 transition-all duration-300 group-hover:text-white ${
                    reducedMotion ? '' : 'group-hover:scale-110'
                  }`}>
                    Clear
                  </span>
                  {!reducedMotion && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <div className="absolute -inset-1 bg-white/20 rounded-2xl opacity-0 blur transition-all duration-300 group-hover:opacity-50" />
                    </>
                  )}
                </button>
              </OptimizedMotion>

              {/* Result Display - Below fold, loaded with lower priority */}
              <div className="below-fold">
                <ProgressiveComponent
                  id="result-display"
                  priority="high"
                  component={ResultDisplay as React.ComponentType<unknown>}
                  fallback={
                    <div className="mt-8 h-64 bg-white/5 rounded-xl animate-pulse" />
                  }
                />
              </div>

              {/* History Panel - Lowest priority */}
              <div className="below-fold">
                <ProgressiveComponent
                  id="history-panel"
                  priority="low"
                  component={HistoryPanel as React.ComponentType<unknown>}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onLoad={(item: any) => loadFromHistory(item)}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onReRender={(item: any) => {
                    loadFromHistory(item);
                    void handleVisualize();
                  }}
                  fallback={
                    <div className="mt-8 space-y-4">
                      <div className="h-8 bg-white/5 rounded-lg animate-pulse" />
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
                        <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
          
          {/* Success Animation - Only show if motion is not reduced */}
          {!reducedMotion && (
            <SuccessAnimation
              show={showSuccess}
              onComplete={() => setShowSuccess(false)}
              message="Dream Generated Successfully!"
            />
          )}

          {/* Share Dream Modal */}
          <ShareDreamModal 
            show={showShareModal}
            onClose={() => setShowShareModal(false)}
          />
        </div>
      </ErrorBoundary>
    </ProgressiveLoadingProvider>
  );
}

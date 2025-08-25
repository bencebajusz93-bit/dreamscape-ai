"use client";

import { useEffect, useState, createContext, useContext, useMemo } from "react";

type LoadingPriority = "critical" | "high" | "medium" | "low";

interface LoadingTask {
  id: string;
  priority: LoadingPriority;
  component: React.ComponentType<unknown>;
  props?: Record<string, unknown>;
  loaded: boolean;
  error?: string;
}

interface ProgressiveLoadingContextType {
  registerComponent: (id: string, priority: LoadingPriority, component: React.ComponentType<unknown>, props?: Record<string, unknown>) => void;
  isLoaded: (id: string) => boolean;
  hasError: (id: string) => string | undefined;
  loadingProgress: number;
  isInitialLoadComplete: boolean;
}

const ProgressiveLoadingContext = createContext<ProgressiveLoadingContextType | null>(null);

export function useProgressiveLoading() {
  const context = useContext(ProgressiveLoadingContext);
  if (!context) {
    throw new Error("useProgressiveLoading must be used within ProgressiveLoadingProvider");
  }
  return context;
}

interface ProgressiveLoadingProviderProps {
  children: React.ReactNode;
  onLoadComplete?: () => void;
}

export function ProgressiveLoadingProvider({ children, onLoadComplete }: ProgressiveLoadingProviderProps) {
  const [tasks, setTasks] = useState<LoadingTask[]>([]);
  const [currentPriority, setCurrentPriority] = useState<LoadingPriority>("critical");
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const priorityOrder = useMemo<LoadingPriority[]>(() => ["critical", "high", "medium", "low"], []);

  const registerComponent = (id: string, priority: LoadingPriority, component: React.ComponentType<unknown>, props?: Record<string, unknown>) => {
    setTasks(prev => {
      const existing = prev.find(task => task.id === id);
      if (existing) return prev;

      return [...prev, { id, priority, component, props, loaded: false }];
    });
  };

  const isLoaded = (id: string) => {
    return tasks.find(task => task.id === id)?.loaded ?? false;
  };

  const hasError = (id: string) => {
    return tasks.find(task => task.id === id)?.error;
  };

  const loadingProgress = tasks.length > 0 ? (tasks.filter(task => task.loaded).length / tasks.length) * 100 : 100;

  // Progressive loading effect
  useEffect(() => {
    if (tasks.length === 0) return;

    const loadNextBatch = async () => {
      const currentTasks = tasks.filter(task => task.priority === currentPriority && !task.loaded);
      
      if (currentTasks.length === 0) {
        // Move to next priority level
        const currentIndex = priorityOrder.indexOf(currentPriority);
        if (currentIndex < priorityOrder.length - 1) {
          setCurrentPriority(priorityOrder[currentIndex + 1]);
        } else {
          // All priorities processed
          setIsInitialLoadComplete(true);
          onLoadComplete?.();
        }
        return;
      }

      // Load components in current priority batch
      const loadPromises = currentTasks.map(async (task) => {
        try {
          // Simulate component loading with varying delays based on priority
          const delay = {
            critical: 50,
            high: 200,
            medium: 500,
            low: 1000
          }[task.priority];

          await new Promise(resolve => setTimeout(resolve, delay));

          setTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, loaded: true } : t
          ));
        } catch (error) {
          setTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, error: String(error) } : t
          ));
        }
      });

      await Promise.all(loadPromises);
    };

    loadNextBatch();
  }, [currentPriority, tasks, onLoadComplete, priorityOrder]);

  // Auto-advance to next priority after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentIndex = priorityOrder.indexOf(currentPriority);
      if (currentIndex < priorityOrder.length - 1) {
        const hasUnloadedInCurrentPriority = tasks.some(
          task => task.priority === currentPriority && !task.loaded
        );
        if (!hasUnloadedInCurrentPriority) {
          setCurrentPriority(priorityOrder[currentIndex + 1]);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentPriority, tasks, priorityOrder]);

  return (
    <ProgressiveLoadingContext.Provider value={{
      registerComponent,
      isLoaded,
      hasError,
      loadingProgress,
      isInitialLoadComplete
    }}>
      {children}
    </ProgressiveLoadingContext.Provider>
  );
}

interface ProgressiveComponentProps {
  id: string;
  priority: LoadingPriority;
  component: React.ComponentType<unknown>;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: string; retry: () => void }>;
  [key: string]: unknown;
}

export function ProgressiveComponent({ 
  id, 
  priority, 
  component: Component, 
  fallback, 
  errorFallback: ErrorFallback,
  ...props 
}: ProgressiveComponentProps) {
  const { registerComponent, isLoaded, hasError } = useProgressiveLoading();

  useEffect(() => {
    registerComponent(id, priority, Component, props);
  }, [id, priority, Component, registerComponent, props]);

  const error = hasError(id);
  const loaded = isLoaded(id);

  if (error && ErrorFallback) {
    return <ErrorFallback error={error} retry={() => {
      // Retry logic would go here
      registerComponent(id, priority, Component, props);
    }} />;
  }

  if (!loaded) {
    return fallback || <div className="w-full h-32 bg-white/5 animate-pulse rounded-xl" />;
  }

  return <Component {...props} />;
}

// Hook for accessing reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Optimized motion component that respects user preferences
interface OptimizedMotionProps {
  children: React.ReactNode;
  className?: string;
  animationClass?: string;
  reducedMotionClass?: string;
  style?: React.CSSProperties;
}

export function OptimizedMotion({ 
  children, 
  className = "", 
  animationClass = "", 
  reducedMotionClass = "",
  style = {} 
}: OptimizedMotionProps) {
  const prefersReducedMotion = useReducedMotion();

  const finalClassName = `${className} ${prefersReducedMotion ? reducedMotionClass : animationClass}`;
  const finalStyle = prefersReducedMotion 
    ? { ...style, animation: 'none', transition: 'none' }
    : style;

  return (
    <div className={finalClassName} style={finalStyle}>
      {children}
    </div>
  );
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    loadTime: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory ? 
            Math.round((performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1048576) : 0,
          loadTime: performance.now()
        }));

        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return metrics;
}

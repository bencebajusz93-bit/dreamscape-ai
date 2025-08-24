import { create } from "zustand";
import { persist } from "zustand/middleware";

type DreamResult = {
  imageUrl: string | null;
  analysisText: string | null;
};

type DreamState = {
  dreamDescription: string;
  selectedStyle: string;
  isLoading: boolean;
  result: DreamResult;
  lengthPreference: "short" | "medium" | "long";
  temperature: number;
  aspectRatio: "1:1" | "16:9" | "9:16";
  history: HistoryItem[];
};

type DreamActions = {
  setDreamDescription: (description: string) => void;
  setSelectedStyle: (style: string) => void;
  setIsLoading: (loading: boolean) => void;
  setResult: (result: DreamResult) => void;
  setLengthPreference: (length: "short" | "medium" | "long") => void;
  setTemperature: (temp: number) => void;
  setAspectRatio: (ratio: "1:1" | "16:9" | "9:16") => void;
  addToHistory: (entry: Omit<HistoryItem, "id" | "createdAt">) => void;
  loadFromHistory: (item: HistoryItem) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
};

export type DreamStore = DreamState & DreamActions;

export type HistoryItem = {
  id: string;
  createdAt: number;
  dream: string;
  style: string;
  lengthPreference: "short" | "medium" | "long";
  temperature: number;
  aspectRatio: "1:1" | "16:9" | "9:16";
  result: DreamResult;
};

export const useDreamStore = create<DreamStore>()(
  persist(
    (set, get) => ({
      dreamDescription: "",
      selectedStyle: "Surrealism",
      isLoading: false,
      result: { imageUrl: null, analysisText: null },
      lengthPreference: "medium",
      temperature: 0.7,
      aspectRatio: "16:9",
      history: [],

      setDreamDescription: (description) => set({ dreamDescription: description }),
      setSelectedStyle: (style) => set({ selectedStyle: style }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setResult: (result) => set({ result }),
      setLengthPreference: (length) => set({ lengthPreference: length }),
      setTemperature: (temp) => set({ temperature: Math.max(0, Math.min(1, temp)) }),
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),

      addToHistory: (entry) =>
        set((state) => {
          const sanitizedUrl = entry.result.imageUrl && entry.result.imageUrl.startsWith("data:") ? null : entry.result.imageUrl;
          const sanitizedAnalysis = entry.result.analysisText?.slice(0, 4000) ?? null;
          const sanitizedDream = entry.dream.slice(0, 2000);
          const newItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: Date.now(),
            dream: sanitizedDream,
            style: entry.style,
            lengthPreference: entry.lengthPreference,
            temperature: entry.temperature,
            aspectRatio: entry.aspectRatio,
            result: { imageUrl: sanitizedUrl, analysisText: sanitizedAnalysis },
          } as const;
          return {
            history: [newItem, ...state.history].slice(0, 20),
          };
        }),

      loadFromHistory: (item) =>
        set({
          dreamDescription: item.dream,
          selectedStyle: item.style,
          lengthPreference: item.lengthPreference,
          temperature: item.temperature,
          aspectRatio: item.aspectRatio,
          result: item.result,
        }),

      removeHistoryItem: (id) =>
        set((state) => ({ history: state.history.filter((h) => h.id !== id) })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "dreamscape-store",
      partialize: (state) => {
        const { isLoading, result, ...rest } = state;
        // Avoid persisting potentially large data URLs in current result; history is already sanitized above
        return rest;
      },
    }
  )
);



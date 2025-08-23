import { create } from "zustand";

type DreamResult = {
  imageUrl: string | null;
  analysisText: string | null;
};

type DreamState = {
  dreamDescription: string;
  selectedStyle: string;
  isLoading: boolean;
  result: DreamResult;
};

type DreamActions = {
  setDreamDescription: (description: string) => void;
  setSelectedStyle: (style: string) => void;
  setIsLoading: (loading: boolean) => void;
  setResult: (result: DreamResult) => void;
};

export type DreamStore = DreamState & DreamActions;

export const useDreamStore = create<DreamStore>((set) => ({
  dreamDescription: "",
  selectedStyle: "Surrealism",
  isLoading: false,
  result: { imageUrl: null, analysisText: null },

  setDreamDescription: (description) => set({ dreamDescription: description }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setResult: (result) => set({ result }),
}));



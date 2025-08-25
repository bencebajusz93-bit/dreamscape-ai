import { create } from "zustand";
import { persist } from "zustand/middleware";

// Helper functions for dream analysis
const detectMood = (dreamText: string): DreamMood => {
  const text = dreamText.toLowerCase();
  
  // Mood detection keywords
  const moodKeywords = {
    peaceful: ["calm", "serene", "peaceful", "gentle", "quiet", "soft", "meadow", "garden", "floating", "warm light"],
    mysterious: ["shadow", "mist", "unknown", "mysterious", "fog", "hidden", "secret", "whisper", "veil", "enigmatic"],
    intense: ["storm", "thunder", "fire", "explosion", "chase", "run", "urgent", "panic", "intense", "overwhelming"],
    joyful: ["laugh", "joy", "happy", "celebration", "party", "dance", "bright", "rainbow", "sunshine", "smile"],
    dark: ["dark", "nightmare", "fear", "terror", "demon", "monster", "death", "blood", "scary", "horror"],
    nostalgic: ["childhood", "memory", "past", "old", "remember", "nostalgic", "vintage", "family", "home", "yesterday"],
    anxious: ["worry", "anxious", "stress", "test", "exam", "late", "lost", "confused", "trapped", "overwhelmed"],
    romantic: ["love", "kiss", "romantic", "heart", "wedding", "flowers", "romance", "tender", "embrace", "beloved"]
  };
  
  let maxScore = 0;
  let detectedMood: DreamMood = "mysterious";
  
  Object.entries(moodKeywords).forEach(([mood, keywords]) => {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (text.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      detectedMood = mood as DreamMood;
    }
  });
  
  return detectedMood;
};

const detectCategory = (dreamText: string): DreamCategory => {
  const text = dreamText.toLowerCase();
  
  // Category detection keywords
  const categoryKeywords = {
    flying: ["fly", "flying", "wings", "soar", "float", "levitate", "air", "sky", "clouds"],
    nightmare: ["nightmare", "terror", "horror", "monster", "demon", "scary", "fear", "evil", "dark"],
    water: ["water", "ocean", "sea", "river", "lake", "swim", "drown", "waves", "underwater"],
    chase: ["chase", "run", "escape", "follow", "pursue", "hunt", "flee", "catch"],
    falling: ["fall", "falling", "drop", "cliff", "edge", "plummet", "tumble"],
    lucid: ["lucid", "control", "realize", "aware", "conscious", "wake up", "dream within"],
    prophetic: ["future", "predict", "vision", "prophecy", "foresee", "destiny", "fate"],
    recurring: ["again", "recurring", "repeat", "same", "familiar", "before", "always"],
    adventure: ["adventure", "journey", "explore", "quest", "treasure", "discover", "travel"],
    transformation: ["change", "transform", "become", "turn into", "morph", "shift", "evolve"],
    lost: ["lost", "can't find", "search", "missing", "wander", "confused", "maze"],
    animals: ["dog", "cat", "bird", "wolf", "bear", "lion", "tiger", "snake", "horse", "animal"],
    death: ["death", "die", "dead", "funeral", "grave", "cemetery", "ghost", "spirit"],
    family: ["mother", "father", "family", "mom", "dad", "sister", "brother", "parent"],
    work: ["work", "office", "job", "boss", "colleague", "meeting", "computer", "desk"],
    school: ["school", "teacher", "classroom", "test", "exam", "student", "homework"],
    childhood: ["child", "childhood", "young", "kid", "playground", "toy", "school"],
    travel: ["train", "car", "plane", "travel", "journey", "road", "destination"],
    nature: ["forest", "tree", "mountain", "field", "garden", "flower", "nature"],
    spiritual: ["god", "angel", "heaven", "pray", "spiritual", "divine", "sacred", "meditation"],
    abstract: ["strange", "weird", "impossible", "surreal", "abstract", "bizarre", "odd"]
  };
  
  let maxScore = 0;
  let detectedCategory: DreamCategory = "abstract";
  
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (text.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      detectedCategory = category as DreamCategory;
    }
  });
  
  return detectedCategory;
};

export type DreamMood = "peaceful" | "mysterious" | "intense" | "joyful" | "dark" | "nostalgic" | "anxious" | "romantic";
export type DreamCategory = "flying" | "nightmare" | "water" | "chase" | "falling" | "lucid" | "prophetic" | "recurring" | "adventure" | "transformation" | "lost" | "animals" | "death" | "family" | "work" | "school" | "childhood" | "travel" | "nature" | "spiritual" | "abstract";

type DreamResult = {
  imageUrl: string | null;
  analysisText: string | null;
  mood?: DreamMood;
  category?: DreamCategory;
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
  clearCurrent: () => void;
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
  mood?: DreamMood;
  category?: DreamCategory;
};

export const useDreamStore = create<DreamStore>()(
  persist(
    (set) => ({
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
      clearCurrent: () => set({ dreamDescription: "", result: { imageUrl: null, analysisText: null } }),

      addToHistory: (entry) =>
        set((state) => {
          const sanitizedUrl = entry.result.imageUrl && entry.result.imageUrl.startsWith("data:") ? null : entry.result.imageUrl;
          const sanitizedAnalysis = entry.result.analysisText?.slice(0, 4000) ?? null;
          const sanitizedDream = entry.dream.slice(0, 2000);
          
          // Detect mood and category
          const mood = detectMood(sanitizedDream);
          const category = detectCategory(sanitizedDream);
          
          const newItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: Date.now(),
            dream: sanitizedDream,
            style: entry.style,
            lengthPreference: entry.lengthPreference,
            temperature: entry.temperature,
            aspectRatio: entry.aspectRatio,
            result: { imageUrl: sanitizedUrl, analysisText: sanitizedAnalysis, mood, category },
            mood,
            category,
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
        // Avoid persisting potentially large data URLs in current result; history is already sanitized above
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isLoading, result, ...rest } = state;
        return rest;
      },
    }
  )
);



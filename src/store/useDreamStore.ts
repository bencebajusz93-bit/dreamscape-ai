import { create } from "zustand";
import { persist } from "zustand/middleware";

// Helper function to anonymize dream text
const anonymizeDreamText = (dreamText: string, shouldAnonymize: boolean = true): string => {
  if (!shouldAnonymize) return dreamText;
  
  // Remove personal names and specific details
  let anonymized = dreamText
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "someone") // Names
    .replace(/\b(my|I|me|mine)\b/gi, "someone") // Personal pronouns
    .replace(/\d{4}\b/g, "****") // Years
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, "a date") // Dates
    .replace(/\b\d{3}-\d{3}-\d{4}\b/g, "a phone number"); // Phone numbers
  
  // Truncate if too long
  if (anonymized.length > 150) {
    anonymized = anonymized.slice(0, 147) + "...";
  }
  
  return anonymized;
};

// Mock public dreams data for development
const generateMockPublicDreams = (): PublicDream[] => [
  {
    id: "public-1",
    dreamText: "I was floating in a library where books hum like beehives. The pages glowed with warm light.",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
    style: "Surrealism",
    mood: "mysterious",
    category: "abstract",
    createdAt: Date.now() - 86400000, // 1 day ago
    likes: 12,
    aspectRatio: "1:1",
    isAnonymous: true,
    region: "North America"
  },
  {
    id: "public-2", 
    dreamText: "Walking through a city where all buildings are made of glass. A fox appeared in reflections.",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop",
    style: "Digital Art",
    mood: "peaceful",
    category: "adventure",
    createdAt: Date.now() - 172800000, // 2 days ago
    likes: 8,
    aspectRatio: "16:9",
    isAnonymous: true,
    region: "Europe"
  },
  {
    id: "public-3",
    dreamText: "On a train that dives into the ocean. Jellyfish illuminate the cabin with ethereal light.",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop",
    style: "Fantasy Art",
    mood: "joyful",
    category: "water",
    createdAt: Date.now() - 259200000, // 3 days ago
    likes: 15,
    aspectRatio: "9:16",
    isAnonymous: true,
    region: "Asia"
  },
  {
    id: "public-4",
    dreamText: "In a moonlit forest, doors hang from tree branches. Each one opens to a different memory.",
    imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop",
    style: "Oil Painting",
    mood: "nostalgic",
    category: "nature",
    createdAt: Date.now() - 345600000, // 4 days ago
    likes: 20,
    aspectRatio: "1:1",
    isAnonymous: true,
    region: "Europe"
  },
  {
    id: "public-5",
    dreamText: "Flying through clouds that taste like cotton candy, with birds made of musical notes.",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    style: "Impressionism",
    mood: "joyful",
    category: "flying",
    createdAt: Date.now() - 432000000, // 5 days ago
    likes: 7,
    aspectRatio: "16:9",
    isAnonymous: true,
    region: "North America"
  },
  {
    id: "public-6",
    dreamText: "Standing in a garden where flowers sing lullabies and butterflies paint the air with colors.",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
    style: "Watercolor",
    mood: "peaceful",
    category: "nature",
    createdAt: Date.now() - 518400000, // 6 days ago
    likes: 11,
    aspectRatio: "1:1",
    isAnonymous: true,
    region: "Australia"
  }
];

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
  publicDreams: PublicDream[];
  settings: UserSettings;
  showShareModal: boolean;
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
  // Public dreams actions
  addPublicDream: (dream: Omit<PublicDream, "id" | "likes" | "isAnonymous">) => void;
  likePublicDream: (id: string) => void;
  getPublicDreams: () => PublicDream[];
  getFilteredPublicDreams: (style?: string, mood?: DreamMood, category?: DreamCategory) => PublicDream[];
  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  setShowShareModal: (show: boolean) => void;
  shareCurrentDream: () => void;
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

export type PublicDream = {
  id: string;
  dreamText: string; // anonymized/truncated
  imageUrl: string;
  style: string;
  mood: DreamMood;
  category: DreamCategory;
  createdAt: number;
  likes: number;
  aspectRatio: "1:1" | "16:9" | "9:16";
  isAnonymous: true;
  region?: string;
};

export type UserSettings = {
  sharePublicly: boolean;
  anonymizeText: boolean;
  allowLikes: boolean;
  showInGallery: boolean;
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
      publicDreams: generateMockPublicDreams(),
      settings: {
        sharePublicly: false,
        anonymizeText: true,
        allowLikes: true,
        showInGallery: true,
      },
      showShareModal: false,

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
          // Allow data URLs but compress them for storage
          let sanitizedUrl = entry.result.imageUrl;
          if (sanitizedUrl && sanitizedUrl.startsWith("data:")) {
            // Keep data URLs but limit to most recent 5 items to manage storage
            const recentItemsWithImages = state.history.filter(h => h.result.imageUrl?.startsWith("data:")).length;
            if (recentItemsWithImages >= 5) {
              sanitizedUrl = null; // Don't store data URL for older items
            }
          }
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

      // Public dreams actions
      addPublicDream: (dream) =>
        set((state) => {
          const newPublicDream: PublicDream = {
            ...dream,
            id: `public-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            likes: 0,
            isAnonymous: true,
          };
          return {
            publicDreams: [newPublicDream, ...state.publicDreams].slice(0, 100), // Keep max 100 public dreams
          };
        }),

      likePublicDream: (id) =>
        set((state) => ({
          publicDreams: state.publicDreams.map((dream) =>
            dream.id === id ? { ...dream, likes: dream.likes + 1 } : dream
          ),
        })),

      getPublicDreams: () => get().publicDreams,

      getFilteredPublicDreams: (style, mood, category) => {
        const { publicDreams } = get();
        return publicDreams.filter((dream) => {
          if (style && dream.style !== style) return false;
          if (mood && dream.mood !== mood) return false;
          if (category && dream.category !== category) return false;
          return true;
        });
      },

      // Settings actions
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setShowShareModal: (show) => set({ showShareModal: show }),

      shareCurrentDream: () => {
        const state = get();
        const { result, dreamDescription, selectedStyle, aspectRatio, settings } = state;
        
        if (!result.imageUrl || !result.mood || !result.category) return;

        const anonymizedText = anonymizeDreamText(dreamDescription, settings.anonymizeText);
        
        const publicDream = {
          dreamText: anonymizedText,
          imageUrl: result.imageUrl,
          style: selectedStyle,
          mood: result.mood,
          category: result.category,
          createdAt: Date.now(),
          aspectRatio,
          region: "Unknown", // Could be enhanced with geolocation
        };

        state.addPublicDream(publicDream);
        set({ showShareModal: false });
      },
    }),
    {
      name: "dreamscape-store",
      partialize: (state) => {
        // Avoid persisting potentially large data URLs in current result; history is already sanitized above
        // Don't persist publicDreams (mock data) or loading states
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isLoading, result, publicDreams, showShareModal, ...rest } = state;
        return rest;
      },
    }
  )
);



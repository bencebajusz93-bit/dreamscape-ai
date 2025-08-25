"use client";

import { useState, useEffect } from "react";
import { useDreamStore, type PublicDream, type DreamMood, type DreamCategory } from "@/store/useDreamStore";
import { OptimizedMotion, useReducedMotion } from "@/components/ProgressiveLoader";
import Link from "next/link";
import Image from "next/image";

// Gallery styles and moods for filtering
const GALLERY_STYLES = [
  "All Styles", "Surrealism", "Digital Art", "Fantasy Art", "Oil Painting", 
  "Impressionism", "Watercolor", "Minimalism", "Pop Art", "Abstract"
];

const GALLERY_MOODS: (string | DreamMood)[] = [
  "All Moods", "peaceful", "mysterious", "intense", "joyful", 
  "dark", "nostalgic", "anxious", "romantic"
];

const GALLERY_CATEGORIES: (string | DreamCategory)[] = [
  "All Categories", "flying", "water", "nature", "adventure", "abstract", 
  "childhood", "animals", "transformation", "spiritual"
];

interface DreamCardProps {
  dream: PublicDream;
  onLike: (id: string) => void;
  reducedMotion: boolean;
}

function DreamCard({ dream, onLike, reducedMotion }: DreamCardProps) {
  const [liked, setLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      onLike(dream.id);
    }
  };

  const aspectRatioClass = {
    "1:1": "aspect-square",
    "16:9": "aspect-video",
    "9:16": "aspect-[9/16]"
  }[dream.aspectRatio];

  return (
    <OptimizedMotion
      className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
      animationClass="animate-slideInUp fade-in-on-scroll"
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${aspectRatioClass}`}>
        <Image
          src={dream.imageUrl}
          alt={`Dream: ${dream.dreamText}`}
          fill
          className={`object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } ${reducedMotion ? '' : 'group-hover:scale-110'}`}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Loading overlay */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-violet-400 animate-spin" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={liked}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 ${
            liked 
              ? 'text-red-400 scale-110' 
              : 'text-white/70 hover:text-red-400 hover:scale-110'
          } ${reducedMotion ? 'hover:scale-100' : ''}`}
        >
          <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
        </button>

        {/* Style badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full border border-white/20">
          <span className="text-xs text-white/80 font-medium">{dream.style}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-white/80 leading-relaxed mb-3 line-clamp-3">
          {dream.dreamText}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-3">
            <span className="capitalize">
              {dream.mood} • {dream.category}
            </span>
            {dream.region && (
              <span className="opacity-60">📍 {dream.region}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span>{dream.likes}</span>
            <span className="text-red-400">❤️</span>
          </div>
        </div>

        {/* Date */}
        <div className="mt-2 text-xs text-white/50">
          {new Date(dream.createdAt).toLocaleDateString()}
        </div>
      </div>
    </OptimizedMotion>
  );
}

export default function GalleryPage() {
  const { publicDreams, likePublicDream, getFilteredPublicDreams } = useDreamStore();
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [selectedMood, setSelectedMood] = useState("All Moods");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [filteredDreams, setFilteredDreams] = useState<PublicDream[]>(publicDreams);
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const reducedMotion = useReducedMotion();

  // Filter dreams when filters change
  useEffect(() => {
    const styleFilter = selectedStyle === "All Styles" ? undefined : selectedStyle;
    const moodFilter = selectedMood === "All Moods" ? undefined : selectedMood as DreamMood;
    const categoryFilter = selectedCategory === "All Categories" ? undefined : selectedCategory as DreamCategory;
    
    let filtered = getFilteredPublicDreams(styleFilter, moodFilter, categoryFilter);
    
    // Sort dreams
    if (sortBy === "popular") {
      filtered = [...filtered].sort((a, b) => b.likes - a.likes);
    } else {
      filtered = [...filtered].sort((a, b) => b.createdAt - a.createdAt);
    }
    
    setFilteredDreams(filtered);
  }, [selectedStyle, selectedMood, selectedCategory, sortBy, publicDreams, getFilteredPublicDreams]);

  const handleLike = (dreamId: string) => {
    likePublicDream(dreamId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-white/80 transition-all duration-300 hover:bg-white/10 hover:border-violet-400/30 hover:text-white ${
                  reducedMotion ? '' : 'hover:scale-105 hover:shadow-[0_0_16px_rgba(139,92,246,0.3)]'
                }`}
                title="Back to DreamScape"
              >
                <span className="relative z-10 text-lg">←</span>
                <span className="relative z-10">Back to Dreams</span>
                {!reducedMotion && (
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/20 to-violet-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl" />
                )}
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                  Dream Gallery
                </h1>
                <p className="text-sm text-white/60">
                  Explore {publicDreams.length} community dreams
                </p>
              </div>
            </div>

            {/* Sort toggle */}
            <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
              <button
                onClick={() => setSortBy("recent")}
                className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 ${
                  sortBy === "recent" 
                    ? 'bg-violet-500 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 ${
                  sortBy === "popular" 
                    ? 'bg-violet-500 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Popular
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <OptimizedMotion
          className="mb-8 space-y-4"
          animationClass="animate-slideInUp"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {/* Style filter */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Artistic Style
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/50"
              >
                {GALLERY_STYLES.map((style) => (
                  <option key={style} value={style} className="bg-slate-800">
                    {style}
                  </option>
                ))}
              </select>
            </div>

            {/* Mood filter */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Dream Mood
              </label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/50"
              >
                {GALLERY_MOODS.map((mood) => (
                  <option key={mood} value={mood} className="bg-slate-800 capitalize">
                    {mood}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Dream Theme
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/50"
              >
                {GALLERY_CATEGORIES.map((category) => (
                  <option key={category} value={category} className="bg-slate-800 capitalize">
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters display */}
          {(selectedStyle !== "All Styles" || selectedMood !== "All Moods" || selectedCategory !== "All Categories") && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-sm text-white/60">Filtered by:</span>
              {selectedStyle !== "All Styles" && (
                <span className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded-full">
                  {selectedStyle}
                </span>
              )}
              {selectedMood !== "All Moods" && (
                <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full capitalize">
                  {selectedMood}
                </span>
              )}
              {selectedCategory !== "All Categories" && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full capitalize">
                  {selectedCategory}
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedStyle("All Styles");
                  setSelectedMood("All Moods");
                  setSelectedCategory("All Categories");
                }}
                className="px-2 py-1 text-white/60 hover:text-white text-xs underline"
              >
                Clear all
              </button>
            </div>
          )}
        </OptimizedMotion>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-white/60 text-sm">
            {filteredDreams.length} dream{filteredDreams.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Dreams grid */}
        {filteredDreams.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDreams.map((dream, index) => (
              <div
                key={dream.id}
                style={{
                  animationDelay: reducedMotion ? '0ms' : `${index * 100}ms`
                }}
              >
                <DreamCard 
                  dream={dream} 
                  onLike={handleLike}
                  reducedMotion={reducedMotion}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">🌙</div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">No dreams found</h3>
            <p className="text-white/60 mb-4">
              Try adjusting your filters to discover more dreams
            </p>
            <button
              onClick={() => {
                setSelectedStyle("All Styles");
                setSelectedMood("All Moods");
                setSelectedCategory("All Categories");
              }}
              className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

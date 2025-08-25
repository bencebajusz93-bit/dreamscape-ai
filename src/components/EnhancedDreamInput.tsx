"use client";

import { useEffect, useState, useMemo } from "react";

type EnhancedDreamInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

// Inspiring dream prompts for animated placeholder
const DREAM_PROMPTS = [
  "Describe your dream in vivid detail...",
  "What colors and emotions filled your dream?",
  "Where did your subconscious take you?",
  "What symbols or people appeared?",
  "How did the dream make you feel?",
  "What was the atmosphere like?",
  "Describe the setting and environment...",
  "What happened in your dream world?",
];

// Floating dream keywords
const DREAM_KEYWORDS = [
  "flying", "ocean", "forest", "city", "mountain", "desert", "castle", "bridge",
  "mystery", "magic", "light", "shadow", "portal", "journey", "transformation", "memory",
  "childhood", "future", "past", "emotion", "fear", "joy", "wonder", "discovery",
  "floating", "falling", "climbing", "running", "dancing", "singing", "laughing", "crying",
  "colors", "music", "silence", "echoes", "whispers", "storms", "calm", "chaos"
];

// Dream element suggestions based on input
const SUGGESTION_MAP: Record<string, string[]> = {
  "fly": ["Surrealism", "birds", "clouds", "freedom", "weightless"],
  "water": ["Ghibli-inspired", "ocean", "rain", "reflection", "flowing"],
  "dark": ["Film noir", "shadows", "mystery", "moonlight", "contrast"],
  "city": ["Cyberpunk", "neon", "buildings", "urban", "night"],
  "forest": ["Solarpunk", "trees", "nature", "green", "peaceful"],
  "dream": ["Surrealism", "ethereal", "floating", "mystical", "otherworldly"],
  "space": ["Vaporwave", "stars", "cosmic", "infinite", "void"],
  "color": ["Art Nouveau", "vibrant", "rainbow", "spectrum", "vivid"],
  "japanese": ["Ukiyo-e", "traditional", "minimalist", "serene", "elegant"]
};

const MAX_CHARS = 2000;

export default function EnhancedDreamInput({ value, onChange, className = "" }: EnhancedDreamInputProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isPromptVisible, setIsPromptVisible] = useState(true);
  const [floatingKeywords, setFloatingKeywords] = useState<Array<{
    id: number;
    text: string;
    x: number;
    y: number;
    delay: number;
    duration: number;
  }>>([]);

  // Generate suggestions based on input
  const suggestions = useMemo(() => {
    if (!value || value.length < 3) return [];
    
    const words = value.toLowerCase().split(/\s+/);
    const matchedSuggestions = new Set<string>();
    
    words.forEach(word => {
      Object.entries(SUGGESTION_MAP).forEach(([key, suggestions]) => {
        if (word.includes(key) || key.includes(word)) {
          suggestions.forEach(suggestion => matchedSuggestions.add(suggestion));
        }
      });
    });
    
    return Array.from(matchedSuggestions).slice(0, 6);
  }, [value]);

  // Character count progress
  const progress = Math.min((value.length / MAX_CHARS) * 100, 100);
  const progressColor = progress < 70 ? '#8B5CF6' : progress < 90 ? '#F59E0B' : '#EF4444';

  // Animated placeholder rotation
  useEffect(() => {
    if (value) {
      setIsPromptVisible(false);
      return;
    }

    setIsPromptVisible(true);
    const interval = setInterval(() => {
      setIsPromptVisible(false);
      setTimeout(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % DREAM_PROMPTS.length);
        setIsPromptVisible(true);
      }, 400);
    }, 5000);

    return () => clearInterval(interval);
  }, [value]);

  // Generate floating keywords
  useEffect(() => {
    const keywords = DREAM_KEYWORDS
      .sort(() => 0.5 - Math.random())
      .slice(0, 12)
      .map((text, i) => ({
        id: i,
        text,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 10,
      }));
    
    setFloatingKeywords(keywords);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Floating Keywords Background */}
      <div className="absolute inset-0 -m-8 pointer-events-none overflow-hidden opacity-30">
        {floatingKeywords.map((keyword) => (
          <div
            key={keyword.id}
            className="absolute text-xs text-white/40 font-medium select-none"
            style={{
              left: `${keyword.x}%`,
              top: `${keyword.y}%`,
              animation: `keywordFloat ${keyword.duration}s ease-in-out infinite`,
              animationDelay: `${keyword.delay}s`,
              textShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
            }}
          >
            {keyword.text}
          </div>
        ))}
      </div>

      {/* Main Input Container */}
      <div className="relative group">
        {/* Enhanced glow background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Textarea with animated placeholder */}
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={MAX_CHARS}
            className="w-full min-h-[220px] rounded-2xl border border-white/10 bg-white/[0.03] p-5 pr-20 text-white/90 placeholder-transparent shadow-inner shadow-black/20 backdrop-blur-sm outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 resize-none"
          />
          
          {/* Animated Placeholder */}
          {!value && (
            <div className="absolute top-5 left-5 pointer-events-none">
              <div
                className={`transition-all duration-400 ${
                  isPromptVisible 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform -translate-y-2'
                }`}
              >
                <span 
                  className="text-white/40 text-base"
                  style={{
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.4) 0%, rgba(139,92,246,0.6) 50%, rgba(219,39,119,0.4) 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    animation: 'placeholderShimmer 3s ease-in-out infinite',
                  }}
                >
                  {DREAM_PROMPTS[currentPromptIndex]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Character Count Progress Ring */}
        <div className="absolute top-5 right-5 w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke={progressColor}
              strokeWidth="2"
              strokeDasharray={`${progress}, 100`}
              style={{
                filter: `drop-shadow(0 0 4px ${progressColor}40)`,
                transition: 'stroke-dasharray 0.3s ease, stroke 0.3s ease',
              }}
            />
          </svg>
          {/* Character count text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className="text-xs font-medium transition-colors duration-300"
              style={{ color: progressColor }}
            >
              {Math.round((value.length / MAX_CHARS) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4 animate-fadeIn">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-white/50 font-medium">Suggestions:</span>
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => {
                  if (!value.toLowerCase().includes(suggestion.toLowerCase())) {
                    onChange(value + (value ? ', ' : '') + suggestion);
                  }
                }}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-200 hover:scale-105"
                style={{
                  animation: `suggestionSlideIn 0.3s ease-out ${index * 0.1}s both`,
                }}
              >
                <span className="mr-1">✨</span>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Character Count Display */}
      <div className="mt-2 flex justify-between items-center text-xs">
        <div className="flex space-x-4 text-white/50">
          <span>Words: {value.trim() ? value.trim().split(/\s+/).length : 0}</span>
          <span>Characters: {value.length}</span>
        </div>
        <div className={`font-medium transition-colors duration-300 ${
          progress < 70 ? 'text-white/50' : 
          progress < 90 ? 'text-amber-400' : 'text-red-400'
        }`}>
          {MAX_CHARS - value.length} remaining
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes keywordFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.2;
          }
          25% { 
            transform: translateY(-15px) rotate(2deg); 
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-5px) rotate(-1deg); 
            opacity: 0.8;
          }
          75% { 
            transform: translateY(-20px) rotate(1deg); 
            opacity: 0.4;
          }
        }
        
        @keyframes placeholderShimmer {
          0%, 100% { 
            filter: brightness(1) saturate(1);
          }
          50% { 
            filter: brightness(1.3) saturate(1.2);
          }
        }
        
        @keyframes suggestionSlideIn {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const TAGLINES = [
  "Where dreams take shape",
  "Visualize your subconscious", 
  "Journey into imagination",
  "Transform thoughts into visions",
  "Explore the realm of possibilities",
  "Where creativity meets consciousness",
  "Unlock your dream world",
  "Beyond the boundaries of reality"
];

type DynamicTaglineProps = {
  className?: string;
  intervalMs?: number;
};

export default function DynamicTagline({ className = "", intervalMs = 4000 }: DynamicTaglineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % TAGLINES.length);
        setIsVisible(true);
      }, 300); // Half of transition time
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Glowing background effect */}
      <div 
        className="absolute -inset-x-8 -inset-y-2 opacity-20 blur-xl"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 20%, rgba(219,39,119,0.2) 50%, rgba(59,130,246,0.3) 80%, transparent 100%)',
          animation: 'taglineGlow 3s ease-in-out infinite',
          transform: `translateY(${scrollY * 0.2}px)`, // Parallax effect
        }}
      />
      
      {/* Main tagline text */}
      <p 
        className={`relative z-10 text-sm transition-all duration-600 ease-in-out ${
          isVisible 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-2'
        } ${className}`}
        style={{
          background: 'linear-gradient(45deg, rgba(255,255,255,0.9) 0%, rgba(139,92,246,0.8) 30%, rgba(219,39,119,0.6) 70%, rgba(255,255,255,0.9) 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          textShadow: '0 0 20px rgba(139,92,246,0.5)',
          transform: `translateY(${scrollY * 0.25}px)`, // Enhanced parallax
          animation: 'taglineShimmer 4s ease-in-out infinite',
        }}
      >
        {TAGLINES[currentIndex]}
      </p>

      {/* Floating accent particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${20 + i * 25}%`,
              top: '50%',
              animation: `taglineParticle ${2 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
              transform: `translateY(${scrollY * (0.15 + i * 0.05)}px)`,
            }}
          />
        ))}
      </div>

      {/* Progress indicator dots */}
      <div className="flex justify-center mt-3 space-x-1.5">
        {TAGLINES.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-violet-400 shadow-lg shadow-violet-400/50 scale-110' 
                : 'bg-white/20'
            }`}
            style={{
              animation: index === currentIndex ? 'dotPulse 2s ease-in-out infinite' : 'none',
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes taglineGlow {
          0%, 100% { 
            opacity: 0.15; 
            transform: scaleX(0.8) translateY(var(--parallax-offset, 0px));
          }
          50% { 
            opacity: 0.3; 
            transform: scaleX(1.1) translateY(var(--parallax-offset, 0px));
          }
        }
        
        @keyframes taglineShimmer {
          0%, 100% { 
            filter: brightness(1) saturate(1);
          }
          50% { 
            filter: brightness(1.2) saturate(1.1);
          }
        }
        
        @keyframes taglineParticle {
          0%, 100% { 
            opacity: 0.2; 
            transform: translateY(-5px) scale(0.8);
          }
          50% { 
            opacity: 0.8; 
            transform: translateY(5px) scale(1.2);
          }
        }
        
        @keyframes dotPulse {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(139,92,246,0.3);
          }
          50% { 
            box-shadow: 0 0 15px rgba(139,92,246,0.8);
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type LoadingSkeletonProps = {
  variant?: "image" | "text" | "card" | "button" | "input";
  className?: string;
  lines?: number;
  width?: string;
  height?: string;
};

// Floating particles for skeleton animation
const generateSkeletonParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
  }));
};

export default function LoadingSkeleton({ 
  variant = "text", 
  className = "", 
  lines = 3,
  width = "100%",
  height = "auto" 
}: LoadingSkeletonProps) {
  const [particles, setParticles] = useState(generateSkeletonParticles(8));
  const [shimmerPhase, setShimmerPhase] = useState(0);

  // Regenerate particles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(generateSkeletonParticles(8));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Shimmer phase animation
  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerPhase((prev) => (prev + 1) % 3);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const baseClasses = "relative overflow-hidden animate-pulse";
  const shimmerClasses = `
    before:absolute before:inset-0 
    before:bg-gradient-to-r before:from-transparent 
    before:via-white/10 before:to-transparent 
    before:translate-x-[-100%] 
    before:animate-shimmer
  `;

  if (variant === "image") {
    return (
      <div className={`${baseClasses} ${className}`} style={{ width, height: height === "auto" ? "300px" : height }}>
        <div className={`w-full h-full bg-white/5 rounded-2xl ${shimmerClasses}`}>
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full bg-gradient-to-r from-violet-400/30 to-pink-400/30"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animation: `skeletonFloat ${particle.duration}s ease-in-out infinite`,
                  animationDelay: `${particle.delay}s`,
                  filter: `blur(1px)`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
          
          {/* Image placeholder icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-4xl text-white/20 transition-all duration-500 ${
              shimmerPhase === 1 ? 'scale-110 text-violet-400/40' : 'scale-100'
            }`}>
              🖼️
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={`${baseClasses} space-y-3 ${className}`} style={{ width }}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`h-4 bg-white/5 rounded-full ${shimmerClasses}`}
            style={{
              width: i === lines - 1 ? "75%" : "100%",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`${baseClasses} rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm ${className}`} style={{ width, height }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 bg-white/5 rounded-full ${shimmerClasses}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-4 bg-white/5 rounded-full w-1/3 ${shimmerClasses}`} />
            <div className={`h-3 bg-white/5 rounded-full w-1/2 ${shimmerClasses}`} />
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-3 mb-4">
          <div className={`h-3 bg-white/5 rounded-full w-full ${shimmerClasses}`} />
          <div className={`h-3 bg-white/5 rounded-full w-4/5 ${shimmerClasses}`} />
          <div className={`h-3 bg-white/5 rounded-full w-3/5 ${shimmerClasses}`} />
        </div>
        
        {/* Image placeholder */}
        <div className={`h-32 bg-white/5 rounded-xl ${shimmerClasses} mb-4`} />
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <div className={`h-8 bg-white/5 rounded-full w-20 ${shimmerClasses}`} />
          <div className={`h-8 bg-white/5 rounded-full w-24 ${shimmerClasses}`} />
        </div>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <div className={`${baseClasses} ${className}`} style={{ width, height: height === "auto" ? "48px" : height }}>
        <div className={`w-full h-full bg-white/5 rounded-2xl ${shimmerClasses} flex items-center justify-center`}>
          <div className={`text-white/20 transition-all duration-500 ${
            shimmerPhase === 1 ? 'scale-110' : 'scale-100'
          }`}>
            ⚡
          </div>
        </div>
      </div>
    );
  }

  if (variant === "input") {
    return (
      <div className={`${baseClasses} ${className}`} style={{ width, height: height === "auto" ? "220px" : height }}>
        <div className={`w-full h-full bg-white/5 rounded-2xl border border-white/10 ${shimmerClasses} p-5`}>
          <div className="space-y-3">
            <div className={`h-4 bg-white/5 rounded-full w-1/3 ${shimmerClasses}`} />
            <div className={`h-4 bg-white/5 rounded-full w-full ${shimmerClasses}`} />
            <div className={`h-4 bg-white/5 rounded-full w-4/5 ${shimmerClasses}`} />
            <div className={`h-4 bg-white/5 rounded-full w-2/3 ${shimmerClasses}`} />
          </div>
        </div>
      </div>
    );
  }

  // Default text variant
  return (
    <div className={`${baseClasses} space-y-2 ${className}`}>
      <div className={`h-4 bg-white/5 rounded-full w-full ${shimmerClasses}`} />
    </div>
  );
}

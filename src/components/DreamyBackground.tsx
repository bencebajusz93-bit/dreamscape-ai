"use client";

import { useEffect, useState } from "react";

// Generate floating particles data
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    speed: Math.random() * 0.5 + 0.2,
    opacity: Math.random() * 0.6 + 0.2,
    delay: Math.random() * 10,
  }));
};

// Generate twinkling stars
const generateStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    twinkleSpeed: Math.random() * 3 + 2,
    delay: Math.random() * 5,
    brightness: Math.random() * 0.8 + 0.2,
  }));
};

// Generate constellation connection points
const generateConstellations = () => {
  const constellations = [];
  for (let i = 0; i < 3; i++) {
    const centerX = Math.random() * 80 + 10;
    const centerY = Math.random() * 80 + 10;
    const stars = Array.from({ length: 4 + Math.floor(Math.random() * 3) }, (_, j) => ({
      id: `${i}-${j}`,
      x: centerX + (Math.random() - 0.5) * 20,
      y: centerY + (Math.random() - 0.5) * 20,
      size: Math.random() * 1.5 + 1,
    }));
    constellations.push({ id: i, stars });
  }
  return constellations;
};

export default function DreamyBackground() {
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);
  const [stars, setStars] = useState<ReturnType<typeof generateStars>>([]);
  const [constellations, setConstellations] = useState<ReturnType<typeof generateConstellations>>([]);

  // Generate all elements on client-side only to avoid hydration mismatch
  useEffect(() => {
    setParticles(generateParticles(40)); // Reduced slightly to accommodate stars
    setStars(generateStars(100));
    setConstellations(generateConstellations());
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Deep space base layer */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800/30 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-900/50 to-slate-900" />
      </div>

      {/* Layered animated gradients with more depth */}
      <div className="absolute inset-0">
        {/* Deep background layer */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: 'radial-gradient(1200px circle at var(--x, 10%) var(--y, 80%), rgba(139, 92, 246, 0.2), transparent 60%)',
            animation: 'deepFloat 35s ease-in-out infinite',
            filter: 'blur(1px)',
          }}
        />
        
        {/* Mid-layer gradients */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: 'radial-gradient(800px circle at var(--x, 20%) var(--y, 30%), rgba(139, 92, 246, 0.3), transparent 50%)',
            animation: 'dreamFloat1 20s ease-in-out infinite',
          }}
        />
        
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(900px circle at var(--x, 80%) var(--y, 70%), rgba(219, 39, 119, 0.25), transparent 50%)',
            animation: 'dreamFloat2 25s ease-in-out infinite',
          }}
        />
        
        <div
          className="absolute inset-0 opacity-18"
          style={{
            background: 'radial-gradient(700px circle at var(--x, 50%) var(--y, 50%), rgba(59, 130, 246, 0.2), transparent 50%)',
            animation: 'dreamFloat3 30s ease-in-out infinite',
          }}
        />

        {/* Enhanced Aurora Effects */}
        <div
          className="absolute inset-0 opacity-12"
          style={{
            background: 'linear-gradient(45deg, transparent 20%, rgba(168, 85, 247, 0.3) 40%, rgba(219, 39, 119, 0.2) 60%, transparent 80%)',
            animation: 'auroraSweep1 45s linear infinite',
          }}
        />
        
        <div
          className="absolute inset-0 opacity-8"
          style={{
            background: 'linear-gradient(-30deg, transparent 30%, rgba(59, 130, 246, 0.25) 50%, transparent 70%)',
            animation: 'auroraSweep2 60s linear infinite reverse',
          }}
        />

        {/* Slow-moving aurora waves */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(139, 92, 246, 0.15) 60deg, rgba(219, 39, 119, 0.1) 120deg, transparent 180deg, rgba(59, 130, 246, 0.12) 240deg, transparent 360deg)',
            animation: 'auroraRotate 80s linear infinite',
          }}
        />
      </div>

      {/* Twinkling Stars Layer */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: `radial-gradient(circle, rgba(255, 255, 255, ${star.brightness}) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)`,
              animation: `starTwinkle ${star.twinkleSpeed}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.brightness * 0.5})`,
            }}
          />
        ))}
      </div>

      {/* Constellation Patterns */}
      <div className="absolute inset-0 opacity-60">
        <svg className="w-full h-full" style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))' }}>
          {constellations.map((constellation) => (
            <g key={constellation.id}>
              {/* Draw lines between constellation stars */}
              {constellation.stars.map((star, index) => {
                if (index === constellation.stars.length - 1) return null;
                const nextStar = constellation.stars[index + 1];
                return (
                  <line
                    key={`${constellation.id}-line-${index}`}
                    x1={`${star.x}%`}
                    y1={`${star.y}%`}
                    x2={`${nextStar.x}%`}
                    y2={`${nextStar.y}%`}
                    stroke="rgba(139, 92, 246, 0.3)"
                    strokeWidth="0.5"
                    style={{
                      animation: `constellationGlow 4s ease-in-out infinite`,
                      animationDelay: `${constellation.id * 2}s`,
                    }}
                  />
                );
              })}
              {/* Draw constellation stars */}
              {constellation.stars.map((star) => (
                <circle
                  key={star.id}
                  cx={`${star.x}%`}
                  cy={`${star.y}%`}
                  r={star.size}
                  fill="rgba(255, 255, 255, 0.8)"
                  style={{
                    filter: `drop-shadow(0 0 ${star.size}px rgba(139, 92, 246, 0.6))`,
                    animation: `constellationPulse 3s ease-in-out infinite`,
                    animationDelay: `${constellation.id}s`,
                  }}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/30 backdrop-blur-sm"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `particleFloat ${10 + particle.speed * 10}s linear infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle vignette overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(15, 23, 42, 0.5) 100%)'
        }}
      />

      {/* CSS animations */}
      <style jsx>{`
        @keyframes deepFloat {
          0%, 100% { --x: 10%; --y: 80%; }
          50% { --x: 90%; --y: 20%; }
        }
        
        @keyframes dreamFloat1 {
          0%, 100% { --x: 20%; --y: 30%; }
          25% { --x: 80%; --y: 20%; }
          50% { --x: 60%; --y: 80%; }
          75% { --x: 30%; --y: 60%; }
        }
        
        @keyframes dreamFloat2 {
          0%, 100% { --x: 80%; --y: 70%; }
          33% { --x: 20%; --y: 40%; }
          66% { --x: 70%; --y: 20%; }
        }
        
        @keyframes dreamFloat3 {
          0%, 100% { --x: 50%; --y: 50%; }
          20% { --x: 30%; --y: 80%; }
          40% { --x: 80%; --y: 30%; }
          60% { --x: 20%; --y: 60%; }
          80% { --x: 70%; --y: 70%; }
        }
        
        @keyframes auroraSweep1 {
          0% { transform: translateX(-120%) rotate(45deg); }
          100% { transform: translateX(220vw) rotate(45deg); }
        }
        
        @keyframes auroraSweep2 {
          0% { transform: translateX(220vw) rotate(-30deg); }
          100% { transform: translateX(-120%) rotate(-30deg); }
        }
        
        @keyframes auroraRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes constellationGlow {
          0%, 100% { stroke: rgba(139, 92, 246, 0.2); stroke-width: 0.5px; }
          50% { stroke: rgba(139, 92, 246, 0.6); stroke-width: 1px; }
        }
        
        @keyframes constellationPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes particleFloat {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10%, 90% { opacity: 1; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";

type AnimatedLogoProps = {
  src: string | StaticImageData;
  alt: string;
  priority?: boolean;
  className?: string;
};

// Generate logo particles
const generateLogoParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360,
    distance: 60 + Math.random() * 40,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 0.3 + 0.1,
    opacity: Math.random() * 0.6 + 0.2,
    delay: Math.random() * 5,
  }));
};

export default function AnimatedLogo({ src, alt, priority, className }: AnimatedLogoProps) {
  const [logoParticles, setLogoParticles] = useState<ReturnType<typeof generateLogoParticles>>([]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setLogoParticles(generateLogoParticles(8));

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative group">
      {/* Floating particles around logo */}
      <div className="absolute inset-0 pointer-events-none">
        {logoParticles.map((particle) => {
          const x = Math.cos((particle.angle * Math.PI) / 180) * particle.distance;
          const y = Math.sin((particle.angle * Math.PI) / 180) * particle.distance;
          
          return (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                opacity: particle.opacity,
                boxShadow: `0 0 ${particle.size * 2}px rgba(139, 92, 246, ${particle.opacity})`,
                animation: `logoParticleFloat ${8 + particle.speed * 10}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
                transform: `translateY(${scrollY * 0.1}px)`, // Subtle parallax
              }}
            />
          );
        })}
      </div>

      {/* Enhanced glow effects with pulsing animation */}
      <div 
        className="absolute -inset-20 opacity-20 blur-3xl animate-pulse"
        style={{
          background: 'radial-gradient(ellipse 140% 100% at center, rgba(139,92,246,0.8) 0%, rgba(219,39,119,0.5) 30%, rgba(168,85,247,0.4) 60%, transparent 85%)',
          animation: 'logoGlowPulse 4s ease-in-out infinite',
          transform: `translateY(${scrollY * 0.05}px)`, // Parallax effect
        }}
      />
      
      {/* Mid-range animated glow */}
      <div 
        className="absolute -inset-12 opacity-30 blur-2xl"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at center, rgba(139,92,246,0.7) 0%, rgba(219,39,119,0.6) 50%, transparent 80%)',
          animation: 'logoGlowPulse 3s ease-in-out infinite 0.5s',
          transform: `translateY(${scrollY * 0.08}px)`,
        }}
      />
      
      {/* Close glow with breathing effect */}
      <div 
        className="absolute -inset-6 opacity-50 blur-lg"
        style={{
          background: 'radial-gradient(ellipse 100% 70% at center, rgba(139,92,246,0.9) 0%, rgba(219,39,119,0.7) 40%, transparent 70%)',
          animation: 'logoBreathe 2s ease-in-out infinite',
          transform: `translateY(${scrollY * 0.12}px)`,
        }}
      />
      
      {/* Logo with enhanced effects and parallax */}
      <div 
        className="relative z-10 transition-transform duration-300 hover:scale-105"
        style={{
          transform: `translateY(${scrollY * 0.15}px)`, // Main parallax effect
        }}
      >
        <Image 
          src={src} 
          alt={alt} 
          priority={priority}
          className={`${className} transition-all duration-300 group-hover:brightness-110`}
          style={{
            filter: `
              drop-shadow(0 0 12px rgba(139,92,246,0.9))
              drop-shadow(0 0 24px rgba(219,39,119,0.7))
              drop-shadow(0 0 48px rgba(139,92,246,0.4))
            `,
            animation: 'logoFloat 6s ease-in-out infinite',
          }}
        />
        
        {/* Sparkle effects on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div 
            className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full"
            style={{
              animation: 'sparkle 1.5s ease-in-out infinite',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
            }}
          />
          <div 
            className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-white rounded-full"
            style={{
              animation: 'sparkle 2s ease-in-out infinite 0.5s',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
            }}
          />
          <div 
            className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-white rounded-full"
            style={{
              animation: 'sparkle 1.8s ease-in-out infinite 1s',
              boxShadow: '0 0 12px rgba(255, 255, 255, 0.7)',
            }}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes logoGlowPulse {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(1) translateY(var(--parallax-offset, 0px));
          }
          50% { 
            opacity: 0.4; 
            transform: scale(1.05) translateY(var(--parallax-offset, 0px));
          }
        }
        
        @keyframes logoBreathe {
          0%, 100% { 
            opacity: 0.5; 
            transform: scale(1) translateY(var(--parallax-offset, 0px));
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.02) translateY(var(--parallax-offset, 0px));
          }
        }
        
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-2px) rotate(0.5deg); }
          66% { transform: translateY(1px) rotate(-0.5deg); }
        }
        
        @keyframes logoParticleFloat {
          0%, 100% { 
            transform: translateY(0px) scale(0.8); 
            opacity: 0.2;
          }
          50% { 
            transform: translateY(-10px) scale(1.2); 
            opacity: 0.8;
          }
        }
        
        @keyframes sparkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0) rotate(0deg);
          }
          50% { 
            opacity: 1; 
            transform: scale(1) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}

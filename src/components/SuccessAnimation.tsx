"use client";

import { useEffect, useState } from "react";

type SuccessAnimationProps = {
  show: boolean;
  onComplete?: () => void;
  message?: string;
  className?: string;
};

// Generate celebration particles
const generateCelebrationParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 100,
    y: 50 + (Math.random() - 0.5) * 60,
    rotation: Math.random() * 360,
    scale: Math.random() * 0.8 + 0.6,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
    emoji: ['✨', '🌟', '⭐', '💫', '🎉', '🎊', '🌈', '💎'][Math.floor(Math.random() * 8)],
    color: ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)],
  }));
};

// Firework bursts
const generateFireworks = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    y: 20 + Math.random() * 40,
    size: Math.random() * 20 + 15,
    delay: i * 0.3,
    duration: 0.8,
  }));
};

export default function SuccessAnimation({ 
  show, 
  onComplete, 
  message = "Dream Generated Successfully!", 
  className = "" 
}: SuccessAnimationProps) {
  const [particles, setParticles] = useState(generateCelebrationParticles(25));
  const [fireworks, setFireworks] = useState(generateFireworks(3));
  const [showMessage, setShowMessage] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    if (show) {
      // Reset states
      setShowCheckmark(false);
      setShowMessage(false);
      
      // Regenerate particles
      setParticles(generateCelebrationParticles(25));
      setFireworks(generateFireworks(3));
      
      // Animate sequence
      const checkmarkTimer = setTimeout(() => setShowCheckmark(true), 200);
      const messageTimer = setTimeout(() => setShowMessage(true), 600);
      const completeTimer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => {
        clearTimeout(checkmarkTimer);
        clearTimeout(messageTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${className}`}>
      <div className="relative">
        {/* Fireworks */}
        {fireworks.map((firework) => (
          <div
            key={`firework-${firework.id}`}
            className="absolute pointer-events-none"
            style={{
              left: `${firework.x}vw`,
              top: `${firework.y}vh`,
              animation: `fireworkBurst ${firework.duration}s ease-out ${firework.delay}s both`,
            }}
          >
            <div
              className="relative"
              style={{
                width: `${firework.size}px`,
                height: `${firework.size}px`,
              }}
            >
              {/* Radial burst lines */}
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-1 bg-gradient-to-t from-violet-400 to-pink-400 rounded-full opacity-80"
                  style={{
                    height: `${firework.size / 2}px`,
                    left: '50%',
                    top: '50%',
                    transformOrigin: 'bottom center',
                    transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                    animation: `fireworkLine ${firework.duration}s ease-out ${firework.delay}s both`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Main success card */}
        <div className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl transition-all duration-700 ${
          showCheckmark ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}>
          
          {/* Celebration particles */}
          {particles.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              className="absolute pointer-events-none text-2xl"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                transform: `translate(-50%, -50%) rotate(${particle.rotation}deg) scale(${particle.scale})`,
                animation: `celebrationParticle ${particle.duration}s ease-out ${particle.delay}s both`,
                color: particle.color,
                textShadow: `0 0 10px ${particle.color}40`,
              }}
            >
              {particle.emoji}
            </div>
          ))}

          {/* Success checkmark */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ${
              showCheckmark ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`} style={{
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)',
            }}>
              <svg 
                className={`w-10 h-10 text-white transition-all duration-500 delay-200 ${
                  showCheckmark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7"
                  style={{
                    strokeDasharray: 20,
                    strokeDashoffset: showCheckmark ? 0 : 20,
                    transition: 'stroke-dashoffset 1s ease-out 0.3s',
                  }}
                />
              </svg>
            </div>
          </div>

          {/* Success message */}
          <div className={`text-center transition-all duration-500 delay-300 ${
            showMessage ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}>
            <h2 className="text-2xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899, #06B6D4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}>
              {message}
            </h2>
            <p className="text-white/70 text-sm">
              Your vision has been brought to life ✨
            </p>
          </div>

          {/* Pulsing glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-xl animate-pulse" />
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes celebrationParticle {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(0deg) scale(0) translateY(20px);
          }
          10% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(20deg) scale(1.2) translateY(0px);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(180deg) scale(1) translateY(-30px);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(360deg) scale(0.5) translateY(-60px);
          }
        }
        
        @keyframes fireworkBurst {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          10% {
            opacity: 1;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
        
        @keyframes fireworkLine {
          0% {
            height: 0px;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          50% {
            height: ${fireworks[0]?.size || 20}px;
          }
          100% {
            height: 0px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

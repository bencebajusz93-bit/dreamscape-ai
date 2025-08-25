"use client";

import { useEffect, useState, useRef } from "react";

type EnhancedLoadingScreenProps = {
  className?: string;
};

// Dream-related quotes and facts
const DREAM_CONTENT = [
  {
    type: "quote",
    text: "Dreams are the touchstones of our characters.",
    author: "Henry David Thoreau"
  },
  {
    type: "quote",
    text: "All that we see or seem is but a dream within a dream.",
    author: "Edgar Allan Poe"
  },
  {
    type: "quote", 
    text: "Dreams are illustrations from the book your soul is writing about you.",
    author: "Marsha Norman"
  },
  {
    type: "fact",
    text: "We spend about 6 years of our lives dreaming.",
    author: "Sleep Research"
  },
  {
    type: "fact",
    text: "Dreams help process emotions and consolidate memories.",
    author: "Neuroscience"
  },
  {
    type: "fact",
    text: "Lucid dreaming occurs in about 55% of people at least once.",
    author: "Dream Studies"
  },
  {
    type: "quote",
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    type: "fact",
    text: "Dreams occur in all sleep stages, but are most vivid during REM.",
    author: "Sleep Medicine"
  },
  {
    type: "quote",
    text: "Dreams are the seeds of change. Nothing ever grows without a seed.",
    author: "Debby Boone"
  },
  {
    type: "fact",
    text: "Colors in dreams can be influenced by our daily experiences.",
    author: "Psychology Today"
  }
];

// Progress stages
const PROGRESS_STAGES = [
  { text: "Entering the dream realm...", duration: 2000 },
  { text: "Interpreting symbols...", duration: 3000 },
  { text: "Weaving imagery...", duration: 3500 },
  { text: "Channeling creative energies...", duration: 3000 },
  { text: "Manifesting vision...", duration: 2500 },
  { text: "Awakening your dream...", duration: 2000 }
];

// Generate loading particles that form shapes
const generateLoadingParticles = (count: number, shapeType: 'spiral' | 'circle' | 'wave') => {
  return Array.from({ length: count }, (_, i) => {
    let x, y;
    const progress = i / count;
    
    switch (shapeType) {
      case 'spiral':
        const angle = progress * Math.PI * 4;
        const radius = 30 + progress * 40;
        x = 50 + Math.cos(angle) * radius;
        y = 50 + Math.sin(angle) * radius;
        break;
      case 'circle':
        const circleAngle = progress * Math.PI * 2;
        x = 50 + Math.cos(circleAngle) * 35;
        y = 50 + Math.sin(circleAngle) * 35;
        break;
      case 'wave':
        x = progress * 100;
        y = 50 + Math.sin(progress * Math.PI * 3) * 20;
        break;
    }
    
    return {
      id: i,
      x: x!,
      y: y!,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      delay: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.3
    };
  });
};

export default function EnhancedLoadingScreen({ className = "" }: EnhancedLoadingScreenProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentContent, setCurrentContent] = useState(0);
  const [particles, setParticles] = useState(generateLoadingParticles(20, 'spiral'));
  const [shapeType, setShapeType] = useState<'spiral' | 'circle' | 'wave'>('spiral');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Progress through stages
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const progressStage = (index: number) => {
      if (index < PROGRESS_STAGES.length - 1) {
        timeoutId = setTimeout(() => {
          setCurrentStage(index + 1);
          progressStage(index + 1);
        }, PROGRESS_STAGES[index].duration);
      }
    };
    
    progressStage(0);
    return () => clearTimeout(timeoutId);
  }, []);

  // Cycle through dream content
  useEffect(() => {
    const interval = setInterval(() => {
      setIsContentVisible(false);
      setTimeout(() => {
        setCurrentContent((prev) => (prev + 1) % DREAM_CONTENT.length);
        setIsContentVisible(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Change particle shapes
  useEffect(() => {
    const shapeInterval = setInterval(() => {
      const shapes: ('spiral' | 'circle' | 'wave')[] = ['spiral', 'circle', 'wave'];
      const newShape = shapes[Math.floor(Math.random() * shapes.length)];
      setShapeType(newShape);
      setParticles(generateLoadingParticles(20, newShape));
    }, 6000);

    return () => clearInterval(shapeInterval);
  }, []);

  // Handle ambient sounds
  useEffect(() => {
    if (soundEnabled && !audioRef.current) {
      // Create a simple ambient tone using Web Audio API
      let AudioContextClass;
      try {
        AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      } catch {
        return;
      }
      if (!AudioContextClass) return;
      const audioContext = new AudioContextClass();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.frequency.value = 220; // A3
      oscillator2.frequency.value = 330; // E4
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';
      
      gainNode.gain.value = 0.1;
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator1.start();
      oscillator2.start();
      
      // Store cleanup function
      (audioRef.current as unknown as () => void) = () => {
        oscillator1.stop();
        oscillator2.stop();
        audioContext.close();
      };
    } else if (!soundEnabled && audioRef.current) {
      (audioRef.current as unknown as () => void)();
      audioRef.current = null;
    }

    return () => {
      if (audioRef.current) {
        (audioRef.current as unknown as () => void)();
      }
    };
  }, [soundEnabled]);

  const stageProgress = ((currentStage + 1) / PROGRESS_STAGES.length) * 100;
  const content = DREAM_CONTENT[currentContent];

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-white/80 backdrop-blur-sm ${className}`}>
      {/* Sound Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-full border border-white/10 text-xs transition-all duration-200 ${
            soundEnabled 
              ? 'bg-violet-500/20 text-violet-300 border-violet-400/30' 
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
          title={soundEnabled ? 'Disable ambient sounds' : 'Enable ambient sounds'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-8">
        {/* Animated Particle Formation */}
        <div className="relative w-64 h-64">
          <div className="absolute inset-0">
            {particles.map((particle) => (
              <div
                key={`${shapeType}-${particle.id}`}
                className="absolute rounded-full bg-gradient-to-r from-violet-400 to-pink-400"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.opacity,
                  animation: `loadingParticle ${2 + particle.speed}s ease-in-out infinite`,
                  animationDelay: `${particle.delay}s`,
                  boxShadow: `0 0 ${particle.size * 3}px rgba(139, 92, 246, 0.6)`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>

          {/* Central Loading Spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-white/20 rounded-full animate-spin">
                <div 
                  className="w-full h-full border-2 border-transparent border-t-violet-400 rounded-full"
                  style={{ animation: 'spin 1.5s linear infinite' }}
                />
              </div>
              <div className="absolute inset-2 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full opacity-20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Progress Stage */}
        <div className="text-center space-y-4">
          <div 
            className="text-lg font-medium transition-all duration-500"
            style={{
              background: 'linear-gradient(45deg, #8B5CF6, #DB2777, #3B82F6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {PROGRESS_STAGES[currentStage].text}
          </div>

          {/* Progress Bar */}
          <div className="w-80 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
          
          <div className="text-sm text-white/50">
            {Math.round(stageProgress)}% complete
          </div>
        </div>

        {/* Dream Journal Content */}
        <div className="max-w-md text-center">
          <div 
            className={`transition-all duration-500 ${
              isContentVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-4'
            }`}
          >
            <div className="mb-2">
              <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                content.type === 'quote' 
                  ? 'bg-violet-500/20 text-violet-300' 
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                {content.type === 'quote' ? '💭 Dream Quote' : '🧠 Dream Fact'}
              </span>
            </div>
            
            <blockquote 
              className="text-sm italic leading-relaxed"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(139,92,246,0.7) 50%, rgba(219,39,119,0.6) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
&ldquo;{content.text}&rdquo;
            </blockquote>
            
            <cite className="block mt-2 text-xs text-white/60 not-italic">
              — {content.author}
            </cite>
          </div>
        </div>

        {/* Mystical Loading Message */}
        <div className="text-center">
          <p className="text-sm text-white/50 animate-pulse">
            Visualizing the void...
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes loadingParticle {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(0.8) rotate(0deg); 
            opacity: 0.3;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2) rotate(180deg); 
            opacity: 1;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

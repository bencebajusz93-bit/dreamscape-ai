"use client";

import { useState } from "react";
import { useDreamStore, type UserSettings } from "@/store/useDreamStore";
import { OptimizedMotion, useReducedMotion } from "@/components/ProgressiveLoader";

interface ShareDreamModalProps {
  show: boolean;
  onClose: () => void;
}

export default function ShareDreamModal({ show, onClose }: ShareDreamModalProps) {
  const { settings, updateSettings, shareCurrentDream, dreamDescription } = useDreamStore();
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const reducedMotion = useReducedMotion();

  if (!show) return null;

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Update settings first
      updateSettings(localSettings);
      
      // Share the current dream
      shareCurrentDream();
      
      setShared(true);
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
        setShared(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to share dream:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  // Preview anonymized text
  const getPreviewText = () => {
    if (!localSettings.anonymizeText) return dreamDescription;
    
    return dreamDescription
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "someone")
      .replace(/\b(my|I|me|mine)\b/gi, "someone")
      .slice(0, 100) + (dreamDescription.length > 100 ? "..." : "");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <OptimizedMotion
        className={`bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl w-full max-w-md mx-4 transition-all duration-500 ${
          shared ? 'scale-105' : 'scale-100'
        }`}
        animationClass={reducedMotion ? "" : "animate-slideInUp"}
      >
        {shared ? (
          // Success state
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">✨</span>
            </div>
            <h3 className="text-xl font-bold text-green-400 mb-2">Dream Shared!</h3>
            <p className="text-white/70">
              Your dream has been added to the community gallery anonymously.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">🌍</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Share Your Dream</h2>
                    <p className="text-sm text-white/60">Inspire others anonymously</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
                >
                  <span className="text-white/70">✕</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Privacy Settings */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/80">Privacy Settings</h3>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.anonymizeText}
                    onChange={(e) => handleSettingChange("anonymizeText", e.target.checked)}
                    className="mt-1 w-4 h-4 text-violet-600 bg-white/10 border-white/30 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div>
                    <span className="text-white text-sm font-medium">Anonymize text</span>
                    <p className="text-white/60 text-xs">Remove personal details and names</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.allowLikes}
                    onChange={(e) => handleSettingChange("allowLikes", e.target.checked)}
                    className="mt-1 w-4 h-4 text-violet-600 bg-white/10 border-white/30 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div>
                    <span className="text-white text-sm font-medium">Allow likes</span>
                    <p className="text-white/60 text-xs">Let others appreciate your dream</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showInGallery}
                    onChange={(e) => handleSettingChange("showInGallery", e.target.checked)}
                    className="mt-1 w-4 h-4 text-violet-600 bg-white/10 border-white/30 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div>
                    <span className="text-white text-sm font-medium">Show in gallery</span>
                    <p className="text-white/60 text-xs">Make visible to the community</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.sharePublicly}
                    onChange={(e) => handleSettingChange("sharePublicly", e.target.checked)}
                    className="mt-1 w-4 h-4 text-violet-600 bg-white/10 border-white/30 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div>
                    <span className="text-white text-sm font-medium">Remember my choice</span>
                    <p className="text-white/60 text-xs">Automatically share future dreams</p>
                  </div>
                </label>
              </div>

              {/* Preview */}
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <h4 className="text-sm font-medium text-white/80 mb-2">Preview</h4>
                <p className="text-sm text-white/70 leading-relaxed">
                  {getPreviewText()}
                </p>
                {localSettings.anonymizeText && (
                  <p className="text-xs text-violet-300 mt-2">
                    ℹ️ Text has been anonymized for privacy
                  </p>
                )}
              </div>

              {/* Disclaimer */}
              <div className="text-xs text-white/50 leading-relaxed">
                By sharing, you agree that your dream will be displayed anonymously in the community gallery. 
                No personal information will be stored or shared.
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white/80 font-medium transition-all duration-200 hover:bg-white/5 hover:text-white"
              >
                Maybe Later
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing || !localSettings.showInGallery}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  localSettings.showInGallery
                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:from-violet-400 hover:to-pink-400 hover:shadow-lg'
                    : 'bg-white/10 text-white/50 cursor-not-allowed'
                } ${reducedMotion ? '' : 'hover:scale-105'}`}
              >
                {isSharing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sharing...
                  </span>
                ) : (
                  "Share Dream ✨"
                )}
              </button>
            </div>
          </>
        )}
      </OptimizedMotion>
    </div>
  );
}

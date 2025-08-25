"use client";

import { useDreamStore, type HistoryItem } from "@/store/useDreamStore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

type HistoryPanelProps = {
  onReRender: (item: HistoryItem) => void;
  onLoad: (item: HistoryItem) => void;
};

// Mood color mapping
const getMoodColors = (mood?: string) => {
  const colors = {
    peaceful: "from-green-500/20 to-blue-500/20 border-green-400/30",
    mysterious: "from-purple-500/20 to-indigo-500/20 border-purple-400/30",
    intense: "from-red-500/20 to-orange-500/20 border-red-400/30",
    joyful: "from-yellow-500/20 to-pink-500/20 border-yellow-400/30",
    dark: "from-gray-800/40 to-black/40 border-gray-600/30",
    nostalgic: "from-amber-500/20 to-yellow-600/20 border-amber-400/30",
    anxious: "from-red-600/20 to-purple-600/20 border-red-500/30",
    romantic: "from-pink-500/20 to-rose-500/20 border-pink-400/30"
  };
  return colors[mood as keyof typeof colors] || "from-slate-500/20 to-slate-600/20 border-slate-400/30";
};

// Category emoji mapping
const getCategoryEmoji = (category?: string) => {
  const emojis = {
    flying: "✈️",
    nightmare: "😱",
    water: "🌊",
    chase: "🏃",
    falling: "🍂",
    lucid: "💭",
    prophetic: "🔮",
    recurring: "🔄",
    adventure: "⚔️",
    transformation: "🦋",
    lost: "🧭",
    animals: "🐺",
    death: "💀",
    family: "👨‍👩‍👧‍👦",
    work: "💼",
    school: "🎓",
    childhood: "🧸",
    travel: "🗺️",
    nature: "🌳",
    spiritual: "🕉️",
    abstract: "🎭"
  };
  return emojis[category as keyof typeof emojis] || "💭";
};

export default function HistoryPanel({ onReRender, onLoad }: HistoryPanelProps) {
  const history = useDreamStore((s) => s.history);
  const removeHistoryItem = useDreamStore((s) => s.removeHistoryItem);
  const clearHistory = useDreamStore((s) => s.clearHistory);
  const exportRef = useRef<HTMLDivElement>(null);

  if (!history.length) return null;

  // Group history by date for timeline
  const groupedHistory = history.reduce((groups, item) => {
    const date = new Date(item.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, HistoryItem[]>);

  // Simple text-based PDF export (avoids color parsing issues)
  const exportSimplePDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;
      
      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DreamScape AI - Dream Journal', margin, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition);
      pdf.text(`Total dreams: ${history.length}`, margin, yPosition + 10);
      
      yPosition += 30;
      
      // Process dreams by date
      Object.entries(groupedHistory)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .forEach(([date, items]) => {
          // Check if we need a new page
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 30;
          }
          
          // Date header
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text(new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }), margin, yPosition);
          
          yPosition += 15;
          
          // Dreams for this date
          items.forEach((item) => {
            // Check page space
            if (yPosition > 240) {
              pdf.addPage();
              yPosition = 30;
            }
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            
            // Dream header with emoji and category
            const emoji = getCategoryEmoji(item.category);
            const header = `${emoji} ${item.category || 'Dream'} (${item.mood || 'mysterious'})`;
            pdf.text(header, margin, yPosition);
            
            yPosition += 8;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text(`Time: ${new Date(item.createdAt).toLocaleTimeString()} | Style: ${item.style} | Ratio: ${item.aspectRatio}`, margin, yPosition);
            
            yPosition += 10;
            
            // Dream description (wrap text)
            pdf.setFontSize(11);
            const dreamText = item.dream;
            const lines = pdf.splitTextToSize(dreamText, pageWidth - 2 * margin);
            
            lines.forEach((line: string) => {
              if (yPosition > 270) {
                pdf.addPage();
                yPosition = 30;
              }
              pdf.text(line, margin, yPosition);
              yPosition += 6;
            });
            
            yPosition += 10; // Space between dreams
          });
          
          yPosition += 5; // Space between dates
        });
      
      pdf.save(`dreamscape-journal-text-${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('Simple PDF export successful!');
      
    } catch (error) {
      console.error('Simple PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!exportRef.current) return;

    try {
      // Create a temporary container with fallback styles for compatibility
      const clonedElement = exportRef.current.cloneNode(true) as HTMLElement;
      
      // Apply compatibility styles to avoid oklab issues
      const addCompatibilityStyles = (element: HTMLElement) => {
        const allElements = element.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          
          // Force specific background colors to avoid oklab issues
          if (htmlEl.classList.contains('bg-gradient-to-br')) {
            htmlEl.style.backgroundColor = '#1a1a2e';
          }
          if (htmlEl.classList.contains('border-violet-400/20')) {
            htmlEl.style.borderColor = 'rgba(139, 92, 246, 0.2)';
          }
          if (htmlEl.classList.contains('text-violet-200')) {
            htmlEl.style.color = 'rgba(196, 181, 253, 1)';
          }
        });
      };
      
      addCompatibilityStyles(clonedElement);
      
      // Create temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-10000px';
      tempContainer.style.left = '-10000px';
      tempContainer.style.width = exportRef.current.offsetWidth + 'px';
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);
      
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#1a1a1a",
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: false,
        // Additional options to avoid color parsing issues
        ignoreElements: (element) => {
          // Skip elements that might have problematic styles
          return element.tagName === 'CANVAS' || 
                 element.classList.contains('absolute') && 
                 element.classList.contains('inset-0');
        }
      });
      
      // Clean up temporary container
      document.body.removeChild(tempContainer);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`dreamscape-journal-${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Show success message
      console.log('PDF exported successfully!');
      
    } catch (error) {
      console.error('Failed to export PDF:', error);
      
      // Fallback: Try with basic options if the enhanced version fails
      try {
        console.log('Attempting basic export...');
        const canvas = await html2canvas(exportRef.current, {
          scale: 1,
          backgroundColor: "#1a1a1a",
          logging: false,
          removeContainer: true
        });
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`dreamscape-journal-basic-${new Date().toISOString().split('T')[0]}.pdf`);
        
        console.log('Basic PDF export successful!');
      } catch (fallbackError) {
        console.error('Both export methods failed:', fallbackError);
        alert('PDF export failed. Please try again or contact support.');
      }
    }
  };

  return (
    <div className="mt-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-serif text-white/90 mb-2">Dream Timeline</h3>
          <p className="text-sm text-white/60">{history.length} dreams captured</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportToPDF}
            className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:shadow-emerald-500/25"
          >
            📋 Export Visual PDF
          </button>
          <button
            type="button"
            onClick={exportSimplePDF}
            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:shadow-blue-500/25"
          >
            📄 Export Text PDF
          </button>
          <button
            type="button"
            onClick={clearHistory}
            className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.12]"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Timeline Display */}
      <div ref={exportRef} className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-400/40 via-purple-400/40 to-fuchsia-400/40"></div>
        
        <div className="space-y-8">
          {Object.entries(groupedHistory)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, items]) => (
            <div key={date} className="relative">
              {/* Date separator */}
              <div className="relative z-10 mb-6">
                <div className="absolute left-6 w-4 h-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full border-2 border-gray-900"></div>
                <div className="ml-16 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-400/20 rounded-lg px-4 py-2 inline-block">
                  <h4 className="text-sm font-medium text-violet-200">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                </div>
              </div>

              {/* Dreams for this date */}
              <div className="ml-16 space-y-4">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`relative rounded-2xl bg-gradient-to-br ${getMoodColors(item.mood)} border backdrop-blur-sm p-6 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]`}
                  >
                    {/* Timeline dot for individual dreams */}
                    <div className="absolute -left-10 top-8 w-3 h-3 bg-white/60 rounded-full border border-white/40"></div>
                    
                    <div className="flex gap-4">
                      {/* Dream image */}
                      <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-black/30 shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.result.imageUrl ?? `https://source.unsplash.com/320x180/?dream&sig=${item.id}`}
                          alt="Dream visualization"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Dream metadata */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getCategoryEmoji(item.category)}</span>
                              <span className="text-sm font-medium text-white/90 capitalize">{item.category}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize bg-gradient-to-r ${getMoodColors(item.mood)} border`}>
                              {item.mood}
                            </div>
                          </div>
                          <span className="text-xs text-white/40 shrink-0">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Dream description */}
                        <p className="text-white/85 leading-relaxed mb-4 line-clamp-2">{item.dream}</p>

                        {/* Style and settings info */}
                        <div className="flex items-center text-xs text-white/60 mb-4 space-x-4">
                          <span>🎨 {item.style}</span>
                          <span>📐 {item.aspectRatio}</span>
                          <span>📝 {item.lengthPreference}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onLoad(item)}
                            className="rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1.5 text-xs text-white/90 transition hover:bg-white/20 hover:border-white/40"
                          >
                            🔍 Load
                          </button>
                          <button
                            type="button"
                            onClick={() => onReRender(item)}
                            className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1.5 text-xs font-medium text-white transition hover:shadow-lg hover:shadow-violet-500/30"
                          >
                            ✨ Re-render
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHistoryItem(item.id)}
                            className="rounded-full border border-red-400/20 bg-red-500/10 backdrop-blur-sm px-3 py-1.5 text-xs text-red-200 transition hover:bg-red-500/20 hover:border-red-400/40"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline end marker */}
        <div className="relative mt-8">
          <div className="absolute left-6 w-4 h-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full border-2 border-gray-900"></div>
          <div className="ml-16 text-sm text-white/40 italic">
            ✨ Beginning of your dream journey
          </div>
        </div>
      </div>
    </div>
  );
}



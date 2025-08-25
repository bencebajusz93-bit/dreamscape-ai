type StyleSelectorProps = {
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
};

const STYLES = [
  "Surrealism",
  "Ghibli-inspired",
  "Cyberpunk",
  "Art Nouveau",
  "Ukiyo-e",
  "Film noir",
  "Vaporwave",
  "Solarpunk",
] as const;

export default function StyleSelector({ selectedStyle, setSelectedStyle }: StyleSelectorProps) {
  return (
    <div>
      <h2 className="text-sm font-medium uppercase tracking-wider text-white/70">Choose a Style</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {STYLES.map((styleName) => {
          const isSelected = selectedStyle === styleName;
          return (
            <button
              key={styleName}
              type="button"
              onClick={() => setSelectedStyle(styleName)}
              className={
                `rounded-full px-4 py-2.5 sm:px-5 sm:py-2.5 transition focus:outline-none ` +
                (isSelected
                  ? "border border-violet-400/70 bg-white/[0.14] text-white shadow-[0_0_0_1px_rgba(167,139,250,0.35)]"
                  : "border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.12]")
              }
              aria-pressed={isSelected}
            >
              {styleName}
            </button>
          );
        })}
      </div>
    </div>
  );
}



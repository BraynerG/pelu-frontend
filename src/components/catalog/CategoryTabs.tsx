import { Sparkles, Scissors, Heart, Palette, Eye } from 'lucide-react';

export type CategoryTabId =
  | 'all'
  | 'hair-cut'
  | 'hair-style'
  | 'hair-color'
  | 'hair-treatment'
  | 'hair-straightening'
  | 'makeup'
  | 'spa';

interface CategoryTabsProps {
  activeTab: CategoryTabId;
  setActiveTab: (tab: CategoryTabId) => void;
}

export function CategoryTabs({ activeTab, setActiveTab }: CategoryTabsProps) {
  const desktopTabs = [
    { id: 'all', label: 'TODOS' },
    { id: 'hair-cut', label: 'CORTES' },
    { id: 'hair-style', label: 'PEINADOS & NOVIAS' },
    { id: 'hair-color', label: 'COLOR & MECHAS' },
    { id: 'hair-treatment', label: 'TRATAMIENTOS & BOTOX' },
    { id: 'hair-straightening', label: 'ALISADOS' },
    { id: 'makeup', label: 'MAQUILLAJE & MIRADA' },
    { id: 'spa', label: 'FACIAL & SPA' },
  ] as const;

  const mobileTabs = [
    { id: 'all', label: 'TODOS', icon: Sparkles },
    { id: 'hair-cut', label: 'CORTES', icon: Scissors },
    { id: 'hair-style', label: 'PEINADOS', icon: Heart },
    { id: 'hair-color', label: 'COLOR', icon: Palette },
    { id: 'hair-treatment', label: 'TRATAMIENTOS', icon: Sparkles },
    { id: 'hair-straightening', label: 'ALISADOS', icon: Scissors },
    { id: 'makeup', label: 'MAQUILLAJE', icon: Eye },
    { id: 'spa', label: 'SPA & FACIAL', icon: Heart },
  ] as const;

  return (
    <>
      {/* Category Filter Tabs - Desktop */}
      <div className="hidden md:flex justify-center border-b border-[#ECE7DC] mb-12 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex gap-8">
          {desktopTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-xs tracking-[0.25em] font-medium transition-all duration-300 relative rounded-none ${
                activeTab === tab.id
                  ? 'text-[#1E1D1A]'
                  : 'text-[#534C43] hover:text-[#1E1D1A]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A6241] animate-fade-in" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Tabs - Mobile */}
      <div className="relative md:hidden mb-8 w-full">
        {/* Fade overlays to indicate scrolling */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#FAF9F5] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#FAF9F5] to-transparent pointer-events-none z-10" />

        <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none snap-x snap-mandatory">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-[10px] tracking-wider font-semibold border transition-all duration-300 rounded-none shrink-0 snap-align-start min-h-[44px] ${
                  isActive
                    ? 'border-[#7A6241] bg-[#7A6241] text-white shadow-sm'
                    : 'border-[#ECE7DC] bg-white text-[#534C43]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-[#7A6241]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

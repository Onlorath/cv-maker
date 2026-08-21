import React from "react";
import { Sparkles, Settings, FileCheck2, Globe } from "lucide-react";
import { useCVStore } from "../store/useCVStore";

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { cv, updateHeader } = useCVStore();

  return (
    <header className="h-14 border-b border-white/10 glass-panel px-6 flex items-center justify-between shrink-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20 text-white font-black text-sm font-['Outfit']">
          CV
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white font-['Outfit']">
              CV Maker
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full">
              ATS Pro
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Onlorath Architecture</p>
        </div>
      </div>

      {/* CV Title input */}
      <div className="hidden md:flex items-center gap-2 max-w-sm w-full mx-4">
        <input
          type="text"
          value={cv?.title || ""}
          onChange={(e) => updateHeader({ title: e.target.value })}
          placeholder="CV Başlığı..."
          className="w-full px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/10 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* ATS Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>ATS Uyumlu</span>
        </div>

        {/* Language selector */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-white/10 text-xs">
          <button
            onClick={() => updateHeader({ language: "tr" })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              cv?.language === "tr"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>TR</span>
          </button>
          <button
            onClick={() => updateHeader({ language: "en" })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              cv?.language === "en"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>EN</span>
          </button>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 transition-all cursor-pointer"
          title="Gemini API ve Ayarlar"
        >
          <Settings className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Ayarlar</span>
        </button>
      </div>
    </header>
  );
};

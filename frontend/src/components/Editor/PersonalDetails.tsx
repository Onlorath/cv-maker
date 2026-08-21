import React from "react";
import { User, Mail, Phone, MapPin, Link2, Code, Globe, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";

export const PersonalDetails: React.FC = () => {
  const { cv, updateHeader, translateField, translationState } = useCVStore();

  if (!cv) return null;

  const isTranslatingSummary = translationState["summary"] === "translating";

  const handleTranslateSummary = () => {
    if (!cv.summary) return;
    translateField("summary", "summary", cv.summary, (translated) => {
      updateHeader({ summary: translated });
    });
  };

  return (
    <div className="p-5 rounded-2xl glass-card space-y-4 border border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <User className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider font-['Outfit'] text-slate-200">
            Kişisel Bilgiler & İletişim
          </h2>
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Ad Soyad</label>
          <input
            type="text"
            value={cv.fullName || ""}
            onChange={(e) => updateHeader({ fullName: e.target.value })}
            placeholder="Örn: Yusuf Kaan"
            className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Mesleki Ünvan</label>
          <input
            type="text"
            value={cv.jobTitle || ""}
            onChange={(e) => updateHeader({ jobTitle: e.target.value })}
            placeholder="Örn: Senior Backend Engineer"
            className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">E-posta</label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="email"
              value={cv.email || ""}
              onChange={(e) => updateHeader({ email: e.target.value })}
              placeholder="ornek@email.com"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Telefon</label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={cv.phone || ""}
              onChange={(e) => updateHeader({ phone: e.target.value })}
              placeholder="+90 555..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Konum</label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={cv.location || ""}
              onChange={(e) => updateHeader({ location: e.target.value })}
              placeholder="İstanbul, Türkiye"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">LinkedIn</label>
          <div className="relative">
            <Link2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={cv.linkedin || ""}
              onChange={(e) => updateHeader({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">GitHub</label>
          <div className="relative">
            <Code className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={cv.github || ""}
              onChange={(e) => updateHeader({ github: e.target.value })}
              placeholder="github.com/..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Web Sitesi / Portfolyo</label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={cv.website || ""}
              onChange={(e) => updateHeader({ website: e.target.value })}
              placeholder="https://..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Summary with AI translate */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-semibold text-slate-300">
            Özet / Hakkımda (Professional Summary)
          </label>
          <button
            type="button"
            onClick={handleTranslateSummary}
            disabled={isTranslatingSummary || !cv.summary}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 disabled:opacity-40 transition-all cursor-pointer"
            title="Özeti Gemini ile Resume dilinde İngilizceye çevir"
          >
            {isTranslatingSummary ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            <span>AI Çeviri (EN)</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={cv.summary || ""}
          onChange={(e) => updateHeader({ summary: e.target.value })}
          placeholder="Kariyer hedeflerinizi, uzmanlık alanlarınızı ve başarılarınızı özetleyin..."
          className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-y leading-relaxed"
        />
      </div>

      {/* Photo Path */}
      <div>
        <label className="block text-[11px] font-medium text-slate-400 mb-1">
          Fotoğraf (Opsiyonel URL / Base64 / Yerel Dosya)
        </label>
        <div className="relative">
          <ImageIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={cv.photoPath || ""}
            onChange={(e) => updateHeader({ photoPath: e.target.value })}
            placeholder="https://... veya data:image/png;base64,..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

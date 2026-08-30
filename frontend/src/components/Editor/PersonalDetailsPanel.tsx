import React, { useRef } from "react";
import { User, Plus, Trash2 } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";
import { resizeImage } from "../../lib/cvUtils";

export const PersonalDetailsPanel: React.FC = () => {
  const { cv, updateHeader } = useCVStore();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!cv) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resizedBase64 = await resizeImage(file, 400, 400);
      updateHeader({ photoPath: resizedBase64 });
    } catch (err) {
      console.error("Failed to resize image", err);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateHeader({ photoPath: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-[19px] font-bold text-[var(--ink)] m-0 tracking-[-0.2px]">
          {t("editor.personal.title")}
        </h1>
        <p className="text-[12.5px] text-[var(--ink-secondary)] mt-1 mb-4">
          {t("editor.personal.subtitle")}
        </p>
      </div>

      {/* Photo Upload Row */}
      <div className="flex items-center gap-4 py-1">
        <div
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          role="button"
          aria-label={t("editor.personal.photoUploadLabel")}
          className="w-[72px] h-[72px] rounded-full bg-[var(--panel-chip)] bg-center bg-cover border border-[var(--border-strong)] relative cursor-pointer flex items-center justify-center text-[var(--ink-faint)] shrink-0 hover:border-[var(--accent)] transition-colors"
          style={cv.photoPath ? { backgroundImage: `url(${cv.photoPath})` } : {}}
        >
          {!cv.photoPath && <User className="w-6 h-6" />}
          <span className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full bg-[var(--accent)] border-2 border-[var(--panel-solid)] flex items-center justify-center text-white shadow-sm">
            <Plus className="w-3 h-3 stroke-[3]" />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed max-w-xs m-0">
            {t("editor.personal.photoDesc")}
          </p>
          {cv.photoPath && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="inline-flex items-center gap-1 mt-1 text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t("editor.personal.removePhoto")}</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>

      {/* Inputs Form */}
      <div className="space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between min-h-[24px] mb-1.5">
              <label className="field-label m-0 truncate">{t("editor.personal.fullName")}</label>
            </div>
            <input
              type="text"
              value={cv.fullName || ""}
              onChange={(e) => updateHeader({ fullName: e.target.value })}
              placeholder={t("editor.personal.fullNamePlaceholder")}
              className="native-input font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between min-h-[24px] mb-1.5">
              <label className="field-label m-0 truncate">{t("editor.personal.jobTitle")}</label>
            </div>
            <input
              type="text"
              value={cv.jobTitle || ""}
              onChange={(e) => updateHeader({ jobTitle: e.target.value })}
              placeholder={t("editor.personal.jobTitlePlaceholder")}
              className="native-input font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between min-h-[24px] mb-1.5">
              <label className="field-label m-0 truncate">{t("editor.personal.email")}</label>
            </div>
            <input
              type="email"
              value={cv.email || ""}
              onChange={(e) => updateHeader({ email: e.target.value })}
              placeholder={t("editor.personal.emailPlaceholder")}
              className="native-input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between min-h-[24px] mb-1.5">
              <label className="field-label m-0 truncate">{t("editor.personal.phone")}</label>
            </div>
            <input
              type="tel"
              value={cv.phone || ""}
              onChange={(e) => updateHeader({ phone: e.target.value })}
              placeholder={t("editor.personal.phonePlaceholder")}
              className="native-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between min-h-[24px] mb-1.5">
              <label className="field-label m-0 truncate">{t("editor.personal.location")}</label>
            </div>
            <input
              type="text"
              value={cv.location || ""}
              onChange={(e) => updateHeader({ location: e.target.value })}
              placeholder={t("editor.personal.locationPlaceholder")}
              className="native-input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between min-h-[24px] mb-1.5">
              <label className="field-label m-0 truncate">{t("editor.personal.linkedin")}</label>
            </div>
            <input
              type="text"
              value={cv.linkedin || ""}
              onChange={(e) => updateHeader({ linkedin: e.target.value })}
              placeholder={t("editor.personal.linkedinPlaceholder")}
              className="native-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between min-h-[24px] mb-1.5">
              <label className="field-label m-0 truncate">{t("editor.personal.github")}</label>
            </div>
            <input
              type="text"
              value={cv.github || ""}
              onChange={(e) => updateHeader({ github: e.target.value })}
              placeholder={t("editor.personal.githubPlaceholder")}
              className="native-input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between min-h-[24px] mb-1.5">
              <label className="field-label m-0 truncate">{t("editor.personal.website")}</label>
            </div>
            <input
              type="text"
              value={cv.website || ""}
              onChange={(e) => updateHeader({ website: e.target.value })}
              placeholder={t("editor.personal.websitePlaceholder")}
              className="native-input"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

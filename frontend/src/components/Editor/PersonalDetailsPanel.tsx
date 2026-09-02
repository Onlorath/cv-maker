import React, { useRef, useState } from "react";
import { User, Plus, Trash2, Crop } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";
import { PhotoCropModal } from "./PhotoCropModal";

export const PersonalDetailsPanel: React.FC = () => {
  const { cv, updateHeader } = useCVStore();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [rawPhotoSrc, setRawPhotoSrc] = useState<string>("");

  if (!cv) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setRawPhotoSrc(result);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenCrop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rawPhotoSrc && cv.photoPath) {
      setRawPhotoSrc(cv.photoPath);
    }
    setIsCropModalOpen(true);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRawPhotoSrc("");
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
            <div className="flex items-center gap-3 mt-1.5">
              <button
                type="button"
                onClick={handleOpenCrop}
                className="inline-flex items-center gap-1 text-[11.5px] text-[var(--accent)] hover:underline font-semibold cursor-pointer"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>{t("editor.personal.cropPhoto")}</span>
              </button>

              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1 text-[11.5px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t("editor.personal.removePhoto")}</span>
              </button>
            </div>
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

      {/* Photo Crop Modal */}
      <PhotoCropModal
        isOpen={isCropModalOpen}
        imageSrc={rawPhotoSrc || cv.photoPath || ""}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={(croppedBase64) => updateHeader({ photoPath: croppedBase64 })}
      />

      {/* Photo Size Controller (only when photo exists) */}
      {cv.photoPath && (
        <div className="p-3 bg-[var(--panel-solid)] rounded-xl border border-[var(--border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[var(--ink)]">
              {t("editor.personal.photoSizeLabel")}
            </span>
            <span className="text-[11px] font-mono text-[var(--accent)] font-bold bg-[var(--accent-soft)] px-2 py-0.5 rounded-md">
              {cv.photoSize || 84}px
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={56}
              max={120}
              step={2}
              value={cv.photoSize || 84}
              onChange={(e) => updateHeader({ photoSize: Number(e.target.value) })}
              className="w-full h-1.5 bg-[var(--border-strong)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: t("editor.personal.photoSizeSmall"), size: 64 },
              { label: t("editor.personal.photoSizeNormal"), size: 84 },
              { label: t("editor.personal.photoSizeLarge"), size: 100 },
              { label: t("editor.personal.photoSizeXLarge"), size: 116 },
            ].map((preset) => (
              <button
                key={preset.size}
                type="button"
                onClick={() => updateHeader({ photoSize: preset.size })}
                className={`py-1 px-1.5 text-[10.5px] font-medium rounded-lg border transition-all text-center cursor-pointer ${
                  (cv.photoSize || 84) === preset.size
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs"
                    : "bg-[var(--panel-chip)] text-[var(--ink-secondary)] border-[var(--border)] hover:border-[var(--accent)]/40 hover:text-[var(--ink)]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Template Style Selector */}
      <div className="space-y-2 pt-1 pb-2 border-y border-[var(--border)]">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-bold text-[var(--ink)]">
            {t("editor.personal.templateTitle")}
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Option 1: Classic ATS */}
          <div
            onClick={() => updateHeader({ templateId: "ats-classic" })}
            role="button"
            tabIndex={0}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              (cv.templateId || "ats-classic") === "ats-classic"
                ? "bg-[var(--accent-soft)] border-[var(--accent)] shadow-xs ring-1 ring-[var(--accent)]"
                : "bg-[var(--panel-solid)] border-[var(--border-strong)] hover:border-[var(--accent)]/50"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-bold text-[var(--ink)]">
                {t("editor.personal.templates.classicName")}
              </span>
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  (cv.templateId || "ats-classic") === "ats-classic"
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border-strong)]"
                }`}
              >
                {(cv.templateId || "ats-classic") === "ats-classic" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <p className="text-[11px] text-[var(--ink-secondary)] leading-normal m-0">
              {t("editor.personal.templates.classicDesc")}
            </p>
          </div>

          {/* Option 2: Centered ATS */}
          <div
            onClick={() => updateHeader({ templateId: "ats-photo" })}
            role="button"
            tabIndex={0}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              cv.templateId === "ats-photo"
                ? "bg-[var(--accent-soft)] border-[var(--accent)] shadow-xs ring-1 ring-[var(--accent)]"
                : "bg-[var(--panel-solid)] border-[var(--border-strong)] hover:border-[var(--accent)]/50"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-bold text-[var(--ink)]">
                {t("editor.personal.templates.photoName")}
              </span>
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  cv.templateId === "ats-photo"
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border-strong)]"
                }`}
              >
                {cv.templateId === "ats-photo" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <p className="text-[11px] text-[var(--ink-secondary)] leading-normal m-0">
              {t("editor.personal.templates.photoDesc")}
            </p>
          </div>
        </div>
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

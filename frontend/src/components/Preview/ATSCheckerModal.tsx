import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2,
  RefreshCw,
  FileCheck2,
  ShieldCheck,
  Lightbulb,
  Check,
} from "lucide-react";
import type { atsscore } from "../../../wailsjs/go/models";
import { useCVStore } from "../../store/useCVStore";
import { WailsBridge } from "../../lib/wailsBridge";
import { useTranslation } from "../../i18n";
import { toast } from "sonner";

interface ATSCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "input" | "loading" | "result";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: "pending" | "running" | "completed";
}

export const ATSCheckerModal: React.FC<ATSCheckerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const cv = useCVStore((state) => state.cv);
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("input");
  const [jobDescription, setJobDescription] = useState("");
  const [report, setReport] = useState<atsscore.FinalReport | null>(null);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep("input");
      setReport(null);
      setChecklist([
        {
          id: "format",
          label: t("ats.stepFormatLabel"),
          description: t("ats.stepFormatDesc"),
          status: "pending",
        },
        {
          id: "matching",
          label: t("ats.stepMatchingLabel"),
          description: t("ats.stepMatchingDesc"),
          status: "pending",
        },
        {
          id: "scoring",
          label: t("ats.stepScoringLabel"),
          description: t("ats.stepScoringDesc"),
          status: "pending",
        },
      ]);
    }
  }, [isOpen, cv?.language, t]);

  if (!isOpen) return null;

  const runAnalysis = async (onlyFormat: boolean = false) => {
    if (!cv) {
      toast.error(t("common.error"));
      return;
    }

    setStep("loading");
    setChecklist([
      {
        id: "format",
        label: t("ats.stepFormatLabel"),
        description: t("ats.stepFormatDesc"),
        status: "running",
      },
      {
        id: "matching",
        label: onlyFormat
          ? t("ats.stepMatchingSkippedLabel")
          : t("ats.stepMatchingLabel"),
        description: onlyFormat
          ? t("ats.stepMatchingSkippedDesc")
          : t("ats.stepMatchingDesc"),
        status: "pending",
      },
      {
        id: "scoring",
        label: t("ats.stepScoringLabel"),
        description: t("ats.stepScoringDesc"),
        status: "pending",
      },
    ]);

    try {
      // Step 1: Format check animation delay
      await new Promise((r) => setTimeout(r, 600));
      setChecklist((prev) =>
        prev.map((item, idx) =>
          idx === 0
            ? { ...item, status: "completed" }
            : idx === 1
            ? { ...item, status: onlyFormat ? "completed" : "running" }
            : item
        )
      );

      // Perform Backend Call
      let result: atsscore.FinalReport;
      if (onlyFormat || !jobDescription.trim()) {
        result = await WailsBridge.atsFormatCheck(cv);
      } else {
        result = await WailsBridge.atsFullCheck(cv, jobDescription.trim());
      }

      // Step 2 Completed
      if (!onlyFormat) {
        await new Promise((r) => setTimeout(r, 400));
        setChecklist((prev) =>
          prev.map((item, idx) =>
            idx === 1
              ? { ...item, status: "completed" }
              : idx === 2
              ? { ...item, status: "running" }
              : item
          )
        );
      } else {
        setChecklist((prev) =>
          prev.map((item, idx) => (idx === 2 ? { ...item, status: "running" } : item))
        );
      }

      // Step 3 Completed
      await new Promise((r) => setTimeout(r, 500));
      setChecklist((prev) => prev.map((item) => ({ ...item, status: "completed" })));

      await new Promise((r) => setTimeout(r, 400));
      setReport(result);
      setStep("result");
    } catch (err: any) {
      toast.error(t("app.asyncErrorTitle"), {
        description: err?.message || String(err),
      });
      setStep("input");
    }
  };

  const handleReset = () => {
    setStep("input");
    setReport(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> {t("ats.severityCritical")}
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-3 h-3" /> {t("ats.severityHigh")}
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
            <Info className="w-3 h-3" /> {t("ats.severityMedium")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Info className="w-3 h-3" /> {t("ats.severityLow")}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[4px] p-4 animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[var(--panel-solid)] rounded-2xl shadow-2xl border border-[var(--border)] flex flex-col max-h-[85vh] overflow-hidden"
        style={{ color: "var(--ink)" }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--sidebar-bg)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">{t("ats.modalTitle")}</h2>
              <p className="text-xs text-[var(--ink-secondary)]">
                {t("ats.modalSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--border)] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* STEP 1: Input Screen */}
          {step === "input" && (
            <div className="flex flex-col gap-5">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex gap-3 text-xs text-indigo-900 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">{t("ats.howItWorksTitle")}</strong>
                  {t("ats.howItWorksDesc")}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[var(--ink)] flex items-center justify-between">
                  <span>{t("ats.jobDescLabel")}</span>
                  <span className="text-[11px] font-normal text-[var(--ink-faint)]">
                    {t("ats.charCount", { count: jobDescription.length })}
                  </span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder={t("ats.jobDescPlaceholder")}
                  rows={6}
                  className="w-full text-xs p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all custom-scrollbar resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => runAnalysis(true)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--border)] text-xs font-semibold text-[var(--ink)] transition-all cursor-pointer flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4 text-[var(--ink-secondary)]" />
                  <span>{t("ats.checkFormatOnly")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => runAnalysis(false)}
                  disabled={!jobDescription.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t("ats.startFullMatch")}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Progress & Checklist Screen */}
          {step === "loading" && (
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="text-center mb-6">
                <h3 className="text-sm font-bold text-[var(--ink)]">{t("ats.checkingTitle")}</h3>
                <p className="text-xs text-[var(--ink-secondary)] mt-1">
                  {t("ats.checkingSubtitle")}
                </p>
              </div>

              <div className="w-full max-w-md flex flex-col gap-3">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                      item.status === "completed"
                        ? "bg-emerald-50/50 border-emerald-200"
                        : item.status === "running"
                        ? "bg-indigo-50/60 border-indigo-200 shadow-sm"
                        : "bg-[var(--surface)] border-[var(--border)] opacity-60"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.status === "completed" ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-scale-in">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : item.status === "running" ? (
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-[var(--border)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-bold ${
                          item.status === "completed"
                            ? "text-emerald-900"
                            : item.status === "running"
                            ? "text-indigo-900"
                            : "text-[var(--ink)]"
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[11px] text-[var(--ink-secondary)] mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Results Dashboard */}
          {step === "result" && report && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Score Header Card */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-[var(--surface)] to-[var(--panel-solid)] border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-extrabold shadow-sm ${getScoreColor(
                      report.score
                    )}`}
                  >
                    <span className="text-2xl leading-none">{report.score}</span>
                    <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-80">/ 100</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ink)]">
                      {report.score >= 80
                        ? t("ats.scoreExcellent")
                        : report.score >= 50
                        ? t("ats.scoreGood")
                        : t("ats.scoreCritical")}
                    </h3>
                    <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                      {report.contentPending
                        ? t("ats.scoreFormatOnlyDesc")
                        : t("ats.scoreFullDesc", {
                            formatScore: report.formatScore,
                            contentScore: report.contentScore ?? 0,
                          })}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 text-xs text-[var(--ink-secondary)] hover:text-[var(--accent)] hover:bg-[var(--border)] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  title={t("common.retry")}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="font-semibold">{t("common.retry")}</span>
                </button>
              </div>

              {/* Format Findings Section */}
              <div className="flex flex-col gap-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--ink-faint)] flex items-center gap-2">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>
                    {t("ats.formatFindingsTitle", {
                      count: report.formatFindings?.length || 0,
                    })}
                  </span>
                </div>

                {report.formatFindings && report.formatFindings.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {report.formatFindings.map((f, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0">{getSeverityBadge(f.severity)}</div>
                          <div>
                            <p className="font-medium text-[var(--ink)]">{f.message}</p>
                            {f.field && (
                              <span className="text-[10px] text-[var(--ink-faint)] font-mono block mt-0.5">
                                {t("ats.fieldLabel", { field: f.field })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-800 text-xs flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t("ats.noFormatErrors")}</span>
                  </div>
                )}
              </div>

              {/* Matched & Missing Skills */}
              {!report.contentPending && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matched Skills */}
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex flex-col gap-2">
                    <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {t("ats.matchedSkillsTitle", {
                          count: report.matchedSkills?.length || 0,
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {report.matchedSkills && report.matchedSkills.length > 0 ? (
                        report.matchedSkills.map((s, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--ink-faint)] italic">{t("ats.noMatchedSkills")}</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col gap-2">
                    <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>
                        {t("ats.missingSkillsTitle", {
                          count: report.missingSkills?.length || 0,
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {report.missingSkills && report.missingSkills.length > 0 ? (
                        report.missingSkills.map((s, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-700 italic">{t("ats.noMissingSkills")}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actionable Suggestions */}
              {!report.contentPending && report.suggestions && report.suggestions.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--ink-faint)] flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t("ats.suggestionsTitle")}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {report.suggestions.map((sug, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 text-xs text-amber-950 flex items-start gap-3"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="leading-relaxed font-medium">{sug.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--sidebar-bg)] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--border)] hover:bg-[var(--ink-faint)]/20 text-xs font-semibold text-[var(--ink)] transition-colors cursor-pointer"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

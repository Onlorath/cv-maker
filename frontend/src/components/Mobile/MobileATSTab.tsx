import React, { useState } from "react";
import {
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

type Step = "input" | "loading" | "result";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: "pending" | "running" | "completed";
}

export const MobileATSTab: React.FC = () => {
  const cv = useCVStore((state) => state.cv);
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("input");
  const [jobDescription, setJobDescription] = useState("");
  const [report, setReport] = useState<atsscore.FinalReport | null>(null);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
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

      let result: atsscore.FinalReport;
      if (onlyFormat || !jobDescription.trim()) {
        result = await WailsBridge.atsFormatCheck(cv);
      } else {
        result = await WailsBridge.atsFullCheck(cv, jobDescription.trim());
      }

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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> {t("ats.severityCritical")}
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-3 h-3" /> {t("ats.severityHigh")}
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
            <Info className="w-3 h-3" /> {t("ats.severityMedium")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Info className="w-3 h-3" /> {t("ats.severityLow")}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-4 bg-[var(--panel-solid)] text-[var(--ink)]">
      <div className="max-w-xl mx-auto space-y-4 pb-20">
        {/* Header card */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">{t("ats.modalTitle")}</h2>
            <p className="text-[11px] text-[var(--ink-secondary)] leading-tight mt-0.5">
              {t("ats.modalSubtitle")}
            </p>
          </div>
        </div>

        {/* STEP 1: Input Screen */}
        {step === "input" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3.5 flex gap-2.5 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">{t("ats.howItWorksTitle")}</strong>
                <p className="text-[11.5px] opacity-90">{t("ats.howItWorksDesc")}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--ink)] flex items-center justify-between">
                <span>{t("ats.jobDescLabel")}</span>
                <span className="text-[10.5px] font-normal text-[var(--ink-faint)]">
                  {t("ats.charCount", { count: jobDescription.length })}
                </span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={t("ats.jobDescPlaceholder")}
                rows={5}
                className="w-full text-xs p-3 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all custom-scrollbar resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => runAnalysis(true)}
                className="flex-1 py-3 px-3 rounded-xl border border-[var(--border)] hover:bg-[var(--border)] text-xs font-semibold text-[var(--ink)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FileCheck2 className="w-4 h-4 text-[var(--ink-secondary)]" />
                <span>{t("ats.checkFormatOnly")}</span>
              </button>
              <button
                type="button"
                onClick={() => runAnalysis(false)}
                disabled={!jobDescription.trim()}
                className="flex-1 py-3 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t("ats.startFullMatch")}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Loading Checklist */}
        {step === "loading" && (
          <div className="py-6 flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <div className="text-center">
              <h3 className="text-sm font-bold text-[var(--ink)]">{t("ats.checkingTitle")}</h3>
              <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                {t("ats.checkingSubtitle")}
              </p>
            </div>

            <div className="w-full space-y-2.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    item.status === "completed"
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                      : item.status === "running"
                      ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 shadow-xs"
                      : "bg-[var(--input-bg)] border-[var(--border)] opacity-60"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.status === "completed" ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : item.status === "running" ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[var(--border)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[var(--ink)]">{item.label}</div>
                    <div className="text-[10.5px] text-[var(--ink-secondary)] mt-0.5">
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
          <div className="space-y-4 animate-fade-in">
            {/* Score Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--border)] shadow-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center font-extrabold ${getScoreColor(
                    report.score
                  )}`}
                >
                  <span className="text-xl leading-none">{report.score}</span>
                  <span className="text-[8px] uppercase tracking-wider mt-0.5 opacity-80">/ 100</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--ink)]">
                    {report.score >= 80
                      ? t("ats.scoreExcellent")
                      : report.score >= 50
                      ? t("ats.scoreGood")
                      : t("ats.scoreCritical")}
                  </h3>
                  <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5">
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
                className="p-2 text-xs text-[var(--ink-secondary)] hover:text-[var(--accent)] hover:bg-[var(--border)] rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                title={t("common.retry")}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-semibold">{t("common.retry")}</span>
              </button>
            </div>

            {/* Format Findings */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)] flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>
                  {t("ats.formatFindingsTitle", {
                    count: report.formatFindings?.length || 0,
                  })}
                </span>
              </div>

              {report.formatFindings && report.formatFindings.length > 0 ? (
                <div className="space-y-2">
                  {report.formatFindings.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] flex items-start gap-2.5 text-xs"
                    >
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
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t("ats.noFormatErrors")}</span>
                </div>
              )}
            </div>

            {/* Matched & Missing Skills */}
            {!report.contentPending && (
              <div className="space-y-3">
                {/* Matched */}
                <div className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {t("ats.matchedSkillsTitle", {
                        count: report.matchedSkills?.length || 0,
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {report.matchedSkills && report.matchedSkills.length > 0 ? (
                      report.matchedSkills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[10.5px] font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[var(--ink-faint)] italic">{t("ats.noMatchedSkills")}</span>
                    )}
                  </div>
                </div>

                {/* Missing */}
                <div className="p-3 rounded-xl border border-rose-100 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20 space-y-1.5">
                  <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>
                      {t("ats.missingSkillsTitle", {
                        count: report.missingSkills?.length || 0,
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {report.missingSkills && report.missingSkills.length > 0 ? (
                      report.missingSkills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[10.5px] font-semibold bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 italic">{t("ats.noMissingSkills")}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {!report.contentPending && report.suggestions && report.suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)] flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t("ats.suggestionsTitle")}</span>
                </div>
                <div className="space-y-2">
                  {report.suggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="flex-1 leading-relaxed font-medium">{sug.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

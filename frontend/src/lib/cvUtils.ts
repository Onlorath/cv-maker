import type { CVEntry } from "../types/cv";

export function cleanUrlDisplay(url: string): string {
  if (!url) return "";
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

export function getHref(value: string, type: "email" | "phone" | "url"): string {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (type === "email") {
    return trimmed.startsWith("mailto:") ? trimmed : `mailto:${trimmed}`;
  }
  if (type === "phone") {
    return `tel:${trimmed.replace(/\s+/g, "")}`;
  }
  if (type === "url") {
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }
  return trimmed;
}

export function parseBullets(text: string): string[] {
  if (!text) return [];
  const lines = text.split("\n");
  const bullets: string[] = [];
  let currentBullet = "";

  const isBulletStart = (line: string) => /^[-*•]\s*/.test(line.trim());
  const hasAnyBullets = lines.some((l) => isBulletStart(l));

  if (!hasAnyBullets) {
    return lines.map((l) => l.trim()).filter(Boolean);
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      if (currentBullet) {
        bullets.push(currentBullet);
        currentBullet = "";
      }
      continue;
    }

    if (isBulletStart(trimmed)) {
      if (currentBullet) {
        bullets.push(currentBullet);
      }
      currentBullet = trimmed.replace(/^[-*•]\s*/, "");
    } else {
      if (currentBullet) {
        currentBullet += " " + trimmed;
      } else {
        currentBullet = trimmed;
      }
    }
  }

  if (currentBullet) {
    bullets.push(currentBullet);
  }

  return bullets;
}

export function formatDateRange(entry: CVEntry, presentLabel: string): string {
  const start = (entry.dateStart ?? "").trim();
  const end = entry.isCurrent ? presentLabel : (entry.dateEnd ?? "").trim();
  if (!start && !end) return "";
  if (start && end) return `${start} — ${end}`;
  return start || end;
}

// Simple generic debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitFor: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

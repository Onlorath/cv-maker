import { Document, Page, View, Text, Image, Link, StyleSheet } from "@react-pdf/renderer";
import { registerCVFonts } from "./fonts";
import type { CVEntry, CVSection, CVTemplateProps } from "../types/cv";
import { getSectionDisplayTitle } from "../i18n";

registerCVFonts();

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 9.5,
    color: "#1e293b",
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    backgroundColor: "#ffffff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a",
    paddingBottom: 12,
  },
  headerText: {
    flexGrow: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "medium",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 8.5,
    color: "#64748b",
  },
  contactItem: {
    marginRight: 12,
    marginBottom: 2,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 6,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Roboto",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 3,
    marginTop: 10,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 1.45,
    color: "#334155",
  },
  entryBlock: {
    marginBottom: 7,
  },
  entryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: "#0f172a",
  },
  entrySubtitle: {
    fontSize: 9.5,
    color: "#334155",
    fontWeight: "medium",
  },
  entryDates: {
    fontSize: 8.5,
    color: "#64748b",
  },
  entryLocation: {
    fontSize: 8.5,
    color: "#64748b",
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 2.5,
  },
  bulletDot: {
    width: 8,
    fontSize: 8.5,
    color: "#64748b",
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.35,
    color: "#334155",
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  skillChip: {
    fontSize: 8.5,
    color: "#1e293b",
    backgroundColor: "#f1f5f9",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    marginRight: 4,
    marginBottom: 3,
  },
});

function cleanUrlDisplay(url: string): string {
  if (!url) return "";
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

function getHref(value: string, type: "email" | "phone" | "url"): string {
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

function parseBullets(text: string): string[] {
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

function formatDateRange(entry: CVEntry, lang: "tr" | "en"): string {
  const present = lang === "tr" ? "Devam Ediyor" : "Present";
  const start = entry.dateStart ?? "";
  const end = entry.isCurrent ? present : entry.dateEnd ?? "";
  if (!start && !end) return "";
  return `${start} — ${end}`;
}

function BulletList({ text }: { text: string }) {
  const lines = parseBullets(text);
  if (lines.length === 0) return null;

  return (
    <View style={{ marginTop: 2 }}>
      {lines.map((line, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

function StandardEntry({ entry, lang }: { entry: CVEntry; lang: "tr" | "en" }) {
  const dateRange = formatDateRange(entry, lang);
  return (
    <View style={styles.entryBlock}>
      <View style={styles.entryHeaderRow}>
        <Text style={styles.entryTitle}>{entry.title || "Untitled Role / Degree"}</Text>
        {dateRange ? <Text style={styles.entryDates}>{dateRange}</Text> : null}
      </View>
      <View style={styles.entryHeaderRow}>
        {entry.subtitle ? <Text style={styles.entrySubtitle}>{entry.subtitle}</Text> : <Text style={styles.entrySubtitle}> </Text>}
        {entry.location ? <Text style={styles.entryLocation}>{entry.location}</Text> : null}
      </View>
      {entry.description ? <BulletList text={entry.description} /> : null}
    </View>
  );
}

function SkillsList({ entries }: { entries: CVEntry[] }) {
  const hasCategories = entries.some(
    (e) => (e.description || "").trim().length > 0 || (e.title || "").includes(":")
  );

  if (hasCategories) {
    return (
      <View style={{ marginTop: 2, marginBottom: 4 }}>
        {entries.map((e) => (
          <View key={e.id} style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 2.5 }}>
            {e.title ? (
              <Text style={{ fontFamily: "Roboto", fontWeight: 700, fontSize: 9.5, color: "#0f172a" }}>
                {e.title}:{" "}
              </Text>
            ) : null}
            <Text style={{ fontFamily: "Roboto", fontSize: 9.5, color: "#334155" }}>
              {e.description || e.title}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.skillsWrap}>
      {entries.map((e) => {
        const level = (e.meta?.level as string | undefined) ?? "";
        return (
          <Text key={e.id} style={styles.skillChip}>
            {e.title}
            {level ? ` (${level})` : ""}
          </Text>
        );
      })}
    </View>
  );
}

function ChipList({ entries }: { entries: CVEntry[] }) {
  return (
    <View style={styles.skillsWrap}>
      {entries.map((e) => {
        const level = (e.meta?.level as string | undefined) ?? "";
        return (
          <Text key={e.id} style={styles.skillChip}>
            {e.title}
            {level ? ` (${level})` : ""}
          </Text>
        );
      })}
    </View>
  );
}

function Section({ section, lang }: { section: CVSection; lang: "tr" | "en" }) {
  const entries = section.entries || [];
  const sortedEntries = [...entries].sort((a, b) =>
    (a.orderKey || "").localeCompare(b.orderKey || "")
  );

  if (section.sectionType === "skills") {
    return (
      <View>
        <Text style={styles.sectionTitle}>{getSectionDisplayTitle(section, lang)}</Text>
        <SkillsList entries={sortedEntries} />
      </View>
    );
  }

  if (section.sectionType === "languages") {
    return (
      <View>
        <Text style={styles.sectionTitle}>{getSectionDisplayTitle(section, lang)}</Text>
        <ChipList entries={sortedEntries} />
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>{getSectionDisplayTitle(section, lang)}</Text>
      {sortedEntries.map((entry) => (
        <StandardEntry key={entry.id} entry={entry} lang={lang} />
      ))}
    </View>
  );
}

export function ATSClassicTemplate({ data }: CVTemplateProps) {
  const sortedSections = [...(data.sections || [])].sort((a, b) =>
    (a.orderKey || "").localeCompare(b.orderKey || "")
  );

  const contactItems: { text: string; href?: string }[] = [];
  if (data.email) {
    contactItems.push({ text: data.email, href: getHref(data.email, "email") });
  }
  if (data.phone) {
    contactItems.push({ text: data.phone, href: getHref(data.phone, "phone") });
  }
  if (data.location) {
    contactItems.push({ text: data.location });
  }
  if (data.linkedin) {
    contactItems.push({ text: cleanUrlDisplay(data.linkedin), href: getHref(data.linkedin, "url") });
  }
  if (data.github) {
    contactItems.push({ text: cleanUrlDisplay(data.github), href: getHref(data.github, "url") });
  }
  if (data.website) {
    contactItems.push({ text: cleanUrlDisplay(data.website), href: getHref(data.website, "url") });
  }

  return (
    <Document title={`${data.fullName || "CV"} - Resume`} author={data.fullName || "User"}>
      <Page size="A4" style={styles.page}>
        {/* Header section */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{data.fullName || "Your Name"}</Text>
            {data.jobTitle ? <Text style={styles.jobTitle}>{data.jobTitle}</Text> : null}
            <View style={styles.contactRow}>
              {contactItems.map((item, i) =>
                item.href ? (
                  <Link key={i} src={item.href} style={styles.contactItem}>
                    {item.text}
                  </Link>
                ) : (
                  <Text key={i} style={styles.contactItem}>
                    {item.text}
                  </Text>
                )
              )}
            </View>
          </View>

          {data.photoPath ? (
            <Image src={data.photoPath} style={styles.photo} />
          ) : null}
        </View>

        {/* Summary section */}
        {data.summary ? (
          <View style={{ marginBottom: 6 }}>
            <Text style={styles.sectionTitle}>
              {data.language === "tr" ? "ÖZET" : "PROFESSIONAL SUMMARY"}
            </Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        ) : null}

        {/* Dynamic Sections */}
        {sortedSections.map((section) => (
          <Section key={section.id} section={section} lang={data.language} />
        ))}
      </Page>
    </Document>
  );
}

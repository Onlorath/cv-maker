import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { registerCVFonts } from "./fonts";
import type { CVEntry, CVSection, CVTemplateProps } from "../types/cv";

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

function formatDateRange(entry: CVEntry, lang: "tr" | "en"): string {
  const present = lang === "tr" ? "Devam Ediyor" : "Present";
  const start = entry.dateStart ?? "";
  const end = entry.isCurrent ? present : entry.dateEnd ?? "";
  if (!start && !end) return "";
  return `${start} — ${end}`;
}

function BulletList({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-*•]\s*/, ""));

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

  const isChipStyle =
    section.sectionType === "skills" || section.sectionType === "languages";

  return (
    <View>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {isChipStyle ? (
        <ChipList entries={sortedEntries} />
      ) : (
        sortedEntries.map((entry) => (
          <StandardEntry key={entry.id} entry={entry} lang={lang} />
        ))
      )}
    </View>
  );
}

export function ATSClassicTemplate({ data }: CVTemplateProps) {
  const sortedSections = [...(data.sections || [])].sort((a, b) =>
    (a.orderKey || "").localeCompare(b.orderKey || "")
  );

  const contactParts = [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.github,
    data.website,
  ].filter(Boolean);

  return (
    <Document title={`${data.fullName || "CV"} - Resume`} author={data.fullName || "User"}>
      <Page size="A4" style={styles.page}>
        {/* Header section */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{data.fullName || "Your Name"}</Text>
            {data.jobTitle ? <Text style={styles.jobTitle}>{data.jobTitle}</Text> : null}
            <View style={styles.contactRow}>
              {contactParts.map((part, i) => (
                <Text key={i} style={styles.contactItem}>
                  {part}
                </Text>
              ))}
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

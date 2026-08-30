import { Document, Page, View, Text, Image, Link, StyleSheet } from "@react-pdf/renderer";
import { registerCVFonts } from "./fonts";
import type { CVEntry, CVSection, CVTemplateProps } from "../types/cv";
import { getSectionDisplayTitle } from "../i18n";
import { cleanUrlDisplay, getHref, parseBullets, formatDateRange, sortByOrderKey } from "../lib/cvUtils";

registerCVFonts();

// -----------------------------------------------------------------------
// ATS NOTU: react-pdf, JSX'te tanımlanan component sırasını PDF content
// stream'ine birebir aynı sırayla yazar. Yani bir ATS parser'ın metni okuma
// sırası = bu dosyadaki JSX sırasıdır. Flex layout kullanıldığında görsel sıra
// ile JSX sırası örtüşür. Bu sebeple foto için absolute positioning kullanılmaz;
// header'da text bloğu önce, foto flex satırının son elemanı olarak tanımlanır.
// Bu sayede hem doğru görsel yerleşim hem de doğru ATS okuma sırası sağlanır.
// -----------------------------------------------------------------------

const createTemplateStyles = (compact: boolean) => StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: compact ? 8.8 : 9.5,
    color: "#1e293b",
    paddingTop: compact ? 24 : 32,
    paddingBottom: compact ? 24 : 32,
    paddingHorizontal: compact ? 30 : 36,
    backgroundColor: "#ffffff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: compact ? 10 : 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a",
    paddingBottom: compact ? 8 : 12,
  },
  headerText: {
    flexGrow: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: compact ? 20 : 22,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: -0.5,
    marginBottom: compact ? 1 : 2,
  },
  jobTitle: {
    fontSize: compact ? 10.5 : 11.5,
    color: "#475569",
    fontWeight: 500,
    marginBottom: compact ? 4 : 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: compact ? 8 : 8.5,
    color: "#64748b",
  },
  contactItem: {
    marginRight: compact ? 10 : 12,
    marginBottom: compact ? 1.5 : 2,
    color: "#64748b",
    textDecoration: "none",
  },
  photo: {
    width: compact ? 72 : 84,
    height: compact ? 72 : 84,
    borderRadius: 6,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  sectionTitle: {
    fontSize: compact ? 10 : 11,
    fontFamily: "Roboto",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: compact ? 2 : 3,
    marginTop: compact ? 7 : 10,
    marginBottom: compact ? 4 : 6,
  },
  summaryText: {
    fontSize: compact ? 8.5 : 9,
    lineHeight: compact ? 1.35 : 1.45,
    color: "#334155",
  },
  entryBlock: {
    marginBottom: compact ? 4 : 7,
  },
  entryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryTitle: {
    fontSize: compact ? 9.5 : 10,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: "#0f172a",
  },
  entrySubtitle: {
    fontSize: compact ? 9 : 9.5,
    color: "#334155",
    fontWeight: 500,
  },
  entryDates: {
    fontSize: compact ? 8 : 8.5,
    color: "#64748b",
  },
  entryLocation: {
    fontSize: compact ? 8 : 8.5,
    color: "#64748b",
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: compact ? 1.5 : 2.5,
  },
  bulletDot: {
    width: compact ? 7 : 8,
    fontSize: compact ? 8 : 8.5,
    color: "#64748b",
  },
  bulletText: {
    flex: 1,
    fontSize: compact ? 8.5 : 9,
    lineHeight: compact ? 1.25 : 1.35,
    color: "#334155",
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: compact ? 1.5 : 2,
  },
  skillChip: {
    fontSize: compact ? 8 : 8.5,
    color: "#1e293b",
    backgroundColor: "#f1f5f9",
    paddingVertical: compact ? 1.5 : 2,
    paddingHorizontal: compact ? 5 : 6,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    marginRight: compact ? 3 : 4,
    marginBottom: compact ? 2 : 3,
  },
  skillCatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: compact ? 1.5 : 2.5,
  },
  skillCatTitle: {
    fontFamily: "Roboto",
    fontWeight: 700,
    fontSize: compact ? 8.8 : 9.5,
    color: "#0f172a",
  },
  skillCatText: {
    fontFamily: "Roboto",
    fontSize: compact ? 8.8 : 9.5,
    color: "#334155",
  },
});

type TemplateStyles = ReturnType<typeof createTemplateStyles>;

function BulletList({ text, styles }: { text: string; styles: TemplateStyles }) {
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

function StandardEntry({
  entry,
  lang,
  styles,
}: {
  entry: CVEntry;
  lang: "tr" | "en";
  styles: TemplateStyles;
}) {
  const presentLabel = lang === "tr" ? "Devam Ediyor" : "Present";
  const dateRange = formatDateRange(entry, presentLabel);
  const linkUrl = (entry.meta?.link as string) || (entry.meta?.url as string) || "";
  const href = linkUrl ? getHref(linkUrl, "url") : "";
  const cleanLink = linkUrl ? cleanUrlDisplay(linkUrl) : "";

  return (
    <View style={styles.entryBlock}>
      <View style={styles.entryHeaderRow}>
        <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", flex: 1, marginRight: 8 }}>
          <Text style={styles.entryTitle}>{entry.title || "Untitled Role / Degree"}</Text>
          {cleanLink && href ? (
            <Text style={{ fontSize: styles.entryDates.fontSize, color: "#64748b", marginLeft: 4 }}>
              {" | "}
              <Link src={href} style={{ color: "#2563eb", textDecoration: "none" }}>
                {cleanLink}
              </Link>
            </Text>
          ) : null}
        </View>
        {dateRange ? <Text style={styles.entryDates}>{dateRange}</Text> : null}
      </View>
      <View style={styles.entryHeaderRow}>
        {entry.subtitle ? (
          <Text style={styles.entrySubtitle}>{entry.subtitle}</Text>
        ) : (
          <Text style={styles.entrySubtitle}> </Text>
        )}
        {entry.location ? <Text style={styles.entryLocation}>{entry.location}</Text> : null}
      </View>
      {entry.description ? <BulletList text={entry.description} styles={styles} /> : null}
    </View>
  );
}

function SkillsList({ entries, styles }: { entries: CVEntry[]; styles: TemplateStyles }) {
  const hasCategories = entries.some(
    (e) => (e.description || "").trim().length > 0 || (e.title || "").includes(":")
  );

  if (hasCategories) {
    return (
      <View style={{ marginTop: 2, marginBottom: 4 }}>
        {entries.map((e) => (
          <View key={e.id} style={styles.skillCatRow}>
            {e.title ? (
              <Text style={styles.skillCatTitle}>
                {e.title}:{" "}
              </Text>
            ) : null}
            <Text style={styles.skillCatText}>
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

// ChipList removed in favor of SkillsList

function Section({
  section,
  lang,
  styles,
}: {
  section: CVSection;
  lang: "tr" | "en";
  styles: TemplateStyles;
}) {
  const sortedEntries = sortByOrderKey(section.entries);

  if (section.sectionType === "skills" || section.sectionType === "languages") {
    return (
      <View>
        <Text style={styles.sectionTitle}>{getSectionDisplayTitle(section, lang)}</Text>
        <SkillsList entries={sortedEntries} styles={styles} />
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>{getSectionDisplayTitle(section, lang)}</Text>
      {sortedEntries.map((entry) => (
        <StandardEntry key={entry.id} entry={entry} lang={lang} styles={styles} />
      ))}
    </View>
  );
}

export function ATSClassicTemplate({ data, compact = false }: CVTemplateProps) {
  const styles = createTemplateStyles(compact);
  const sortedSections = sortByOrderKey(data.sections);

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
          <View style={{ marginBottom: compact ? 4 : 6 }}>
            <Text style={styles.sectionTitle}>
              {data.language === "tr" ? "ÖZET" : "PROFESSIONAL SUMMARY"}
            </Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        ) : null}

        {/* Dynamic Sections */}
        {sortedSections.map((section) => (
          <Section key={section.id} section={section} lang={data.language} styles={styles} />
        ))}
      </Page>
    </Document>
  );
}

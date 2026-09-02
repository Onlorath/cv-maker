import React from "react";
import { Document, Page, View, Text, Image, Link, StyleSheet } from "@react-pdf/renderer";
import { registerCVFonts } from "./fonts";
import type { CVEntry, CVSection, CVTemplateProps } from "../types/cv";
import { getSectionDisplayTitle } from "../i18n";
import { cleanUrlDisplay, getHref, parseBullets, formatDateRange, sortByOrderKey } from "../lib/cvUtils";

registerCVFonts();

const createTemplateStyles = (compact: boolean) =>
  StyleSheet.create({
    page: {
      fontFamily: "Roboto",
      fontSize: compact ? 8.8 : 9.5,
      color: "#1a1a1a",
      paddingTop: compact ? 26 : 34,
      paddingBottom: compact ? 26 : 34,
      paddingHorizontal: compact ? 32 : 40,
      backgroundColor: "#ffffff",
    },
    header: {
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      marginBottom: 2,
    },
    photo: {
      width: compact ? 72 : 84,
      height: compact ? 72 : 84,
      borderRadius: compact ? 36 : 42,
      borderWidth: 2,
      borderColor: "#1E3A5F",
      marginBottom: compact ? 8 : 12,
      objectFit: "cover",
    },
    name: {
      fontSize: compact ? 20 : 22,
      fontFamily: "Roboto",
      fontWeight: "bold",
      color: "#1a1a1a",
      letterSpacing: -0.2,
      marginBottom: compact ? 2 : 3,
      textAlign: "center",
    },
    jobTitle: {
      fontSize: compact ? 11 : 12.5,
      color: "#4a4a4a",
      marginBottom: compact ? 6 : 8,
      textAlign: "center",
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      fontSize: compact ? 8.5 : 9.5,
      color: "#6a6a6a",
    },
    contactItem: {
      color: "#6a6a6a",
      textDecoration: "none",
    },
    contactSeparator: {
      color: "#94a3b8",
      marginHorizontal: compact ? 4 : 6,
    },
    headerDivider: {
      height: 2,
      backgroundColor: "#1E3A5F",
      width: "100%",
      marginTop: compact ? 10 : 14,
      marginBottom: compact ? 12 : 16,
    },
    sectionTitle: {
      fontSize: compact ? 11 : 12.5,
      fontFamily: "Roboto",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      color: "#1a1a1a",
      borderBottomWidth: 1,
      borderBottomColor: "#cfcfcf",
      paddingBottom: compact ? 2 : 3,
      marginTop: compact ? 8 : 12,
      marginBottom: compact ? 4 : 6,
    },
    summaryText: {
      fontSize: compact ? 8.8 : 9.5,
      lineHeight: compact ? 1.35 : 1.45,
      color: "#262626",
    },
    entryBlock: {
      marginBottom: compact ? 5 : 7,
    },
    entryHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    entryTitle: {
      fontSize: compact ? 9.5 : 10.5,
      fontFamily: "Roboto",
      fontWeight: "bold",
      color: "#1a1a1a",
    },
    entrySubtitle: {
      fontSize: compact ? 8.8 : 9.5,
      color: "#4a4a4a",
    },
    entryDates: {
      fontSize: compact ? 8 : 9,
      color: "#6a6a6a",
    },
    entryLocation: {
      fontSize: compact ? 8 : 9,
      color: "#6a6a6a",
    },
    bulletRow: {
      flexDirection: "row",
      marginTop: compact ? 1.5 : 2,
    },
    bulletDot: {
      width: compact ? 7 : 8,
      fontSize: compact ? 8 : 8.5,
      color: "#6a6a6a",
    },
    bulletText: {
      flex: 1,
      fontSize: compact ? 8.5 : 9,
      lineHeight: compact ? 1.25 : 1.35,
      color: "#262626",
    },
    skillsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: compact ? 1.5 : 2,
    },
    skillChip: {
      fontSize: compact ? 8 : 8.8,
      color: "#1a1a1a",
      backgroundColor: "#f8fafc",
      paddingVertical: compact ? 1.5 : 2,
      paddingHorizontal: compact ? 5 : 6,
      borderRadius: 3,
      borderWidth: 0.5,
      borderColor: "#cbd5e1",
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
      fontWeight: "bold",
      fontSize: compact ? 8.8 : 9.5,
      color: "#1a1a1a",
    },
    skillCatText: {
      fontFamily: "Roboto",
      fontSize: compact ? 8.8 : 9.5,
      color: "#262626",
    },
  });

type TemplateStyles = ReturnType<typeof createTemplateStyles>;

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
  const bullets = entry.description ? parseBullets(entry.description) : [];

  return (
    <View style={styles.entryBlock}>
      {/* Entry header: wrap={false} and minPresenceAhead={30} ensures role title is never stranded without bullet content */}
      <View wrap={false} minPresenceAhead={30}>
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
        <View style={[styles.entryHeaderRow, { marginTop: 1 }]}>
          {entry.subtitle ? (
            <Text style={styles.entrySubtitle}>{entry.subtitle}</Text>
          ) : (
            <Text style={styles.entrySubtitle}> </Text>
          )}
          {entry.location ? <Text style={styles.entryLocation}>{entry.location}</Text> : null}
        </View>
      </View>

      {/* Bullets: each row is protected by wrap={false}, cleanly splitting across page boundaries without overlapping */}
      {bullets.map((line, i) => (
        <View key={i} style={styles.bulletRow} wrap={false}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{line}</Text>
        </View>
      ))}
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
      <View wrap={false}>
        <Text style={styles.sectionTitle}>{getSectionDisplayTitle(section, lang)}</Text>
        <SkillsList entries={sortedEntries} styles={styles} />
      </View>
    );
  }

  return (
    <View>
      <View minPresenceAhead={50}>
        <Text style={styles.sectionTitle}>
          {getSectionDisplayTitle(section, lang)}
        </Text>
      </View>
      {sortedEntries.map((entry) => (
        <StandardEntry key={entry.id} entry={entry} lang={lang} styles={styles} />
      ))}
    </View>
  );
}

export function ATSPhotoTemplate({ data, compact = false }: CVTemplateProps) {
  const styles = createTemplateStyles(compact);
  const sortedSections = sortByOrderKey(data.sections);
  const lang = (data.language || "tr") as "tr" | "en";
  const photoDimension = data.photoSize && data.photoSize > 0 ? data.photoSize : (compact ? 72 : 84);

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
        {/* Centered Header section */}
        <View style={styles.header}>
          {/* Conditional Photo rendering: only when photoPath exists */}
          {data.photoPath ? (
            <Image
              src={data.photoPath}
              style={[
                styles.photo,
                {
                  width: photoDimension,
                  height: photoDimension,
                  borderRadius: photoDimension / 2,
                },
              ]}
            />
          ) : null}

          <Text style={styles.name}>{data.fullName || "Your Name"}</Text>
          {data.jobTitle ? <Text style={styles.jobTitle}>{data.jobTitle}</Text> : null}

          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={styles.contactSeparator}>•</Text>}
                {item.href ? (
                  <Link src={item.href} style={styles.contactItem}>
                    {item.text}
                  </Link>
                ) : (
                  <Text style={styles.contactItem}>{item.text}</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Decorative Divider */}
        <View style={styles.headerDivider} />

        {/* Summary section */}
        {data.summary ? (
          <View style={{ marginBottom: compact ? 4 : 6 }} wrap={false}>
            <Text style={styles.sectionTitle}>
              {lang === "tr" ? "ÖZET" : "PROFESSIONAL SUMMARY"}
            </Text>
            {data.summary
              .split(/\n{2,}/)
              .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
              .filter(Boolean)
              .map((para, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.summaryText,
                    idx > 0 ? { marginTop: compact ? 2 : 3 } : {},
                  ]}
                >
                  {para}
                </Text>
              ))}
          </View>
        ) : null}

        {/* Dynamic Sections */}
        {sortedSections.map((section) => (
          <Section key={section.id} section={section} lang={lang} styles={styles} />
        ))}
      </Page>
    </Document>
  );
}

export default ATSPhotoTemplate;

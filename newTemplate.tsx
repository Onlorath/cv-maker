 import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { registerCVFonts } from "../shared/fonts";
import type { CVData, CVEntry, CVSection, CVTemplateProps } from "../shared/types";

registerCVFonts();

// -----------------------------------------------------------------------
// ATS NOTU: react-pdf, JSX'te tanımladığın component sırasını PDF content
// stream'ine BİREBİR aynı sırayla yazar. Yani bir ATS parser'ın metni okuma
// sırası = bu dosyadaki JSX sırası. Görsel pozisyon (flex/absolute) ayrı bir
// kavram; flex layout kullandığın sürece görsel sıra da JSX sırasıyla
// örtüşür, o yüzden foto için ayrıca absolute positioning'e gerek YOK —
// header'da text bloğunu önce, foto'yu flex satırının son elemanı olarak
// tanımlamak hem doğru görsel yerleşimi hem doğru okunma sırasını garanti
// ediyor. Absolute positioning sadece foto bir renkli bant/arka planla
// üst üste binecekse gerekir, bu şablonda öyle bir durum yok.
// -----------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSans",
    fontSize: 10,
    color: "#1a1a1a",
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerText: {
    flexGrow: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: 20,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 12,
    color: "#3a3a3a",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 9,
    color: "#4a4a4a",
  },
  contactItem: {
    marginRight: 10,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 4,
    objectFit: "cover",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#c9c9c9",
    paddingBottom: 3,
    marginTop: 12,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  entryBlock: {
    marginBottom: 8,
  },
  entryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  entryTitle: {
    fontSize: 10.5,
    fontFamily: "NotoSans",
    fontWeight: "bold",
  },
  entrySubtitle: {
    fontSize: 10,
    color: "#3a3a3a",
  },
  entryDates: {
    fontSize: 9,
    color: "#5a5a5a",
  },
  entryLocation: {
    fontSize: 9,
    color: "#5a5a5a",
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 3,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.35,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillChip: {
    fontSize: 9.5,
    marginRight: 8,
    marginBottom: 3,
  },
});

function formatDateRange(entry: CVEntry, lang: "tr" | "en"): string {
  const present = lang === "tr" ? "Devam ediyor" : "Present";
  const start = entry.dateStart ?? "";
  const end = entry.isCurrent ? present : entry.dateEnd ?? "";
  if (!start && !end) return "";
  return `${start} — ${end}`;
}

// description alanı "- madde 1\n- madde 2" formatında markdown bullet listesi
// olarak tutuluyor (bkz. model.go yorumu). Burada satır satır parse edip
// her satırı ayrı bir bullet View'a çeviriyoruz.
function BulletList({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-*]\s*/, ""));

  if (lines.length === 0) return null;

  return (
    <>
      {lines.map((line, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{line}</Text>
        </View>
      ))}
    </>
  );
}

function StandardEntry({ entry, lang }: { entry: CVEntry; lang: "tr" | "en" }) {
  const dateRange = formatDateRange(entry, lang);
  return (
    <View style={styles.entryBlock}>
      <View style={styles.entryHeaderRow}>
        <Text style={styles.entryTitle}>{entry.title}</Text>
        {dateRange ? <Text style={styles.entryDates}>{dateRange}</Text> : null}
      </View>
      <View style={styles.entryHeaderRow}>
        <Text style={styles.entrySubtitle}>{entry.subtitle}</Text>
        {entry.location ? (
          <Text style={styles.entryLocation}>{entry.location}</Text>
        ) : null}
      </View>
      {entry.description ? <BulletList text={entry.description} /> : null}
    </View>
  );
}

// skills / languages tipi entry'ler tarih içermez, kısa "chip" formatında
// yan yana dizilir — CV'nin kompakt kalması için.
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
  const sortedEntries = [...section.entries].sort((a, b) =>
    a.orderKey.localeCompare(b.orderKey),
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
  const sortedSections = [...data.sections].sort((a, b) =>
    a.orderKey.localeCompare(b.orderKey),
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
    <Document title={`${data.fullName} - CV`} author={data.fullName}>
      <Page size="A4" style={styles.page}>
        {/* Header: text bloğu JSX'te fotodan ÖNCE tanımlı -> content stream
            sırası doğru. Foto flex satırının sonunda -> görsel olarak sağda. */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{data.fullName}</Text>
            {data.jobTitle ? (
              <Text style={styles.jobTitle}>{data.jobTitle}</Text>
            ) : null}
            <View style={styles.contactRow}>
              {contactParts.map((part, i) => (
                <Text key={i} style={styles.contactItem}>
                  {part}
                </Text>
              ))}
            </View>
          </View>

          {data.photoPath ? (
            // NOT: react-pdf Image, uzak/relatif path değil resolve edilmiş
            // bir file:// URI veya base64 data URI bekler. Wails tarafında
            // photo_path'i asset server üzerinden çözümleyip buraya tam
            // path olarak geçirmen gerekiyor.
            <Image src={data.photoPath} style={styles.photo} />
          ) : null}
        </View>

        {data.summary ? (
          <View>
            <Text style={styles.sectionTitle}>
              {data.language === "tr" ? "Özet" : "Summary"}
            </Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        ) : null}

        {sortedSections.map((section) => (
          <Section key={section.id} section={section} lang={data.language} />
        ))}
      </Page>
    </Document>
  );
}
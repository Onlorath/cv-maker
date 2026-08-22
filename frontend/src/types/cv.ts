export type SectionType =
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "certifications"
  | "projects"
  | "custom";

export interface CVEntry {
  id: string;
  sectionId: string;
  orderKey: string;
  title: string;
  subtitle: string;
  location: string;
  dateStart?: string | null;
  dateEnd?: string | null;
  isCurrent: boolean;
  description: string;
  meta: Record<string, any>;
}

export interface CVSection {
  id: string;
  cvId: string;
  sectionType: SectionType;
  title: string;
  orderKey: string;
  entries: CVEntry[];
}

export interface CVData {
  id: string;
  title: string;
  language: "tr" | "en";
  templateId: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  photoPath?: string | null;
  sections: CVSection[];
}

export interface CVTemplateProps {
  data: CVData;
  compact?: boolean;
}

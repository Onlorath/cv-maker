import React from "react";
import type { CVTemplateProps } from "../types/cv";
import { ATSClassicTemplate } from "./ATSClassicTemplate";
import { ATSPhotoTemplate } from "./ATSPhotoTemplate";

export type TemplateId = "ats-classic" | "ats-photo";

export interface TemplateMetadata {
  id: TemplateId;
  nameKey: string;
  descKey: string;
}

export const AVAILABLE_TEMPLATES: TemplateMetadata[] = [
  {
    id: "ats-classic",
    nameKey: "templates.classicName",
    descKey: "templates.classicDesc",
  },
  {
    id: "ats-photo",
    nameKey: "templates.photoName",
    descKey: "templates.photoDesc",
  },
];

export function getCVTemplate(
  templateId?: string
): React.ComponentType<CVTemplateProps> {
  if (templateId === "ats-photo" || templateId === "ats-centered") {
    return ATSPhotoTemplate;
  }
  return ATSClassicTemplate;
}

import type { Translations } from "./locales/tr";

export type Language = "tr" | "en";

// Path key types for nested dictionary
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<Translations>;

export type InterpolationParams = Record<string, string | number>;

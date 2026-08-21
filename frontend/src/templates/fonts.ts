import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerCVFonts() {
  if (registered) return;

  try {
    Font.register({
      family: "Roboto",
      fonts: [
        {
          src: "/fonts/Roboto-Regular.ttf",
          fontWeight: "normal",
        },
        {
          src: "/fonts/Roboto-Bold.ttf",
          fontWeight: "bold",
        },
        {
          src: "/fonts/Roboto-Italic.ttf",
          fontStyle: "italic",
        },
      ],
    });

    // Turkish hyphenation protection
    Font.registerHyphenationCallback((word) => [word]);
    registered = true;
  } catch (err) {
    console.warn("Font registration failed:", err);
  }
}

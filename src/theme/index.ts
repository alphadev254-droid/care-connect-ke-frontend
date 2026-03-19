/**
 * CareConnect Centralized Theme
 *
 * To change the entire look of the app, edit ONLY this file.
 *
 * Colors are expressed as HSL channel strings (no "hsl()" wrapper)
 * so they can be used directly in CSS variables and Tailwind.
 *
 * Palette:
 *  Primary  – Soft Blue      (Trust / Healthcare)
 *  Secondary– Green          (Care / Safety)
 *  Accent   – Light Orange   (Human touch)
 */

export const theme = {
  // ─── Core palette ────────────────────────────────────────────────────────────
  primary:   "210 70% 50%",   // Soft Blue
  secondary: "145 60% 40%",   // Green
  accent:    "30 80% 60%",    // Light Orange / Warm Beige

  // ─── Foregrounds (text on top of each color) ─────────────────────────────────
  primaryForeground:   "0 0% 100%",
  secondaryForeground: "0 0% 100%",
  accentForeground:    "0 0% 100%",

  // ─── Backgrounds ─────────────────────────────────────────────────────────────
  background: "210 40% 98%",
  foreground:  "222 47% 11%",

  // ─── Card / Popover ──────────────────────────────────────────────────────────
  card:            "0 0% 100%",
  cardForeground:  "222 47% 11%",
  popover:         "0 0% 100%",
  popoverForeground: "222 47% 11%",

  // ─── Muted ───────────────────────────────────────────────────────────────────
  muted:           "210 40% 96%",
  mutedForeground: "215 16% 47%",

  // ─── Semantic ────────────────────────────────────────────────────────────────
  destructive:            "0 84% 60%",
  destructiveForeground:  "0 0% 100%",
  success:                "145 60% 36%",
  successForeground:      "0 0% 100%",
  warning:                "30 80% 60%",
  warningForeground:      "0 0% 100%",
  info:                   "210 70% 50%",
  infoForeground:         "0 0% 100%",

  // ─── Border / Input / Ring ───────────────────────────────────────────────────
  border: "214 32% 91%",
  input:  "214 32% 91%",
  ring:   "210 70% 50%",

  // ─── Radius ──────────────────────────────────────────────────────────────────
  radius: "0.25rem",

  // ─── Healthcare extras ───────────────────────────────────────────────────────
  healthcareLight: "210 70% 96%",
  healthcareDark:  "210 70% 20%",
  trustBadge:      "145 60% 36%",
  verified:        "145 60% 36%",
  pending:         "30 80% 60%",
  critical:        "0 84% 60%",

  // ─── Shadows ─────────────────────────────────────────────────────────────────
  shadowSm: "0 1px 2px 0 hsl(222 47% 11% / 0.05)",
  shadowMd: "0 4px 6px -1px hsl(222 47% 11% / 0.1), 0 2px 4px -2px hsl(222 47% 11% / 0.1)",
  shadowLg: "0 10px 15px -3px hsl(222 47% 11% / 0.1), 0 4px 6px -4px hsl(222 47% 11% / 0.1)",
  shadowXl: "0 20px 25px -5px hsl(222 47% 11% / 0.1), 0 8px 10px -6px hsl(222 47% 11% / 0.1)",

  // ─── Sidebar ─────────────────────────────────────────────────────────────────
  sidebarBackground:        "0 0% 98%",
  sidebarForeground:        "240 5.3% 26.1%",
  sidebarPrimary:           "210 70% 50%",
  sidebarPrimaryForeground: "0 0% 100%",
  sidebarAccent:            "210 70% 96%",
  sidebarAccentForeground:  "210 70% 20%",
  sidebarBorder:            "214 32% 91%",
  sidebarRing:              "210 70% 50%",

  // ─── Dark mode overrides ─────────────────────────────────────────────────────
  dark: {
    background:        "222 47% 6%",
    foreground:        "210 40% 98%",
    card:              "222 47% 8%",
    cardForeground:    "210 40% 98%",
    popover:           "222 47% 8%",
    popoverForeground: "210 40% 98%",
    secondary:         "145 60% 35%",
    muted:             "217 33% 17%",
    mutedForeground:   "215 20% 65%",
    destructive:       "0 63% 31%",
    destructiveForeground: "210 40% 98%",
    border:            "217 33% 17%",
    input:             "217 33% 17%",
    healthcareLight:   "210 70% 15%",
    healthcareDark:    "210 70% 80%",
    sidebarBackground: "222 47% 8%",
    sidebarForeground: "210 40% 98%",
    sidebarAccent:     "217 33% 17%",
    sidebarAccentForeground: "210 40% 98%",
    sidebarBorder:     "217 33% 17%",
  },
} as const;

// ─── Tailwind-friendly solid color classes ────────────────────────────────────
// Use these instead of bg-gradient-* anywhere you need a branded background.
export const tw = {
  /** Solid primary button / icon background */
  bgPrimary:   "bg-primary",
  /** Solid secondary button / icon background */
  bgSecondary: "bg-secondary",
  /** Solid accent button / icon background */
  bgAccent:    "bg-accent",
  /** Light primary tint for section backgrounds */
  bgPrimaryLight: "bg-[hsl(210_70%_96%)]",
  /** Light secondary tint */
  bgSecondaryLight: "bg-[hsl(145_60%_96%)]",
  /** Light accent tint */
  bgAccentLight: "bg-[hsl(30_80%_96%)]",
} as const;

/**
 * TunzaConnect Centralized Theme
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
export const tw = {
  bgPrimary:        "bg-primary",
  bgSecondary:      "bg-secondary",
  bgAccent:         "bg-accent",
  bgPrimaryLight:   "bg-[hsl(210_70%_96%)]",
  bgSecondaryLight: "bg-[hsl(145_60%_96%)]",
  bgAccentLight:    "bg-[hsl(30_80%_96%)]",
} as const;

// ─── Dashboard design tokens ──────────────────────────────────────────────────
// Stat card icon wells — use these instead of dynamic `bg-${color}/10` strings
// so Tailwind can statically detect and include the classes.
export const dashboardTokens = {
  iconWell: {
    primary:     "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center",
    secondary:   "h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center",
    accent:      "h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center",
    success:     "h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center",
    warning:     "h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center",
    destructive: "h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center",
  },
  /** Avatar initial fallback — replaces bg-gradient-primary / bg-gradient-to-br */
  avatar: "h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs",
  actionIconWell: {
    primary:   "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center",
    secondary: "h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center",
    accent:    "h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center",
    success:   "h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center",
  },
  statusBlock: {
    primary: "text-center p-4 rounded-lg bg-primary/10",
    success: "text-center p-4 rounded-lg bg-success/10",
  },
} as const;

// ─── Dashboard card / warm UI tokens ─────────────────────────────────────────────
// Blend of Modern Card-Based + Warm & Approachable for the authenticated app.
// Public pages keep the Clinical tokens above; dashboard uses these.
export const dashboardCard = {
  /** Base card — rounded, soft border */
  base: "rounded-xl border border-border/60 bg-card shadow-sm",
  /** Stat card content wrapper */
  statContent: "p-3 sm:p-4 md:p-5",
  /** Stat card icon well — scales with screen */
  iconWell: {
    primary:     "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",
    secondary:   "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0",
    accent:      "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0",
    success:     "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0",
    warning:     "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0",
    destructive: "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0",
  },
  /** Avatar initial fallback */
  avatar: "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0",
  /** List row item */
  listRow: "flex items-center justify-between p-2 sm:p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors",
  /** Mini card inside a grid */
  miniCard: "p-3 sm:p-4 rounded-xl border border-border/60 hover:border-primary/30 hover:shadow-md transition-all bg-card",
  /** Section background */
  sectionBg: "bg-muted/30",
  /** Quick action card */
  actionCard: "rounded-xl border border-border/60 bg-card hover:shadow-md hover:border-primary/30 transition-all cursor-pointer",
  actionIconWell: {
    primary:   "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center",
    secondary: "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-secondary/10 flex items-center justify-center",
    accent:    "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-accent/10 flex items-center justify-center",
    success:   "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-success/10 flex items-center justify-center",
  },
  /** Card header row */
  header: "flex flex-row items-center justify-between p-3 sm:p-4 md:p-5",
  /** Card body padding */
  body: "p-3 sm:p-4 md:p-5 pt-0",
  /** Responsive scrollable table wrapper */
  tableWrapper: "w-full overflow-x-auto",
  /** Minimum table width */
  tableMinWidth: "min-w-[480px] sm:min-w-[540px]",
  /** Table head cell */
  th: "whitespace-nowrap",
  /** Table body cell */
  td: "whitespace-nowrap",
  /** Table row */
  tr: "hover:bg-muted/40 transition-colors",

  // ─── Compact stat card ────────────────────────────────────────────────────────
  /** 2-col on mobile, 4-col on md — scales gap */
  compactStatGrid: "grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3",
  /** Compact card content row — scales padding */
  compactStatContent: "p-2 sm:p-3 md:p-4 flex items-center justify-between",
  /** Compact stat value — scales up */
  compactStatValue: "text-sm sm:text-base md:text-lg font-bold mt-0.5",
  /** Compact balance value — scales up */
  compactBalanceValue: "text-xs sm:text-sm md:text-base font-bold mt-0.5",
  /** Compact card header — scales padding */
  compactHeader: "p-2 sm:p-3 md:p-4",
  /** Compact header inner row — stacks on mobile, row on sm+ */
  compactHeaderRow: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full",
  /** Compact card body padding — scales */
  compactBody: "p-2 sm:p-3 md:p-4",
  /** Compact permission/list row — scales padding */
  compactRow: "flex items-center justify-between p-1.5 sm:p-2 md:p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors",
  /** Tight grid gap for dense lists — scales */
  tightGrid: "grid gap-1 sm:gap-1.5",
  /** Responsive select trigger */
  selectTriggerSm: "w-full sm:w-48",
  /** Balance stat block — scales padding */
  balanceBlockPrimary: "text-center p-1.5 sm:p-2 md:p-3 rounded-lg bg-primary/10",
  /** Balance stat block — success tint */
  balanceBlockSuccess: "text-center p-1.5 sm:p-2 md:p-3 rounded-lg bg-success/10",
  /** Balance stat block — warning tint */
  balanceBlockWarning: "text-center p-1.5 sm:p-2 md:p-3 rounded-lg bg-warning/10",
} as const;

// ─── Button tokens ───────────────────────────────────────────────────────────
export const btn = {
  /** Shared base — text, gap, icon scale across all sizes */
  base: "inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  /** Icon size inside buttons */
  icon: "[&_svg]:size-3.5 sm:[&_svg]:size-4",
  /** Text scale */
  text: "text-xs sm:text-sm",
  /** Size variants */
  size: {
    default: "h-8 sm:h-9 md:h-10 px-3 sm:px-4 py-1.5 sm:py-2",
    sm:      "h-7 sm:h-8 md:h-9 rounded-md px-2.5 sm:px-3",
    lg:      "h-9 sm:h-10 md:h-11 rounded-md px-5 sm:px-6 md:px-8",
    icon:    "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10",
  },
} as const;

// ─── Responsive layout & typography tokens ───────────────────────────────────
// Single source of truth for containment and fluid text across all pages.
export const responsive = {
  // Layout containment
  pageWrapper: "min-w-0 overflow-hidden",
  contentCol: "flex-1 flex flex-col min-w-0 overflow-hidden",
  main: "flex-1 min-w-0 overflow-x-hidden p-3 sm:p-4 md:p-6",

  // Page header — scales xs→sm→md→lg
  pageTitle: "font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold",
  pageSubtitle: "text-xs sm:text-sm text-muted-foreground mt-0.5",

  // Card text — scales xs→sm
  cardTitle: "text-xs sm:text-sm md:text-base font-semibold",
  cardDesc: "text-xs sm:text-sm text-muted-foreground",
  label: "text-xs sm:text-sm font-semibold text-muted-foreground",

  // Body text — scales xs→sm
  body: "text-xs sm:text-sm",
  bodyMuted: "text-xs sm:text-sm text-muted-foreground",

  // Stat value — scales sm→md→lg
  statValue: "text-sm sm:text-base md:text-lg lg:text-xl font-bold mt-0.5",

  // Dialog
  dialogTitle: "text-sm sm:text-base md:text-lg font-semibold",
  dialogDesc: "text-xs sm:text-sm text-muted-foreground",
} as const;

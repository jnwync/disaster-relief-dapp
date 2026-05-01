# ChainRelief Design Tokens: Color + Foundations

## Summary
- Inspected existing tokens in [frontend/src/app/globals.css](frontend/src/app/globals.css) and font setup in [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx).
- Current palette is OKLCH-based (good), but there are too many semantic accents and a purple "release" hue that conflicts with the "no purple/cyan" constraint.
- Proposed system keeps the current semantic token names to avoid breaking class usage, reduces accent count, and centers on ink neutrals + relief red + minimal gold.
- Light mode baseline with optional dark overrides, targeting WCAG AA for text and controls.

## Assumptions
- Platform is web + mobile; responsive behavior is required.
- OS is unknown; target modern browsers.
- Palette should cover donate/admin/audit flows and all components.
- Light mode is the default; dark mode is optional for later.

## Color System
### Brand and accent
- Ink (trust + legibility): deep blue for text and primary navigation.
- Relief red (action/urgency): primary CTA and high-importance moments.
- Signal gold (minimal luxury): sparing highlights for totals, milestones, and verified status.

### Neutrals
- Paper-to-slate neutrals tinted toward the ink hue to keep surfaces cohesive.
- Avoid pure white/black; use tinted off-whites and near-black ink.

### Semantic
- Success, warning, danger, info use separate hues but are restrained.
- Use red only for primary donation CTA and destructive actions (different tones).

## Token Structure
### Naming
- Palette scales: `--color-neutral-50..900`, `--color-ink-50..900`, `--color-relief-50..900`, `--color-gold-50..900`
- Semantic tokens (API stability): `--color-background`, `--color-foreground`, `--color-surface`, `--color-border`, `--color-primary`, `--color-muted`, etc.
- State tokens derive from palette: hover/active via `color-mix()`.

### Spacing
- 4pt scale with semantic names for rhythm.

### Typography
- Two-family system: display + body, with mono for addresses and hashes.
- Fixed rem scale for UI (no fluid type).

### Radii, Shadows, Motion
- Radii: small-to-large with a pill option.
- Shadows: soft, cool-tinted layers.
- Motion: restrained ease-out, with one signature rise-in.

## Token Table (Key Semantic Colors)
| Token | OKLCH | Use |
| --- | --- | --- |
| --color-background | oklch(98.8% 0.005 250) | App background |
| --color-surface | oklch(99.2% 0.004 250) | Cards, nav |
| --color-foreground | oklch(20% 0.05 248) | Primary text |
| --color-muted-foreground | oklch(50% 0.045 248) | Secondary text |
| --color-primary | oklch(54% 0.20 25) | Primary CTA (donate) |
| --color-primary-foreground | oklch(98% 0.01 25) | Text on primary |
| --color-accent | oklch(66% 0.12 85) | Highlights/badges |
| --color-success | oklch(52% 0.16 150) | Success states |
| --color-warning | oklch(58% 0.14 90) | Warnings |
| --color-danger | oklch(38% 0.18 25) | Destructive actions |
| --color-info | oklch(56% 0.14 238) | Informational |
| --color-border | oklch(94% 0.007 250) | Dividers/inputs |

## CSS Variables
```css
@theme {
  /* Neutrals */
  --color-neutral-50: oklch(98.8% 0.005 250);
  --color-neutral-100: oklch(97% 0.006 250);
  --color-neutral-200: oklch(94% 0.007 250);
  --color-neutral-300: oklch(90% 0.008 250);
  --color-neutral-400: oklch(84% 0.01 250);
  --color-neutral-500: oklch(72% 0.012 250);
  --color-neutral-600: oklch(60% 0.014 250);
  --color-neutral-700: oklch(46% 0.016 250);
  --color-neutral-800: oklch(32% 0.018 250);
  --color-neutral-900: oklch(22% 0.02 250);

  /* Ink */
  --color-ink-50: oklch(98% 0.008 248);
  --color-ink-100: oklch(95% 0.012 248);
  --color-ink-200: oklch(90% 0.02 248);
  --color-ink-300: oklch(84% 0.025 248);
  --color-ink-400: oklch(74% 0.035 248);
  --color-ink-500: oklch(62% 0.04 248);
  --color-ink-600: oklch(50% 0.045 248);
  --color-ink-700: oklch(38% 0.05 248);
  --color-ink-800: oklch(28% 0.05 248);
  --color-ink-900: oklch(20% 0.05 248);

  /* Relief red */
  --color-relief-50: oklch(97% 0.025 25);
  --color-relief-100: oklch(93% 0.05 25);
  --color-relief-200: oklch(86% 0.08 25);
  --color-relief-300: oklch(76% 0.12 25);
  --color-relief-400: oklch(64% 0.16 25);
  --color-relief-500: oklch(54% 0.20 25);
  --color-relief-600: oklch(46% 0.20 25);
  --color-relief-700: oklch(38% 0.18 25);
  --color-relief-800: oklch(30% 0.16 25);
  --color-relief-900: oklch(22% 0.14 25);

  /* Signal gold */
  --color-gold-50: oklch(97% 0.02 85);
  --color-gold-100: oklch(93% 0.04 85);
  --color-gold-200: oklch(86% 0.07 85);
  --color-gold-300: oklch(76% 0.10 85);
  --color-gold-400: oklch(66% 0.12 85);
  --color-gold-500: oklch(58% 0.12 85);
  --color-gold-600: oklch(48% 0.10 85);
  --color-gold-700: oklch(38% 0.08 85);
  --color-gold-800: oklch(30% 0.07 85);
  --color-gold-900: oklch(22% 0.05 85);

  /* Success */
  --color-success-50: oklch(96% 0.02 150);
  --color-success-100: oklch(90% 0.05 150);
  --color-success-200: oklch(82% 0.08 150);
  --color-success-300: oklch(72% 0.11 150);
  --color-success-400: oklch(62% 0.14 150);
  --color-success-500: oklch(52% 0.16 150);
  --color-success-600: oklch(44% 0.16 150);
  --color-success-700: oklch(36% 0.14 150);
  --color-success-800: oklch(28% 0.12 150);
  --color-success-900: oklch(22% 0.10 150);

  /* Warning */
  --color-warning-50: oklch(97% 0.025 90);
  --color-warning-100: oklch(93% 0.05 90);
  --color-warning-200: oklch(86% 0.08 90);
  --color-warning-300: oklch(76% 0.12 90);
  --color-warning-400: oklch(66% 0.14 90);
  --color-warning-500: oklch(58% 0.14 90);
  --color-warning-600: oklch(48% 0.12 90);
  --color-warning-700: oklch(38% 0.10 90);
  --color-warning-800: oklch(30% 0.08 90);
  --color-warning-900: oklch(22% 0.06 90);

  /* Info */
  --color-info-50: oklch(97% 0.02 238);
  --color-info-100: oklch(93% 0.04 238);
  --color-info-200: oklch(86% 0.07 238);
  --color-info-300: oklch(76% 0.10 238);
  --color-info-400: oklch(66% 0.12 238);
  --color-info-500: oklch(56% 0.14 238);
  --color-info-600: oklch(48% 0.14 238);
  --color-info-700: oklch(40% 0.12 238);
  --color-info-800: oklch(32% 0.10 238);
  --color-info-900: oklch(24% 0.08 238);

  /* Semantic tokens (keep current API) */
  --color-background: var(--color-neutral-50);
  --color-surface: oklch(99.2% 0.004 250);
  --color-surface-elevated: oklch(100% 0.003 250);
  --color-foreground: var(--color-ink-900);
  --color-muted: var(--color-neutral-100);
  --color-muted-foreground: var(--color-ink-600);
  --color-border: var(--color-neutral-200);

  --color-primary: var(--color-relief-500);
  --color-primary-foreground: oklch(98% 0.01 25);
  --color-accent: var(--color-gold-400);
  --color-accent-foreground: var(--color-ink-900);

  --color-success: var(--color-success-500);
  --color-success-foreground: oklch(98% 0.01 150);
  --color-warning: var(--color-warning-500);
  --color-warning-foreground: oklch(18% 0.03 90);
  --color-danger: var(--color-relief-700);
  --color-danger-foreground: oklch(98% 0.01 25);
  --color-info: var(--color-info-500);
  --color-info-foreground: oklch(98% 0.01 238);

  --color-ring: var(--color-primary);
  --color-link: var(--color-info-600);

  /* Spacing */
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-4xl: 6rem;

  /* Typography */
  --font-display: "Source Serif 4", "Iowan Old Style", "Palatino Linotype", serif;
  --font-sans: "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif;
  --font-mono: "JetBrains Mono", "SFMono-Regular", ui-monospace, monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-2xl: 1.875rem;
  --text-3xl: 2.25rem;

  --leading-tight: 1.15;
  --leading-snug: 1.3;
  --leading-normal: 1.55;
  --leading-relaxed: 1.7;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  --tracking-tight: -0.01em;
  --tracking-normal: 0;
  --tracking-wide: 0.04em;

  /* Radii */
  --radius-xs: 0.25rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-1: 0 1px 2px oklch(20% 0.02 248 / 0.08), 0 1px 0 oklch(100% 0 0 / 0.35);
  --shadow-2: 0 4px 12px oklch(20% 0.02 248 / 0.12), 0 1px 0 oklch(100% 0 0 / 0.25);
  --shadow-3: 0 12px 24px oklch(20% 0.02 248 / 0.16), 0 2px 0 oklch(100% 0 0 / 0.2);

  /* Motion */
  --motion-fast: 120ms;
  --motion-base: 180ms;
  --motion-slow: 260ms;
  --motion-slower: 420ms;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

  --animate-fade-in: fade-in var(--motion-base) var(--ease-out);
  --animate-rise-in: rise-in var(--motion-slow) var(--ease-out);

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes rise-in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
}

/* Optional dark mode */
@custom-variant dark (&:where(.dark, .dark *));

.dark {
  --color-background: oklch(14% 0.012 248);
  --color-surface: oklch(18% 0.014 248);
  --color-surface-elevated: oklch(22% 0.015 248);
  --color-foreground: oklch(96% 0.008 248);
  --color-muted: oklch(20% 0.012 248);
  --color-muted-foreground: oklch(72% 0.02 248);
  --color-border: oklch(26% 0.015 248);

  --color-primary: var(--color-relief-400);
  --color-primary-foreground: oklch(10% 0.02 25);
  --color-accent: var(--color-gold-300);
  --color-accent-foreground: oklch(12% 0.02 248);

  --color-success: var(--color-success-400);
  --color-warning: var(--color-warning-400);
  --color-danger: var(--color-relief-500);
  --color-info: var(--color-info-400);
  --color-ring: var(--color-primary);
  --color-link: var(--color-info-300);
}
```

## Usage Notes
- Buttons: use `--color-primary` for the donate CTA; reserve `--color-danger` for destructive actions only.
- Links and nav: default to ink text; use `--color-link` for emphasis without turning the UI red.
- Cards and panels: `--color-surface` + `--color-border`, with `--shadow-1` only where hierarchy needs it.
- Status badges/alerts: use 50/100 tint for background, 500 for text or icon; avoid multiple competing accents in the same view.
- Inputs: default border `--color-border`; focus ring `--color-ring`; invalid state `--color-danger` with icon and message.
- Data and audit views: keep ink + neutral dominant; use red only for exceptions and release-critical actions.
- Signature motion: apply `--animate-rise-in` to donation success and critical audit reveals; honor reduced-motion users.
- Typography: map UI body to `--font-sans`, headings to `--font-display`; keep addresses/hashes in `--font-mono`.
- If you keep Inter, set `--font-sans` to Inter and skip the display font; otherwise update the font loader in [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx).

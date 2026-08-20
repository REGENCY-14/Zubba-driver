// Dark-mode tokens for colors that live outside ThemeContext's shared `colors`
// object (src/context/ThemeContext.tsx) — because they belong to specific
// shared components (Button, StatusPill), not to every screen. Kept as a
// separate file so screens that don't use these components never need to
// import them. Light mode is never represented here: it lives only as the
// existing literals already in each component (COLORS.brandGreen,
// COLORS.statusSuccess, etc.) — see the `isDark ? SHARED_DARK.x : <existing>`
// convention at each call site.
//
// No premium/gold tokens: the "premium" Button variant exists in the type
// but is unused anywhere in this app, so there's no premium UI to theme.
export const SHARED_DARK = {
  // Solid accent green for small elements that shouldn't be translucent
  // (spinners, icons, filled indicators) — ported verbatim from the
  // customer app's AUTH_DARK/APP_DARK.accentGreen.
  accentGreen: '#60D96D',

  // Primary CTA buttons render as a translucent green in dark mode instead
  // of the solid brand green (#31973D) used in light mode — but the
  // translucent fill is the *brighter* accentGreen above, not the base
  // brand green at 50% alpha. The base green reads too dark/muddy at 50%
  // opacity on a near-black background; the customer app deliberately
  // brightens the hue for this one role, and every dark-mode CTA across
  // both apps should use this same rgba(96,217,109,0.5) value.
  buttonPrimaryBg: 'rgba(96,217,109,0.5)',

  // Bottom nav's active-tab pill — same translucent fill as buttonPrimaryBg
  // (kept as its own named token, matching the customer app's distinct
  // APP_DARK.navActivePillBg, since the two roles could diverge later even
  // though they share a value today).
  navActivePillBg: 'rgba(96,217,109,0.5)',

  // Several screens tint an icon pill / info banner with a light wash of
  // brand green (`${COLORS.brandGreen}1A` / `14`, i.e. ~8-10% alpha) —
  // tuned for a white background, so it reads as a muddy near-black smear
  // on a dark one. One shared, brighter-alpha token for that same role.
  brandTintBg: 'rgba(96,217,109,0.18)',

  // StatusPill: light-on-translucent-dark instead of the pastel-on-white
  // pills tuned for a light background. Kind names match StatusPill's
  // existing StatusKind so pending isn't misread as a warning/error state.
  statusSuccessBg: 'rgba(49,151,61,0.16)',
  statusSuccessText: '#4ADE80',
  statusPendingBg: 'rgba(148,163,184,0.16)',
  statusPendingText: '#94A3B8',
  statusFailedBg: 'rgba(239,68,68,0.16)',
  statusFailedText: '#F87171',
  statusFailedBorder: '#EF4444',

  // General destructive/error text (form validation errors, etc.) — kept
  // distinct from statusFailedText even though it's the same red, since
  // that one is scoped to StatusPill's `failed` kind specifically. Matches
  // the customer app's APP_DARK.statusErrorText.
  destructiveText: '#F87171',

  // Sign-out button (Settings / sidebar) — Figma node 5494-41901, ported
  // verbatim from the customer app's APP_DARK.signOut*. Solid near-black
  // fill (not a translucent red tint) with a muted/desaturated red border
  // and text, distinct from the brighter statusFailed red used elsewhere.
  signOutBg: '#0D0D0D',
  signOutBorder: '#DA565A',
  signOutText: '#DB0007',
} as const;

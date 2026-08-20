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
  // Primary CTA buttons: same brand green hue as light mode, translucent
  // instead of solid — the one treatment repeated for every primary button.
  buttonPrimaryBg: 'rgba(49,151,61,0.5)',

  // Several screens tint an icon pill / info banner with a light wash of
  // brand green (`${COLORS.brandGreen}1A` / `14`, i.e. ~8-10% alpha) —
  // tuned for a white background, so it reads as a muddy near-black smear
  // on a dark one. One shared, brighter-alpha token for that same role.
  brandTintBg: 'rgba(49,151,61,0.18)',

  // StatusPill: light-on-translucent-dark instead of the pastel-on-white
  // pills tuned for a light background. Kind names match StatusPill's
  // existing StatusKind so pending isn't misread as a warning/error state.
  statusSuccessBg: 'rgba(49,151,61,0.16)',
  statusSuccessText: '#4ADE80',
  statusPendingBg: 'rgba(148,163,184,0.16)',
  statusPendingText: '#94A3B8',
  statusFailedBg: 'rgba(239,68,68,0.16)',
  statusFailedText: '#F87171',
} as const;

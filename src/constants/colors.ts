// Brand/semantic hex values, centralized here for the driver app instead of being
// re-inlined at every call site (the customer app repeats these ~50+ times across
// screens — see DRIVER_APP_HANDOFF.md §2 "cross-cutting risks"). Values are ported
// verbatim from the customer app's live code, not invented. Do not add new colors
// here without flagging them as a proposed addition first (see spec non-goals).
export const COLORS = {
  brandGreen: '#31973D',
  destructiveRed: '#EF4444',
  destructiveChipBg: '#FFE2E2',
  premiumGoldBg: '#FFE088',
  premiumGoldText: '#735C00',
  medalGold: '#D4AF37',

  statusSuccess: '#31973D',
  statusPending: '#555E59',
  statusFailed: '#FF383C',

  paymentRail: {
    mtn: '#FFCC00',
    telecel: '#DC2626',
    // Airtel uses the theme's neutral surface/border, not a distinct fill —
    // its wordmark glyph is rendered in destructiveRed, matching the customer app.
    airtelGlyph: '#EF4444',
  },

  selectedRing: '#31973D',
} as const;

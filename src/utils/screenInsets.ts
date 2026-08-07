import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { moderateScale } from './scale';

/** Approximate height of the floating bottom nav pill (excluding safe area). */
export const BOTTOM_NAV_CONTENT_HEIGHT = moderateScale(72);

type ScrollBottomPaddingOptions = {
  /** Screens that render AppBottomNav over the scroll content. */
  withBottomNav?: boolean;
  extra?: number;
};

export function useScrollBottomPadding(options?: ScrollBottomPaddingOptions) {
  const insets = useSafeAreaInsets();
  const { withBottomNav = false, extra = moderateScale(24) } = options ?? {};

  if (withBottomNav) {
    return insets.bottom + BOTTOM_NAV_CONTENT_HEIGHT + moderateScale(16) + extra;
  }

  return insets.bottom + extra;
}

export function useBottomNavOffset() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, moderateScale(12));
}

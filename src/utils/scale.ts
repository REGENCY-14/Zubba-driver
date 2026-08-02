import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const [shortDimension, longDimension] = width < height ? [width, height] : [height, width];

// Standard ~5" phone baseline (same default react-native-size-matters ships with).
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

// react-native-size-matters scales linearly and unbounded off this baseline, so on
// large phones/phablets (~430px+ wide) the ratio runs well past 1.2x. When two
// related values (e.g. a container's height and its icon's size, or an absolutely
// positioned badge and the anchor it sits on) are scaled with different helpers
// (scale vs verticalScale vs moderateScale), they drift apart by different amounts
// as the ratio grows — which is what causes elements to overlap on bigger screens.
// Clamping the ratio keeps every helper's output close enough together that layouts
// stay consistent across device sizes instead of diverging at the extremes.
const MIN_RATIO = 0.85;
const MAX_RATIO = 1.15;

function clampRatio(ratio: number) {
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
}

const widthRatio = clampRatio(shortDimension / guidelineBaseWidth);
const heightRatio = clampRatio(longDimension / guidelineBaseHeight);

export function scale(size: number) {
  return widthRatio * size;
}

export function verticalScale(size: number) {
  return heightRatio * size;
}

export function moderateScale(size: number, factor = 0.5) {
  return size + (scale(size) - size) * factor;
}

export function moderateVerticalScale(size: number, factor = 0.5) {
  return size + (verticalScale(size) - size) * factor;
}

export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;
export const mvs = moderateVerticalScale;

import React from 'react';
import { Image, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  imageUri?: string | null;
  initials?: string;
  size?: number;
  ringColor?: string;
  pinColor?: string;
  highlighted?: boolean;
  onImageLoad?: () => void;
  onImageError?: () => void;
};

/**
 * Generic map pin (teardrop) with a circular profile photo inset near the
 * top, like the classic "Google Maps pin with an avatar" pattern. Built by
 * layering two `map-marker` glyphs (a colored ring + white fill) instead of
 * a plain colored dot, so it reads as a real map marker rather than a photo
 * bubble. Ported from Zubba's src/components/maps/AvatarPinMarker.tsx —
 * keep the two in sync.
 */
export function AvatarPinMarker({
  imageUri,
  initials = '?',
  size = 46,
  ringColor = '#31973D',
  pinColor = '#FFFFFF',
  highlighted = false,
  onImageLoad,
  onImageError,
}: Props) {
  const pinSize = highlighted ? size * 1.12 : size;
  const innerSize = pinSize - 4;
  const avatarSize = pinSize * 0.56;

  return (
    <View style={{ width: pinSize, height: pinSize, alignItems: 'center' }}>
      <MaterialCommunityIcons
        name="map-marker"
        size={pinSize}
        color={ringColor}
        style={{ position: 'absolute', top: 0 }}
      />
      <MaterialCommunityIcons
        name="map-marker"
        size={innerSize}
        color={pinColor}
        style={{ position: 'absolute', top: 2 }}
      />
      <View
        style={{
          position: 'absolute',
          top: pinSize * 0.13,
          marginLeft: -0.5,
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          overflow: 'hidden',
          backgroundColor: '#E5E7EB',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onLoad={onImageLoad}
            onError={onImageError}
          />
        ) : (
          <Text
            style={{
              fontWeight: '700',
              color: '#374151',
              fontSize: avatarSize * 0.4,
            }}
          >
            {initials}
          </Text>
        )}
      </View>
    </View>
  );
}

export function initialsFromName(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default AvatarPinMarker;

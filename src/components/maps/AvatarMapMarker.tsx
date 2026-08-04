import React, { useState } from 'react';
import { Marker } from 'react-native-maps';
import { AvatarPinMarker, initialsFromName } from './AvatarPinMarker';
import type { MapCoord } from './mapUtils';

type Props = {
  coordinate: MapCoord;
  avatarUrl?: string | null;
  name?: string | null;
  ringColor?: string;
  highlighted?: boolean;
  zIndex?: number;
  anchor?: { x: number; y: number };
  onPress?: () => void;
};

/**
 * Wraps react-native-maps' <Marker> so avatar images actually show up.
 * Markers are normally rendered with tracksViewChanges={false} for
 * performance, but that freezes the marker into a static bitmap on its very
 * first render — if the remote avatar <Image> hasn't finished loading by
 * then, it's baked in as permanently blank. This keeps tracksViewChanges
 * true only until the image actually finishes loading (or fails/has none),
 * then freezes it. Ported from Zubba's AvatarMapMarker.tsx — keep in sync.
 */
export function AvatarMapMarker({
  coordinate,
  avatarUrl,
  name,
  ringColor,
  highlighted,
  zIndex,
  anchor,
  onPress,
}: Props) {
  const [imageReady, setImageReady] = useState(!avatarUrl);

  return (
    <Marker
      coordinate={coordinate}
      anchor={anchor}
      tracksViewChanges={!imageReady}
      onPress={onPress}
      zIndex={zIndex}
    >
      <AvatarPinMarker
        imageUri={avatarUrl}
        initials={initialsFromName(name)}
        ringColor={ringColor}
        highlighted={highlighted}
        onImageLoad={() => setImageReady(true)}
        onImageError={() => setImageReady(true)}
      />
    </Marker>
  );
}

export default AvatarMapMarker;

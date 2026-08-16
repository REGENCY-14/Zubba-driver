import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import type { MapCoord } from './mapUtils';

export type DriverMapMarker = {
  id: string;
  coordinate: MapCoord;
  avatarUrl?: string | null;
  name?: string | null;
  selected?: boolean;
};

type Props = {
  pickupLocation?: MapCoord | null;
  /** @deprecated use pickupLocation */
  userLocation?: MapCoord | null;
  driverLocation?: MapCoord | null;
  driverMarkers?: DriverMapMarker[];
  onDriverMarkerPress?: (id: string) => void;
  routeCoordinates?: MapCoord[];
  centerOn?: MapCoord | null;
  fitToLocations?: MapCoord[];
  style?: object;
  children?: React.ReactNode;
  locked?: boolean;
  pickupAvatarUrl?: string | null;
  pickupName?: string | null;
  driverAvatarUrl?: string | null;
  driverName?: string | null;
};

/**
 * Web stand-in for LiveMapView. react-native-maps has no web support (its
 * native specs don't even bundle under react-native-web), so Metro's
 * platform extension resolution picks this file instead of LiveMapView.tsx
 * for web builds. Web is a dev convenience only, not a shipped target for
 * this app, so this renders a static placeholder rather than a real map.
 */
export function LiveMapView({ pickupName, driverName, children, style }: Props) {
  const { colors } = useTheme();
  const caption = [pickupName, driverName].filter(Boolean).join(' → ');

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      <View style={styles.placeholder}>
        <MaterialCommunityIcons name="map-marker-radius-outline" size={40} color={colors.textSub} />
        <Text style={[styles.text, { color: colors.textSub }]}>
          Map preview isn't available on web.{'\n'}Open this screen in Expo Go to see the live map.
        </Text>
        {!!caption && <Text style={[styles.caption, { color: colors.text }]}>{caption}</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  text: { textAlign: 'center', fontSize: 13, lineHeight: 18 },
  caption: { textAlign: 'center', fontSize: 13, fontWeight: '600', marginTop: 4 },
});

export default LiveMapView;

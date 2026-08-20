import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Polyline, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';

import { useTheme } from '../../context/ThemeContext';
import {
  DEFAULT_MAP_REGION,
  MAP_DARK_STYLE,
  MAP_EDGE_PADDING,
  getMapTileUrl,
  regionForCoord,
  regionForCoords,
  type MapCoord,
} from './mapUtils';
import { useOsmTiles } from '../../hooks/useRoutePolyline';
import { AvatarMapMarker } from './AvatarMapMarker';
import { SHARED_DARK } from '../../constants/darkTheme';

const PIN_ANCHOR = { x: 0.5, y: 0.95 };

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
  /** Every candidate driver to plot at once, e.g. while browsing a driver list. */
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

// Ported from Zubba's src/components/maps/LiveMapView.tsx — keep in sync.
export function LiveMapView({
  pickupLocation,
  userLocation,
  driverLocation,
  driverMarkers,
  onDriverMarkerPress,
  routeCoordinates = [],
  centerOn,
  fitToLocations,
  style,
  children,
  locked = false,
  pickupAvatarUrl,
  pickupName,
  driverAvatarUrl,
  driverName,
}: Props) {
  const { isDark, colors } = useTheme();
  // Brand green renders muddy against a darkened map/tile overlay — same
  // brightened accent used for every other filled/solid green element.
  const mapAccent = isDark ? SHARED_DARK.accentGreen : '#31973D';
  const unselectedRing = isDark ? colors.border : '#1F2A33';
  const useOsm = useOsmTiles();
  const mapRef = useRef<MapView>(null);
  const pickup = pickupLocation ?? userLocation ?? null;

  const mapRegion = useMemo(() => {
    if (centerOn) return regionForCoord(centerOn);

    const points = fitToLocations?.filter(Boolean) as MapCoord[] | undefined;
    if (points?.length) {
      if (points.length === 1) return regionForCoord(points[0]);
      return regionForCoords(points);
    }

    if (pickup) return regionForCoord(pickup);
    if (driverLocation) return regionForCoord(driverLocation);
    return DEFAULT_MAP_REGION;
  }, [
    centerOn?.latitude,
    centerOn?.longitude,
    driverLocation?.latitude,
    driverLocation?.longitude,
    fitToLocations?.[0]?.latitude,
    fitToLocations?.[0]?.longitude,
    fitToLocations?.[1]?.latitude,
    fitToLocations?.[1]?.longitude,
    fitToLocations?.length,
    pickup?.latitude,
    pickup?.longitude,
  ]);

  useEffect(() => {
    if (!centerOn || !mapRef.current) return;
    mapRef.current.animateToRegion(regionForCoord(centerOn), 600);
  }, [centerOn?.latitude, centerOn?.longitude]);

  useEffect(() => {
    const points = fitToLocations?.filter(Boolean) as MapCoord[] | undefined;
    if (!points?.length || !mapRef.current) return;

    if (points.length === 1) {
      mapRef.current.animateToRegion(regionForCoord(points[0]), 600);
      return;
    }

    mapRef.current.fitToCoordinates(points, {
      edgePadding: MAP_EDGE_PADDING,
      animated: true,
    });
  }, [fitToLocations?.[0]?.latitude, fitToLocations?.[0]?.longitude, fitToLocations?.[1]?.latitude, fitToLocations?.[1]?.longitude, fitToLocations?.length]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={mapRegion}
        region={mapRegion}
        customMapStyle={isDark && !useOsm ? MAP_DARK_STYLE : undefined}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        showsUserLocation={false}
        showsMyLocationButton={false}
        rotateEnabled={!locked && false}
        scrollEnabled={!locked}
        zoomEnabled={!locked}
        pitchEnabled={!locked}
        // A fresh MapView (e.g. mounting on a newly navigated-to screen)
        // otherwise flashes a blank/grey surface while it initializes and
        // tiles load. Painting it with the app's own background instead
        // makes that cold-start invisible instead of reading as a "blink".
        loadingEnabled
        loadingIndicatorColor={mapAccent}
        loadingBackgroundColor={colors.bg}
      >
        {useOsm && (
          <UrlTile
            key={isDark ? 'dark' : 'light'}
            urlTemplate={getMapTileUrl(isDark)}
            maximumZ={19}
            flipY={Platform.OS === 'ios'}
            opacity={isDark ? 0.65 : 1}
          />
        )}

        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={mapAccent}
            strokeWidth={4}
          />
        )}

        {pickup && (
          <AvatarMapMarker
            coordinate={pickup}
            anchor={PIN_ANCHOR}
            avatarUrl={pickupAvatarUrl}
            name={pickupName ?? 'Customer'}
            ringColor={mapAccent}
          />
        )}

        {driverMarkers?.map((marker) => (
          <AvatarMapMarker
            key={marker.id}
            coordinate={marker.coordinate}
            anchor={PIN_ANCHOR}
            onPress={() => onDriverMarkerPress?.(marker.id)}
            zIndex={marker.selected ? 10 : 1}
            avatarUrl={marker.avatarUrl}
            name={marker.name ?? 'DR'}
            ringColor={marker.selected ? mapAccent : unselectedRing}
            highlighted={marker.selected}
          />
        ))}

        {driverLocation && (
          <AvatarMapMarker
            coordinate={driverLocation}
            anchor={PIN_ANCHOR}
            avatarUrl={driverAvatarUrl}
            name={driverName ?? 'You'}
            ringColor={mapAccent}
          />
        )}
      </MapView>

      {isDark && useOsm && <View pointerEvents="none" style={styles.darkOverlay} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 20, 30, 0.25)',
  },
});

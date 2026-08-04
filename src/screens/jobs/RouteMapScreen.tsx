import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { LiveMapView } from '../../components/maps/LiveMapView';
import { formatDistance, formatEta } from '../../components/maps/mapUtils';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { useRoutePolyline } from '../../hooks/useRoutePolyline';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { driverService } from '../../api/driverService';
import { toJob, Job } from '../../utils/jobMapping';
import { callCustomer, messageCustomer } from '../../utils/contactCustomer';
import { handleApiError } from '../../utils/handleApiError';
import type { RootStackScreenProps } from '../../navigation/types';

export function RouteMapScreen({ navigation, route }: RootStackScreenProps<'RouteMap'>) {
  const { jobId } = route.params;
  const { colors } = useTheme();
  const [job, setJob] = useState<Job | null>(null);
  const { coords: driverCoords } = useCurrentLocation({ watch: true });

  useEffect(() => {
    driverService
      .getRequestById(jobId)
      .then((res) => setJob(toJob(res.data)))
      .catch((err) => handleApiError(err));
  }, [jobId]);

  const customerCoord = job?.pickupLocation ?? null;
  const routeInfo = useRoutePolyline(driverCoords, customerCoord);

  const distanceLabel = routeInfo.distanceMeters != null ? formatDistance(routeInfo.distanceMeters) : '—';
  const etaLabel = routeInfo.durationSeconds != null ? formatEta(routeInfo.durationSeconds) : '—';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LiveMapView
        driverLocation={driverCoords}
        pickupLocation={customerCoord}
        pickupName={job?.customerName}
        routeCoordinates={routeInfo.coordinates}
        fitToLocations={driverCoords && customerCoord ? [driverCoords, customerCoord] : undefined}
      >
        <ScreenHeader
          title="Route"
          onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
          horizontalPadding={20}
        />
      </LiveMapView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: moderateScale(16) }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: moderateScale(2) }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(14), color: colors.text }}>
                {job?.customerName ?? 'Customer'}
              </Text>
              <Text
                style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}
                numberOfLines={1}
              >
                {job?.pickupAddress ?? ''}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(14), color: COLORS.brandGreen }}>
                {distanceLabel}
              </Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textSub }}>
                {etaLabel} away
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: moderateScale(12), marginTop: moderateScale(14) }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Call"
                variant="secondary"
                leftIcon={<MaterialCommunityIcons name="phone-outline" size={moderateScale(16)} color={colors.text} />}
                onPress={() => callCustomer(job?.customerPhone)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Message"
                variant="secondary"
                leftIcon={<MaterialCommunityIcons name="message-outline" size={moderateScale(16)} color={colors.text} />}
                onPress={() => messageCustomer(job?.customerPhone)}
              />
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}

export default RouteMapScreen;

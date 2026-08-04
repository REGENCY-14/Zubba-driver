import { useEffect, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';

// 20s response countdown — auto-declines at zero, same as a real dispatch
// timeout would.
const COUNTDOWN_SECONDS = 20;

export interface IncomingJobRequest {
  id: string;
  customerName: string;
  pickupAddress: string;
  distanceKm: number;
  etaMinutes: number;
  estimatedPay: number;
  bagsEstimate: number;
}

interface IncomingRequestModalProps {
  request: IncomingJobRequest | null;
  onRespond: (response: 'accept' | 'decline') => void;
}

export function IncomingRequestModal({ request, onRespond }: IncomingRequestModalProps) {
  const { colors } = useTheme();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (request) setSecondsLeft(COUNTDOWN_SECONDS);
  }, [request]);

  useEffect(() => {
    if (!request) return;
    if (secondsLeft <= 0) {
      onRespond('decline');
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [request, secondsLeft, onRespond]);

  if (!request) return null;

  const urgent = secondsLeft <= 5;

  return (
    <Modal transparent animationType="slide" statusBarTranslucent visible={!!request}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: moderateScale(32),
            borderTopRightRadius: moderateScale(32),
            padding: moderateScale(24),
            gap: moderateScale(16),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(18), color: colors.text }}>
              New job request
            </Text>
            <View
              accessibilityLabel={`${secondsLeft} seconds left to respond`}
              style={{
                width: moderateScale(36),
                height: moderateScale(36),
                borderRadius: moderateScale(18),
                borderWidth: 2,
                borderColor: urgent ? '#FF383C' : COLORS.brandGreen,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins_700Bold',
                  fontSize: moderateScale(13),
                  color: urgent ? '#FF383C' : COLORS.brandGreen,
                }}
              >
                {secondsLeft}
              </Text>
            </View>
          </View>

          <View style={{ gap: moderateScale(8) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(8) }}>
              <MaterialCommunityIcons name="account-circle-outline" size={moderateScale(18)} color={colors.textSub} />
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(14), color: colors.text }}>
                {request.customerName}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(8) }}>
              <MaterialCommunityIcons name="map-marker-outline" size={moderateScale(18)} color={colors.textSub} />
              <Text
                style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub, flex: 1 }}
              >
                {request.pickupAddress}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: moderateScale(4) }}>
              <View>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textMuted }}>
                  Distance
                </Text>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(14), color: colors.text }}>
                  {request.distanceKm} km • {request.etaMinutes} min
                </Text>
              </View>
              <View>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textMuted }}>
                  Est. bags
                </Text>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(14), color: colors.text }}>
                  {request.bagsEstimate}
                </Text>
              </View>
              <View>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textMuted }}>
                  Est. pay
                </Text>
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(14), color: COLORS.brandGreen }}>
                  GHS {request.estimatedPay.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
            <View style={{ flex: 1 }}>
              <Button label="Decline" variant="secondary" size="lg" onPress={() => onRespond('decline')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Accept" variant="primary" size="lg" onPress={() => onRespond('accept')} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

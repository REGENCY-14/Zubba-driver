import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';

interface MockMapViewProps {
  distanceKm: number;
  etaMinutes: number;
  height?: number;
}

// Stylized, hand-drawn map — not react-native-maps. No API keys, works on every
// platform including web (unlike react-native-maps, which the customer app itself
// has to stub out for web builds). Shows where the customer is relative to the
// driver without needing a real map SDK, per the mock-only scope of this build.
export function MockMapView({ distanceKm, etaMinutes, height = 200 }: MockMapViewProps) {
  const { colors, isDark } = useTheme();
  const mapBg = isDark ? '#16202E' : '#E8EEF1';
  const roadColor = isDark ? '#2A3A4C' : '#FFFFFF';

  return (
    <View
      style={{
        height: moderateScale(height),
        borderRadius: moderateScale(20),
        backgroundColor: mapBg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      {/* faux road grid */}
      <View style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: moderateScale(9), backgroundColor: roadColor }} />
      <View style={{ position: 'absolute', top: '68%', left: 0, right: 0, height: moderateScale(7), backgroundColor: roadColor }} />
      <View style={{ position: 'absolute', left: '22%', top: 0, bottom: 0, width: moderateScale(7), backgroundColor: roadColor }} />
      <View style={{ position: 'absolute', left: '78%', top: 0, bottom: 0, width: moderateScale(9), backgroundColor: roadColor }} />

      {/* route line between the two pins */}
      <View
        style={{
          position: 'absolute',
          left: '24%',
          top: '38%',
          width: '46%',
          height: moderateScale(3),
          backgroundColor: COLORS.brandGreen,
          borderRadius: 2,
          transform: [{ rotate: '16deg' }],
        }}
      />

      {/* customer pin */}
      <View style={{ position: 'absolute', left: '16%', top: '24%', alignItems: 'center' }}>
        <View
          style={{
            width: moderateScale(32),
            height: moderateScale(32),
            borderRadius: moderateScale(16),
            backgroundColor: '#101828',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
        >
          <MaterialCommunityIcons name="home-map-marker" size={moderateScale(18)} color="#FFFFFF" />
        </View>
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(9), color: colors.text, marginTop: moderateScale(2) }}>
          Customer
        </Text>
      </View>

      {/* driver pin */}
      <View style={{ position: 'absolute', right: '18%', bottom: '20%', alignItems: 'center' }}>
        <View
          style={{
            width: moderateScale(32),
            height: moderateScale(32),
            borderRadius: moderateScale(16),
            backgroundColor: COLORS.brandGreen,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
        >
          <MaterialCommunityIcons name="moped" size={moderateScale(18)} color="#FFFFFF" />
        </View>
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(9), color: colors.text, marginTop: moderateScale(2) }}>
          You
        </Text>
      </View>

      {/* distance/ETA badge */}
      <View
        style={{
          position: 'absolute',
          bottom: moderateScale(10),
          left: moderateScale(10),
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(6),
          backgroundColor: colors.card,
          paddingHorizontal: moderateScale(10),
          paddingVertical: moderateScale(6),
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <MaterialCommunityIcons name="map-marker-distance" size={moderateScale(14)} color={COLORS.brandGreen} />
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(11), color: colors.text }}>
          {distanceKm} km • {etaMinutes} min
        </Text>
      </View>
    </View>
  );
}

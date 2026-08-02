import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { moderateScale } from '../../utils/scale';
import { setApplicationStatus } from '../../slices/driverProfile/driverProfileSlice';
import { simulateApplicationDecision } from '../../services/mock/kycMock';
import type { RootState } from '../../store';
import type { RootStackScreenProps } from '../../navigation/types';

export function ApplicationStatusScreen({ navigation }: RootStackScreenProps<'ApplicationStatus'>) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { applicationStatus, rejectionReason } = useSelector((state: RootState) => state.driverProfile);

  const handleSimulate = async (outcome: 'approved' | 'rejected') => {
    const reason =
      outcome === 'rejected'
        ? 'Your Ghana Card photo was blurry — please re-upload a clearer image.'
        : undefined;
    const result = await simulateApplicationDecision(outcome, reason);
    dispatch(setApplicationStatus({ status: result.applicationStatus, reason: result.reason ?? null }));
  };

  if (applicationStatus === 'approved') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          padding: moderateScale(24),
          alignItems: 'center',
          justifyContent: 'center',
          gap: moderateScale(16),
        }}
      >
        <MaterialCommunityIcons name="check-decagram" size={moderateScale(64)} color="#31973D" />
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontSize: moderateScale(20),
            color: colors.text,
            textAlign: 'center',
          }}
        >
          You're approved!
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(13),
            color: colors.textSub,
            textAlign: 'center',
          }}
        >
          You can now go online and start accepting jobs.
        </Text>
        <Button
          label="Continue"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
        />
      </View>
    );
  }

  if (applicationStatus === 'rejected') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          padding: moderateScale(24),
          alignItems: 'center',
          justifyContent: 'center',
          gap: moderateScale(16),
        }}
      >
        <MaterialCommunityIcons name="close-circle-outline" size={moderateScale(64)} color="#FF383C" />
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontSize: moderateScale(20),
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Application not approved
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(13),
            color: colors.textSub,
            textAlign: 'center',
          }}
        >
          {rejectionReason ?? 'Please review your documents and re-apply.'}
        </Text>
        <Button
          label="Re-apply"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Kyc' }] })}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        padding: moderateScale(24),
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateScale(16),
      }}
    >
      <MaterialCommunityIcons name="clock-outline" size={moderateScale(64)} color="#555E59" />
      <Text
        style={{
          fontFamily: 'Poppins_700Bold',
          fontSize: moderateScale(20),
          color: colors.text,
          textAlign: 'center',
        }}
      >
        Application under review
      </Text>
      <Text
        style={{
          fontFamily: 'Poppins_400Regular',
          fontSize: moderateScale(13),
          color: colors.textSub,
          textAlign: 'center',
        }}
      >
        We're verifying your documents. This usually takes 24-48 hours.
      </Text>

      <View style={{ marginTop: moderateScale(24), gap: moderateScale(8), width: '100%' }}>
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(11),
            color: colors.textMuted,
            textAlign: 'center',
          }}
        >
          Demo only — simulates the backend's decision
        </Text>
        <Button label="Simulate: Approve" variant="secondary" onPress={() => handleSimulate('approved')} />
        <Button label="Simulate: Reject" variant="secondary" onPress={() => handleSimulate('rejected')} />
      </View>
    </View>
  );
}

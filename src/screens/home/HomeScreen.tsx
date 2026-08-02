import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { AppBottomNav } from '../../components/AppBottomNav';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { setMatchingMode, setOnline } from '../../slices/driverStatus/driverStatusSlice';
import { toggleSidebar } from '../../slices/ui/uiSlice';
import { getTodayEarningsSummary, TodayEarningsSummary } from '../../services/mock/earningsMock';
import { getIncomingJobRequest, respondToJobRequest, IncomingJobRequest } from '../../services/mock/jobsMock';
import { getMyDriverPublicProfile, DriverPublicProfile } from '../../services/mock/driverPublicProfileMock';
import { IncomingRequestModal } from './IncomingRequestModal';
import type { RootState } from '../../store';
import type { RootStackScreenProps } from '../../navigation/types';

export function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { isOnline, matchingMode } = useSelector((state: RootState) => state.driverStatus);

  const [earnings, setEarnings] = useState<TodayEarningsSummary | null>(null);
  const [publicProfile, setPublicProfile] = useState<DriverPublicProfile | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<IncomingJobRequest | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    getTodayEarningsSummary().then(setEarnings);
  }, []);

  useEffect(() => {
    if (isOnline && matchingMode === 'customer_selects' && !publicProfile) {
      getMyDriverPublicProfile().then(setPublicProfile);
    }
  }, [isOnline, matchingMode, publicProfile]);

  const handleToggleOnline = (next: boolean) => {
    dispatch(setOnline(next));
    if (!next) setIncomingRequest(null);
  };

  const handleSimulateIncoming = async () => {
    setRequestLoading(true);
    const request = await getIncomingJobRequest();
    setRequestLoading(false);
    setIncomingRequest(request);
  };

  const handleRespond = async (response: 'accept' | 'decline') => {
    if (!incomingRequest) return;
    const currentId = incomingRequest.id;
    setIncomingRequest(null);
    await respondToJobRequest(currentId, response);
  };

  const initials = user
    ? (`${user.firstname?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase() || 'ZB')
    : 'ZB';
  const firstName = user?.firstname || 'Driver';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader onMenuPress={() => dispatch(toggleSidebar())} horizontalPadding={20} />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(20), gap: moderateScale(16), paddingBottom: moderateScale(140) }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
              Welcome back,
            </Text>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(20), color: colors.text }}>
              {firstName}
            </Text>
          </View>
          <View
            style={{
              width: moderateScale(48),
              height: moderateScale(48),
              borderRadius: moderateScale(24),
              backgroundColor: COLORS.brandGreen,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(16), color: '#FFFFFF' }}>
              {initials}
            </Text>
          </View>
        </View>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(10) }}>
              <View
                style={{
                  width: moderateScale(10),
                  height: moderateScale(10),
                  borderRadius: moderateScale(5),
                  backgroundColor: isOnline ? COLORS.brandGreen : colors.textMuted,
                }}
              />
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(15), color: colors.text }}>
                {isOnline ? "You're online" : "You're offline"}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: colors.border, true: COLORS.brandGreen }}
              thumbColor="#FFFFFF"
              accessibilityLabel={isOnline ? 'Go offline' : 'Go online'}
            />
          </View>
        </Card>

        {!isOnline ? (
          <Card>
            <EmptyState
              icon={
                <MaterialCommunityIcons
                  name="power-plug-off-outline"
                  size={moderateScale(40)}
                  color={colors.textSub}
                />
              }
              title="You're offline"
              subtitle="Go online to start receiving job requests."
            />
          </Card>
        ) : (
          <>
            <Card>
              <Text
                style={{
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: moderateScale(14),
                  color: colors.text,
                  marginBottom: moderateScale(12),
                }}
              >
                Today's earnings
              </Text>
              {earnings ? (
                <View>
                  <Text
                    style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: COLORS.brandGreen }}
                  >
                    GHS {earnings.totalGHS.toFixed(2)}
                  </Text>
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
                    {earnings.completedJobs} jobs • {earnings.bagsCollected} bags
                  </Text>
                </View>
              ) : (
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
                  Loading…
                </Text>
              )}
            </Card>

            <View style={{ flexDirection: 'row', gap: moderateScale(8) }}>
              <Pressable
                onPress={() => dispatch(setMatchingMode('broadcast'))}
                accessibilityRole="button"
                accessibilityState={{ selected: matchingMode === 'broadcast' }}
                style={{
                  flex: 1,
                  minHeight: moderateScale(44),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: moderateScale(12),
                  backgroundColor: matchingMode === 'broadcast' ? COLORS.brandGreen : colors.surface,
                  borderWidth: 1,
                  borderColor: matchingMode === 'broadcast' ? COLORS.brandGreen : colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: moderateScale(12),
                    color: matchingMode === 'broadcast' ? '#FFFFFF' : colors.text,
                  }}
                >
                  Auto-assign
                </Text>
              </Pressable>
              <Pressable
                onPress={() => dispatch(setMatchingMode('customer_selects'))}
                accessibilityRole="button"
                accessibilityState={{ selected: matchingMode === 'customer_selects' }}
                style={{
                  flex: 1,
                  minHeight: moderateScale(44),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: moderateScale(12),
                  backgroundColor: matchingMode === 'customer_selects' ? COLORS.brandGreen : colors.surface,
                  borderWidth: 1,
                  borderColor: matchingMode === 'customer_selects' ? COLORS.brandGreen : colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: moderateScale(12),
                    color: matchingMode === 'customer_selects' ? '#FFFFFF' : colors.text,
                  }}
                >
                  Customer selects
                </Text>
              </Pressable>
            </View>

            {matchingMode === 'broadcast' ? (
              <Card>
                <View style={{ gap: moderateScale(12), alignItems: 'center' }}>
                  <MaterialCommunityIcons name="radar" size={moderateScale(36)} color={COLORS.brandGreen} />
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(14), color: colors.text }}>
                    Waiting for job requests
                  </Text>
                  <Button
                    label="Simulate incoming request"
                    variant="secondary"
                    onPress={handleSimulateIncoming}
                    loading={requestLoading}
                  />
                </View>
              </Card>
            ) : (
              <Card>
                <Text
                  style={{
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: moderateScale(14),
                    color: colors.text,
                    marginBottom: moderateScale(12),
                  }}
                >
                  How customers see you
                </Text>
                {publicProfile ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) }}>
                    <View
                      style={{
                        width: moderateScale(48),
                        height: moderateScale(48),
                        borderRadius: moderateScale(24),
                        backgroundColor: COLORS.brandGreen,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(16), color: '#FFFFFF' }}>
                        {initials}
                      </Text>
                    </View>
                    <View style={{ flex: 1, gap: moderateScale(2) }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(6) }}>
                        <Text
                          style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(14), color: colors.text }}
                        >
                          {firstName} {user?.lastname ?? ''}
                        </Text>
                        {publicProfile.isPremium && (
                          <View
                            style={{
                              paddingHorizontal: moderateScale(6),
                              paddingVertical: moderateScale(2),
                              borderRadius: 9999,
                              backgroundColor: COLORS.premiumGoldBg,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: 'Poppins_600SemiBold',
                                fontSize: moderateScale(9),
                                color: COLORS.premiumGoldText,
                              }}
                            >
                              PREMIUM
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
                        {publicProfile.code} • {publicProfile.distanceKm}km • {publicProfile.etaMinutes} min away
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(4) }}>
                        <MaterialCommunityIcons name="star" size={moderateScale(13)} color="#FEC002" />
                        <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(12), color: colors.text }}>
                          {publicProfile.rating.toFixed(1)} ({publicProfile.ratingCount})
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
                    Loading…
                  </Text>
                )}
                <Text
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: moderateScale(11),
                    color: colors.textMuted,
                    marginTop: moderateScale(10),
                  }}
                >
                  This is what nearby premium customers see when choosing a driver.
                </Text>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <IncomingRequestModal request={incomingRequest} onRespond={handleRespond} />

      <AppBottomNav activeTab="home" navigation={navigation} />
    </View>
  );
}

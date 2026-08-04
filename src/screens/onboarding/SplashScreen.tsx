import { useEffect, useRef } from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { moderateScale } from '../../utils/scale';
import { resolveInitialRoute } from '../../utils/resolveInitialRoute';
import type { RootStackScreenProps } from '../../navigation/types';

const icon = require('../../../assets/ic_launcher.png');

export function SplashScreen({ navigation }: RootStackScreenProps<'Splash'>) {
  const { colors } = useTheme();
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;

    resolveInitialRoute()
      .then((route) => {
        navigation.reset({ index: 0, routes: [{ name: route }] });
      })
      .catch(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={icon}
        resizeMode="contain"
        style={{ width: moderateScale(140), height: moderateScale(140), borderRadius: moderateScale(28) }}
      />
    </View>
  );
}

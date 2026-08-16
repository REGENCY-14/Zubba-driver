import { Asset } from 'expo-asset';
import { useEffect, useRef, useState } from 'react';
import { Image, View, useWindowDimensions } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { resolveInitialRoute } from '../../utils/resolveInitialRoute';
import type { RootStackScreenProps } from '../../navigation/types';

const zubbaLogo = require('../../../assets/zubba-icon-white.png');
const splashScreenLayer = require('../../../assets/splash-screen-layer.png');

const MIN_SPLASH_MS = 1800;

export function SplashScreen({ navigation }: RootStackScreenProps<'Splash'>) {
  const { width, height } = useWindowDimensions();
  const [ready, setReady] = useState(false);
  const resolvedRef = useRef(false);

  const logoSize = Math.min(Math.max(width * 0.55, 180), 320);

  useEffect(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;

    let mounted = true;

    const bootstrap = async () => {
      const assetsPromise = Asset.loadAsync([zubbaLogo, splashScreenLayer]).then(() => {
        if (mounted) setReady(true);
      });

      try {
        const [route] = await Promise.all([
          resolveInitialRoute(),
          assetsPromise,
          new Promise<void>((resolve) => setTimeout(resolve, MIN_SPLASH_MS)),
        ]);

        if (!mounted) return;

        navigation.reset({ index: 0, routes: [{ name: route }] });
      } catch {
        if (!mounted) return;

        await assetsPromise;
        navigation.reset({
          index: 0,
          routes: [{ name: 'OnboardLocationAccess' }],
        });
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [navigation]);

  if (!ready) {
    return (
      <ScreenShell backgroundColor="#2EA043">
        <View style={{ flex: 1 }} />
      </ScreenShell>
    );
  }

  return (
    <View style={{ backgroundColor:"#2EA043", flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: height * 0.4,
        }}
      >
        <Image
          source={splashScreenLayer}
          resizeMode="cover"
          style={{ width: '100%', height: '100%', opacity: 0.75 }}
        />
      </View>

      <Image
        source={zubbaLogo}
        resizeMode="contain"
        style={{
          width: logoSize,
          height: logoSize,
          transform: [{ scaleY: 0.92 }],
        }}
      />
    </View>
  );
}

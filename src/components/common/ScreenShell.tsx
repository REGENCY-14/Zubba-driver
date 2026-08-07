import type { ReactNode } from 'react';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';

type ScreenShellProps = {
  children: ReactNode;
  edges?: Edge[];
  backgroundColor?: string;
};

export function ScreenShell({
  children,
  edges = ['top', 'left', 'right', 'bottom'],
  backgroundColor,
}: ScreenShellProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: backgroundColor ?? colors.bg }}
    >
      {children}
    </SafeAreaView>
  );
}

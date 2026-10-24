import { BRAND_FONT } from '@/hooks/useFontFamily';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
}

// The El3amer mark: the name with a leaf on an orange tile (assets/images/logo.png,
// drawn by the same script as the app icon).
export const Logo: React.FC<LogoProps> = ({ size = 48, withWordmark = false }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={[styles.badge, { width: size, height: size, shadowColor: theme.primary[700] }]}
        accessibilityLabel="El3amer"
      />
      {withWordmark && (
        <Text
          style={[
            styles.wordmark,
            { color: theme.text.primary, fontSize: size * 0.5 },
          ]}
        >
          el3amer
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },
  wordmark: {
    fontFamily: BRAND_FONT,
    letterSpacing: -0.5,
  },
});

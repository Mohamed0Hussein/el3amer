import { BRAND_FONT } from '@/hooks/useFontFamily';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 48, withWordmark = false }) => {
  const { theme } = useTheme();
  const iconSize = Math.round(size * 0.55);

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          {
            width: size,
            height: size,
            borderRadius: size * 0.34,
            backgroundColor: theme.primary[500],
            shadowColor: theme.primary[700],
          },
        ]}
      >
        <Ionicons name="bag-handle" size={iconSize} color="#fff" />
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  wordmark: {
    fontFamily: BRAND_FONT,
    letterSpacing: -0.5,
  },
});

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

// Consistent circle-back-button + title header used across all inner screens,
// matching the el3amer cream/teal design system (replaces the old solid
// primary-color header band).
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, onBack, right }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
        style={[styles.circleBtn, { backgroundColor: theme.background.card }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={20} color={theme.text.secondary} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <ThemedText size="lg" weight="extrabold" numberOfLines={1}>{title}</ThemedText>
        {subtitle && (
          <ThemedText variant="tertiary" size="xs" style={{ marginTop: 1 }}>{subtitle}</ThemedText>
        )}
      </View>
      {right}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import { useTheme } from '@/hooks/useTheme';
import React, { useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, View, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

// One pulse shared by every placeholder on screen, so they breathe together.
// It only runs while at least one placeholder is mounted.
const pulse = new Animated.Value(0);
const pulseLoop = Animated.loop(
  Animated.sequence([
    Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
    Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
  ])
);
let mounted = 0;
const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] });

interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width: skeletonWidth = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (mounted++ === 0) pulseLoop.start();
    return () => {
      if (--mounted === 0) {
        pulseLoop.stop();
        pulse.setValue(0);
      }
    };
  }, []);

  return (
    <Animated.View
      style={[{ width: skeletonWidth, height, borderRadius, backgroundColor: theme.gray[200], opacity }, style]}
    />
  );
};

// Mirrors ProductCard, so the grid doesn't jump when the real cards arrive.
export const ProductCardSkeleton = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.productCard, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
      <Skeleton height={104} borderRadius={14} />
      <Skeleton width="85%" height={13} style={{ marginTop: 10 }} />
      <Skeleton width="55%" height={13} style={{ marginTop: 6 }} />
      <Skeleton width="30%" height={10} style={{ marginTop: 8 }} />
      <View style={styles.productBottom}>
        <Skeleton width="45%" height={18} />
        <Skeleton width={36} height={36} borderRadius={18} />
      </View>
    </View>
  );
};

// Match `padding` to the list's side padding (padding={0} inside a list that
// already pads its content); as a "loading more" footer, use rows={1}.
export const ProductListSkeleton = ({ rows = 3, padding = 16 }: { rows?: number; padding?: number }) => (
  <View style={{ paddingHorizontal: padding }}>
    {Array.from({ length: rows }, (_, i) => (
      <View key={i} style={styles.row}>
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </View>
    ))}
  </View>
);

// Placeholder for the home screen's category circles.
export const CategoryRowSkeleton = () => (
  <View style={styles.categories}>
    {Array.from({ length: 5 }, (_, i) => (
      <View key={i} style={styles.category}>
        <Skeleton width={56} height={56} borderRadius={18} />
        <Skeleton width={48} height={10} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 52) / 2,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
  },
  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
    gap: 10,
    overflow: 'hidden',
  },
  category: {
    width: 76,
    alignItems: 'center',
    gap: 9,
  },
});

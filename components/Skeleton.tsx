import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ 
  width: skeletonWidth = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonProps) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: skeletonWidth,
          height,
          borderRadius,
          backgroundColor: theme.gray[300],
          opacity,
        },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton = () => {
  const { theme } = useTheme();
  const cardWidth = (width - 48) / 2;

  return (
    <ThemedView variant="card" style={[styles.productCard, { width: cardWidth }]}>
      <ThemedView style={styles.productHeader}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <Skeleton width={22} height={22} borderRadius={11} />
      </ThemedView>
      <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
      <ThemedView style={styles.priceContainer}>
        <Skeleton width="40%" height={20} />
        <Skeleton width="20%" height={14} style={{ marginLeft: 4 }} />
      </ThemedView>
      <Skeleton width="100%" height={36} borderRadius={8} style={{ marginTop: 12 }} />
    </ThemedView>
  );
};

export const ProductListSkeleton = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.row}>
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </ThemedView>
      <ThemedView style={styles.row}>
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </ThemedView>
      <ThemedView style={styles.row}>
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});

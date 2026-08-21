import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { env } from '@/config/env';
import { formatUnit } from '@/constants/format';
import { useCartContext } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const product = typeof params.product === 'string' ? JSON.parse(params.product) : params.product;
  const { theme } = useTheme();
  const { t } = useLocalization();
  const { addToCart } = useCartContext();
  const { favorites, toggleFavorite } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const insets = useSafeAreaInsets();
  const formatPrice = useCurrency();

  const isFav = favorites.includes(product.id);

  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `${env.apiOrigin}${product.image?.startsWith('/') ? '' : '/'}${product.image}`;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    router.back();
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { top: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.circleBtn, { backgroundColor: theme.background.card }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.circleBtn, { backgroundColor: theme.background.card }]}
          onPress={() => toggleFavorite(product.id)}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={22}
            color={isFav ? theme.status.error : theme.text.secondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product image */}
        <View style={[styles.imageContainer, { backgroundColor: theme.gray[100] }]}>
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
        </View>

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={[styles.pill, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="leaf-outline" size={13} color={theme.status.success} />
              <ThemedText size="xs" weight="bold" style={{ color: theme.status.success }}>
                Fresh
              </ThemedText>
            </View>
            <ThemedText variant="tertiary" size="xs" style={{ textTransform: 'uppercase' }}>
              {product.category}
            </ThemedText>
          </View>

          <ThemedText variant="primary" size="2xl" weight="extrabold" style={styles.name}>
            {product.name}
          </ThemedText>

          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <ThemedText size="sm" weight="bold">4.8</ThemedText>
            </View>
            <ThemedText variant="tertiary" size="xs">
              (312 reviews)
            </ThemedText>
          </View>

          <View style={styles.priceRow}>
            <ThemedText size="2xl" weight="extrabold" style={{ color: theme.primary[500] }}>
              {formatPrice(product.price)}
            </ThemedText>
            <ThemedText variant="tertiary" size="sm" style={styles.unitText}>
              /{formatUnit(product.unit)}
            </ThemedText>
          </View>

          <ThemedText variant="secondary" size="sm" style={styles.description}>
            Fresh and high-quality {product.name.toLowerCase()} delivered directly to your doorstep. Perfect for your daily needs and healthy lifestyle.
          </ThemedText>

          <View style={styles.quantityContainer}>
            <ThemedText variant="primary" size="sm" weight="bold">
              Quantity
            </ThemedText>
            <View style={[styles.quantityPicker, { borderColor: theme.gray[200] }]}>
              <TouchableOpacity onPress={handleDecrease} style={styles.quantityBtn}>
                <ThemedText size="lg" weight="extrabold" style={{ color: theme.primary[500] }}>−</ThemedText>
              </TouchableOpacity>
              <ThemedText size="base" weight="extrabold" style={styles.quantityNum}>
                {quantity}
              </ThemedText>
              <TouchableOpacity onPress={handleIncrease} style={styles.quantityBtn}>
                <ThemedText size="lg" weight="extrabold" style={{ color: theme.primary[500] }}>+</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.deliveryCard, { backgroundColor: theme.primary[50] }]}>
            <Ionicons name="time-outline" size={20} color={theme.primary[700]} />
            <View style={{ flex: 1 }}>
              <ThemedText size="sm" weight="bold">Delivery in 30–45 min</ThemedText>
              <ThemedText size="xs" style={{ color: theme.primary[700], marginTop: 1 }}>
                Free for orders over {formatPrice(250)}
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer / Add to Cart */}
      <View style={[styles.footer, { backgroundColor: theme.background.secondary, borderColor: theme.gray[100], paddingBottom: insets.bottom + 18 }]}>
        <View style={[styles.stepper, { backgroundColor: theme.primary[500] }]}>
          <TouchableOpacity style={styles.stepperBtn} onPress={handleDecrease} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ThemedText variant="inverse" size="lg" weight="extrabold">−</ThemedText>
          </TouchableOpacity>
          <ThemedText variant="inverse" size="base" weight="extrabold" style={styles.stepperValue}>
            {quantity}
          </ThemedText>
          <TouchableOpacity style={styles.stepperBtn} onPress={handleIncrease} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ThemedText variant="inverse" size="lg" weight="extrabold">+</ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addToCartBtn, { backgroundColor: theme.primary[500], shadowColor: theme.primary[700] }]}
          onPress={handleAddToCart}
        >
          <ThemedText variant="inverse" weight="extrabold" size="base">
            {t('addToCart')}
          </ThemedText>
          <ThemedText variant="inverse" weight="bold" size="base" style={{ marginLeft: 4 }}>
            · {formatPrice(product.price * quantity)}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  name: {
    marginTop: 10,
    lineHeight: 30,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
  },
  unitText: {
    marginLeft: 6,
  },
  description: {
    lineHeight: 22,
    marginTop: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    padding: 4,
  },
  quantityBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityNum: {
    marginHorizontal: 10,
    minWidth: 16,
    textAlign: 'center',
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    marginTop: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderTopWidth: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    padding: 4,
    gap: 2,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 16,
    textAlign: 'center',
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 999,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 4,
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

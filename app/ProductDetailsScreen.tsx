import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { env } from '@/config/env';
import { formatQuantity, formatUnit, lineTotal, maxQuantity, stepOf } from '@/constants/format';
import { useCartContext } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useProducts } from '@/hooks/useProducts';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useTheme } from '@/hooks/useTheme';
import { Product } from '@/types/Product';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const product = typeof params.product === 'string' ? JSON.parse(params.product) : params.product;
  const { theme } = useTheme();
  const { t } = useLocalization();
  const { addToCart } = useCartContext();
  const { favorites, toggleFavorite } = useFavorites();
  // Counted in steps: 1 piece, or e.g. 0.25 kg for products sold by weight.
  const [steps, setSteps] = useState(1);
  const insets = useSafeAreaInsets();
  const formatPrice = useCurrency();
  const settings = useStoreSettings();

  const isFav = favorites.includes(product.id);
  const step = stepOf(product);
  const amount = steps * step;
  const maxSteps = Math.round(maxQuantity(product) / step);
  const outOfStock = maxSteps <= 0;

  const { products: sameCategory } = useProducts({ category: product.category, limit: 7 }, !!product.category);
  const relatedProducts = useMemo(
    () => sameCategory.filter((p: Product) => p.id !== product.id).slice(0, 6),
    [sameCategory, product.id],
  );

  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `${env.apiOrigin}${product.image?.startsWith('/') ? '' : '/'}${product.image}`;

  const handleDecrease = () => {
    if (steps > 1) setSteps(steps - 1);
  };

  const handleIncrease = () => {
    if (steps < maxSteps) setSteps(steps + 1);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < steps; i++) {
      addToCart(product);
    }
    router.back();
  };

  return (
    <ThemedView variant="primary" style={styles.container}>

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
                {t('fresh')}
              </ThemedText>
            </View>
            <ThemedText variant="tertiary" size="xs" style={{ textTransform: 'uppercase' }}>
              {product.category}
            </ThemedText>
          </View>

          <ThemedText variant="primary" size="2xl" weight="extrabold" style={styles.name}>
            {product.name}
          </ThemedText>

          {product.stock <= 5 && (
            <View style={styles.ratingRow}>
              <View style={[styles.pill, { backgroundColor: '#FEFCE8' }]}>
                <ThemedText size="xs" weight="bold" style={{ color: '#A16207' }}>
                  {outOfStock ? t('outOfStock') : t('onlyLeft').replace('{n}', formatQuantity(product.stock, product.unit))}
                </ThemedText>
              </View>
            </View>
          )}

          <View style={styles.priceRow}>
            <ThemedText size="2xl" weight="extrabold" style={{ color: theme.primary[500] }}>
              {formatPrice(product.price)}
            </ThemedText>
            <ThemedText variant="tertiary" size="sm" style={styles.unitText}>
              /{formatUnit(product.unit)}
            </ThemedText>
          </View>

          {!!product.description && (
            <>
              <ThemedText size="sm" weight="extrabold" style={styles.aboutTitle}>
                {t('aboutProduct')}
              </ThemedText>
              <ThemedText variant="secondary" size="sm" style={styles.description}>
                {product.description}
              </ThemedText>
            </>
          )}

          <View style={[styles.deliveryCard, { backgroundColor: theme.primary[50] }]}>
            <Ionicons name="time-outline" size={20} color={theme.primary[700]} />
            <View style={{ flex: 1 }}>
              <ThemedText size="sm" weight="bold">
                {t('deliveryEta').replace('{eta}', String(settings?.etaMinutes ?? 30))}
              </ThemedText>
              {settings && (
                <ThemedText size="xs" style={{ color: theme.primary[700], marginTop: 1 }}>
                  {settings.deliveryFee > 0
                    ? t('deliveryFeeAll').replace('{fee}', formatPrice(settings.deliveryFee))
                    : t('freeDeliveryAll')}
                </ThemedText>
              )}
            </View>
          </View>
        </View>

        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <ThemedText variant="primary" size="base" weight="extrabold" style={styles.relatedTitle}>
              {t('youMayLike')}
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedContent}>
              {relatedProducts.map((p: Product) => {
                const relatedImageUrl = p.image?.startsWith('http')
                  ? p.image
                  : `${env.apiOrigin}${p.image?.startsWith('/') ? '' : '/'}${p.image}`;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.relatedCard}
                    onPress={() => router.push({ pathname: '/ProductDetailsScreen', params: { product: JSON.stringify(p) } })}
                  >
                    <View style={[styles.relatedThumb, { backgroundColor: theme.gray[100] }]}>
                      <Image source={{ uri: relatedImageUrl }} style={styles.relatedThumbImage} contentFit="contain" />
                    </View>
                    <ThemedText size="xs" weight="bold" numberOfLines={1} style={{ marginTop: 8 }}>
                      {p.name}
                    </ThemedText>
                    <ThemedText size="sm" weight="extrabold" style={{ color: theme.primary[500], marginTop: 2 }}>
                      {formatPrice(p.price)}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Footer / Add to Cart */}
      <View style={[styles.footer, { backgroundColor: theme.background.secondary, borderColor: theme.gray[100], paddingBottom: insets.bottom + 18 }]}>
        <View style={[styles.stepper, { backgroundColor: theme.primary[500] }]}>
          <TouchableOpacity style={styles.stepperBtn} onPress={handleDecrease} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ThemedText variant="inverse" size="lg" weight="extrabold">−</ThemedText>
          </TouchableOpacity>
          <ThemedText variant="inverse" size="base" weight="extrabold" style={styles.stepperValue} numberOfLines={1}>
            {formatQuantity(amount, product.unit)}
          </ThemedText>
          <TouchableOpacity
            style={[styles.stepperBtn, steps >= maxSteps && { opacity: 0.4 }]}
            onPress={handleIncrease}
            disabled={steps >= maxSteps}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ThemedText variant="inverse" size="lg" weight="extrabold">+</ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addToCartBtn, { backgroundColor: theme.primary[500], shadowColor: theme.primary[700] }]}
          onPress={handleAddToCart}
          disabled={outOfStock}
        >
          <ThemedText variant="inverse" weight="extrabold" size="base">
            {t('addToCart')}
          </ThemedText>
          <ThemedText variant="inverse" weight="bold" size="base" style={{ marginLeft: 4 }}>
            · {formatPrice(lineTotal(product.price, amount))}
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
  },
  unitText: {
    marginLeft: 6,
  },
  aboutTitle: {
    marginTop: 20,
  },
  description: {
    lineHeight: 22,
    marginTop: 8,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    marginTop: 22,
  },
  relatedSection: {
    paddingTop: 24,
  },
  relatedTitle: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  relatedContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 4,
  },
  relatedCard: {
    width: 126,
  },
  relatedThumb: {
    height: 88,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedThumbImage: {
    width: '100%',
    height: '100%',
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

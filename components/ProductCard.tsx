import { ROUTES } from '@/constants/routes';
import { useCartContext } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/hooks/useTheme';
import { formatUnit } from '@/constants/format';
import { useCurrency } from '@/hooks/useCurrency';
import { Product } from '@/types/Product';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { Dimensions, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { env } from '@/config/env';
import { ThemedText } from './themed-text';

const { width } = Dimensions.get('window');

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, updateCartQuantity } = useCartContext();
  const { favorites, toggleFavorite } = useFavorites();
  const { theme, tokens } = useTheme();
  const formatPrice = useCurrency();

  const isFav = favorites.includes(product.id);
  const qty = cart.find((c) => c.id === product.id)?.quantity ?? 0;

  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `${env.apiOrigin}${product.image?.startsWith('/') ? '' : '/'}${product.image}`;

  const openDetails = useCallback(() => {
    router.push({ pathname: ROUTES.PRODUCT_DETAILS as any, params: { product: JSON.stringify(product) } });
  }, [product]);

  return (
    <Pressable
      onPress={openDetails}
      // No android_ripple: on Android it freezes the background color, so the
      // card stayed dark after a live dark→light switch.
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.background.card, borderColor: theme.gray[100] },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.imageBox, { backgroundColor: theme.gray[50] }]}>
        <Image source={{ uri: imageUrl }} style={styles.image} contentFit="contain" />
        <TouchableOpacity
          onPress={() => toggleFavorite(product.id)}
          style={styles.favBtn}
          hitSlop={tokens.hitSlop}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={15}
            color={isFav ? theme.status.error : theme.gray[500]}
          />
        </TouchableOpacity>
      </View>

      <ThemedText size="sm" weight="bold" numberOfLines={2} style={styles.name}>
        {product.name}
      </ThemedText>
      <ThemedText variant="tertiary" size="xs">{formatUnit(product.unit)}</ThemedText>

      <View style={styles.bottomRow}>
        <ThemedText
          size="base"
          weight="extrabold"
          style={{ flexShrink: 1 }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {formatPrice(product.price)}
        </ThemedText>
        {qty > 0 ? (
          <View style={[styles.stepper, { backgroundColor: theme.primary[500] }]}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => updateCartQuantity(product.id, -1)} hitSlop={tokens.hitSlop}>
              <ThemedText variant="inverse" weight="extrabold">−</ThemedText>
            </TouchableOpacity>
            <ThemedText variant="inverse" size="xs" weight="extrabold" style={styles.stepValue}>{qty}</ThemedText>
            <TouchableOpacity
              style={[styles.stepBtn, qty >= product.stock && { opacity: 0.4 }]}
              onPress={() => updateCartQuantity(product.id, 1)}
              disabled={qty >= product.stock}
              hitSlop={tokens.hitSlop}
            >
              <ThemedText variant="inverse" weight="extrabold">+</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => addToCart(product)}
            disabled={product.stock <= 0}
            style={[styles.addBtn, { borderColor: theme.primary[500] }, product.stock <= 0 && { opacity: 0.4 }]}
            hitSlop={tokens.hitSlop}
          >
            <Ionicons name="add" size={20} color={theme.primary[500]} />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: (width - 52) / 2,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
    shadowColor: '#1C1712',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  imageBox: {
    height: 104,
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: 6,
    end: 6,
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 9,
    minHeight: 36,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 9,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    padding: 4,
    gap: 3,
  },
  stepBtn: {
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    minWidth: 11,
    textAlign: 'center',
  },
});

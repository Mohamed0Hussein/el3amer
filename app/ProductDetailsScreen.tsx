import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { env } from '@/config/env';
import { useCartContext } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { LocalizedProduct } from '@/types/Product';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const product = typeof params.product === 'string' ? JSON.parse(params.product) : params.product;
  const { theme } = useTheme(); 
  const productImageSize = { width: '100%', height: 350 };  
  const { t } = useLocalization();
  const { addToCart } = useCartContext();
  const { favorites, toggleFavorite } = useFavorites();
  const [quantity, setQuantity] = useState(1);

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
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.background.card }]} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.favoriteButton, { backgroundColor: theme.background.card }]}
          onPress={() => toggleFavorite(product.id)}
        >
          <Ionicons 
            name={isFav ? "heart" : "heart-outline"} 
            size={24} 
            color={isFav ? theme.status.error : theme.gray[400]} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image Placeholder */}
        <ThemedView style={[styles.imageContainer, { backgroundColor: theme.gray[50] }]}>
          <Image source={{ uri: imageUrl }} style={productImageSize} contentFit="cover" />
        </ThemedView>
        <View style={styles.content}>
          <ThemedView variant="default" style={styles.infoRow}>
            <ThemedView variant="default" style={{ flex: 1, paddingRight: 16 }}>
              <ThemedText variant="primary" size="2xl" weight="bold">
                {product.name}
              </ThemedText>
              <ThemedText variant="tertiary" size="base">
                {product.category.toUpperCase()}
              </ThemedText>
            </ThemedView>
            <ThemedView variant="default" style={{ alignItems: 'flex-end' }}>
              <ThemedText variant="success" size="2xl" weight="bold">
                ${product.price}
              </ThemedText>
              <ThemedText variant="tertiary" size="sm" style={{ textAlign: 'right' }}>
                /{t(product.unit as any)}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedText variant="secondary" size="base" style={styles.description}>
            Fresh and high-quality {product.name.toLowerCase()} delivered directly to your doorstep. Perfect for your daily needs and healthy lifestyle.
          </ThemedText>

          <View style={styles.quantityContainer}>
            <ThemedText variant="primary" size="lg" weight="semibold">
              Select Quantity
            </ThemedText>
            <View style={[styles.quantityPicker, { backgroundColor: theme.gray[100] }]}>
              <TouchableOpacity onPress={handleDecrease} style={styles.quantityBtn}>
                <Ionicons name="remove" size={24} color={theme.text.primary} />
              </TouchableOpacity>
              <ThemedText size="xl" weight="bold" style={styles.quantityNum}>
                {quantity}
              </ThemedText>
              <TouchableOpacity onPress={handleIncrease} style={styles.quantityBtn}>
                <Ionicons name="add" size={24} color={theme.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <ThemedView variant="card" style={styles.featureCard}>
            <View style={styles.featureItem}>
              <Ionicons name="star" size={20} color="#fbbf24" />
              <ThemedText weight="semibold">4.8 Rating</ThemedText>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Ionicons name="time-outline" size={20} color={theme.primary[500]} />
              <ThemedText weight="semibold">30-40 min</ThemedText>
            </View>
          </ThemedView>
        </View>
      </ScrollView>

      {/* Footer / Add to Cart */}
      <ThemedView variant="card" style={styles.footer}>
        <View>
          <ThemedText variant="tertiary" size="sm">Total Price</ThemedText>
          <ThemedText variant="primary" size="xl" weight="bold">
            ${(product.price * quantity).toFixed(2)}
          </ThemedText>
        </View>
        <TouchableOpacity 
          style={[styles.addToCartBtn, { backgroundColor: theme.primary[500] }]}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={24} color="#fff" />
          <ThemedText variant="inverse" weight="bold" size="lg" style={{ marginLeft: 8 }}>
            {t('addToCart')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  emoji: {
    fontSize: 150,
  },
  content: {
    padding: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  description: {
    lineHeight: 24,
    marginBottom: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 4,
  },
  quantityBtn: {
    padding: 8,
  },
  quantityNum: {
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#eee',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 20,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
});

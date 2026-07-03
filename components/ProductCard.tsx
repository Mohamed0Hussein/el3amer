import { ROUTES } from '@/constants/routes';
import { useCartContext } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import type { AuthenticatedStackParamList } from '@/types/navigation';
import { LocalizedProduct } from '@/types/Product';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { memo, useCallback } from 'react';
import { Dimensions, Image, Platform, Pressable, StyleSheet } from 'react-native';
import { ThemedButton } from './themed-button';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<AuthenticatedStackParamList>;

export const ProductCard = memo(function ProductCard({ product }: { product: LocalizedProduct }) {
  console.log(product.image)
  const navigation = useNavigation<Nav>();
  const { addToCart } = useCartContext();
  const { favorites, toggleFavorite } = useFavorites();
  const { theme, tokens } = useTheme();
  const { t } = useLocalization();

  const isFav = favorites.includes(product.id);

  const openDetails = useCallback(() => {
    navigation.navigate(ROUTES.PRODUCT_DETAILS, { product });
  }, [navigation, product]);

  const onToggleFavorite = useCallback(() => {
    toggleFavorite(product.id);
  }, [toggleFavorite, product.id]);

  const onAdd = useCallback(() => {
    addToCart(product);
  }, [addToCart, product]);

  return (
    <View style={styles.container}>
      <ThemedView variant="card" style={[styles.productCard, { borderRadius: tokens.radius.lg, overflow: 'hidden' }]}>
        <Pressable 
          onPress={openDetails}
          android_ripple={{ color: theme.primary[100] }}
          style={({ pressed }) => [
            styles.pressableContainer,
            pressed && Platform.OS !== 'android' && { opacity: 0.7 }
          ]}
        >
          <ThemedView style={styles.productHeader}>
            <Image source={{ uri: product.image }} />
            <Pressable 
              onPress={onToggleFavorite} 
              style={({ pressed }) => [
                styles.favoriteBtn,
                pressed && Platform.OS !== 'android' && { opacity: 0.5 }
              ]}
              hitSlop={tokens.hitSlop}
              android_ripple={{ color: theme.gray[200], borderless: true, radius: 24 }}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={22}
                color={isFav ? theme.status.error : theme.gray[400]}
              />
            </Pressable>
          </ThemedView>
          
          <ThemedText 
            variant="primary" 
            size="sm" 
            weight="semibold" 
            style={styles.productName}
            numberOfLines={1}
          >
            {t(product.name as any)}
          </ThemedText>
          
          <ThemedView style={styles.priceContainer}>
            <ThemedText variant="success" size="lg" weight="bold">
              ${product.price}
            </ThemedText>
            <ThemedText variant="tertiary" size="sm" style={styles.productUnit}>
              /{t(product.unit as any)}
            </ThemedText>
          </ThemedView>
          
          <ThemedButton
            variant="primary"
            size="sm"
            onPress={onAdd}
            style={styles.addButton}
          >
            {t('addToCart')}
          </ThemedButton>
        </Pressable>
      </ThemedView>
    </View>
  );
});

import { View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  productCard: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pressableContainer: {
    padding: 12,
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productEmoji: {
    fontSize: 48,
  },
  favoriteBtn: {
    padding: 4,
  },
  productName: {
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  productUnit: {
    marginLeft: 2,
  },
  addButton: {
  },
});
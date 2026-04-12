import { ROUTES } from '@/constants/routes';
import { useCartContext } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { LocalizedProduct } from '@/types/Product';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedButton } from './themed-button';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const { width } = Dimensions.get('window');

export const ProductCard = ({ product }: { product: LocalizedProduct }) => {
  const navigation = useNavigation();
  const { addToCart } = useCartContext();
  const { favorites, toggleFavorite } = useFavorites();
  const { theme } = useTheme();
  const { t } = useLocalization();

  const isFav = favorites.includes(product.id);

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => (navigation.navigate as any)(ROUTES.PRODUCT_DETAILS, { product })}
      style={styles.container}
    >
      <ThemedView variant="card" style={styles.productCard}>
        <ThemedView style={styles.productHeader}>
          <ThemedText style={styles.productEmoji}>{product.emoji}</ThemedText>
          <TouchableOpacity 
            onPress={() => toggleFavorite(product.id)} 
            style={styles.favoriteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={22}
              color={isFav ? theme.status.error : theme.gray[400]}
            />
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedText 
          variant="primary" 
          size="sm" 
          weight="semibold" 
          style={styles.productName}
          numberOfLines={1}
        >
          {t(product.nameKey as any)}
        </ThemedText>
        
        <ThemedView style={styles.priceContainer}>
          <ThemedText variant="success" size="lg" weight="bold">
            ${product.price}
          </ThemedText>
          <ThemedText variant="tertiary" size="sm" style={styles.productUnit}>
            /{t(product.unitKey as any)}
          </ThemedText>
        </ThemedView>
        
        <ThemedButton
          variant="primary"
          size="sm"
          onPress={() => addToCart(product)}
          style={styles.addButton}
        >
          {t('addToCart')}
        </ThemedButton>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  productCard: {
    borderRadius: 16,
    padding: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
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
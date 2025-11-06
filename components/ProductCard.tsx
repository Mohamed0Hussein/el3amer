import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalization } from '@/context/LocalizationContext';
import { useCartContext } from '@/context/CartContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

export const ProductCard = ({ product }: { product: any }) => {
  const { addToCart, favorites, toggleFavorite } = useCartContext();
  const { theme } = useTheme();
  const { t } = useLocalization();

  return (
    <ThemedView variant="card" style={styles.productCard}>
      <ThemedView style={styles.productHeader}>
        <ThemedText style={styles.productEmoji}>{product.emoji}</ThemedText>
        <TouchableOpacity 
          onPress={() => toggleFavorite(product.id)} 
          style={styles.favoriteBtn}
        >
          <Ionicons
            name={favorites.includes(product.id) ? 'heart' : 'heart-outline'}
            size={22}
            color={favorites.includes(product.id) ? theme.status.error : theme.gray[400]}
          />
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedText 
        variant="primary" 
        size="sm" 
        weight="semibold" 
        style={styles.productName}
      >
        {product.name}
      </ThemedText>
      
      <ThemedView style={styles.priceContainer}>
        <ThemedText variant="success" size="lg" weight="bold">
          ${product.price}
        </ThemedText>
        <ThemedText variant="tertiary" size="sm" style={styles.productUnit}>
          /{product.unit}
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
  );
};

const styles = StyleSheet.create({
  productCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    width: (width - 48) / 2,
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
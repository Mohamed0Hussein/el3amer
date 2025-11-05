import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCartContext } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/hooks/useTheme';
import { Category } from '@/types/Category';
import { Product } from '@/types/Product';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart, cart } = useCartContext();
  const { theme } = useTheme();

  const categories: Category[] = [
    { id: 'all', name: 'All', icon: 'apps-outline' },
    { id: 'fruits', name: 'Fruits', icon: 'leaf-outline' },
    { id: 'vegetables', name: 'Vegetables', icon: 'nutrition-outline' },
    { id: 'dairy', name: 'Dairy', icon: 'water-outline' },
    { id: 'meat', name: 'Meat', icon: 'restaurant-outline' },
    { id: 'bakery', name: 'Bakery', icon: 'cafe-outline' },
    { id: 'snacks', name: 'Snacks', icon: 'fast-food-outline' },
    { id: 'beverages', name: 'Beverages', icon: 'beer-outline' },
  ];

  const products: Product[] = [
    { id: 1, name: 'Fresh Apples', category: 'fruits', price: 3.99, unit: 'lb', emoji: '🍎', stock: 50 },
    { id: 2, name: 'Organic Bananas', category: 'fruits', price: 2.49, unit: 'lb', emoji: '🍌', stock: 45 },
    { id: 3, name: 'Fresh Carrots', category: 'vegetables', price: 1.99, unit: 'lb', emoji: '🥕', stock: 30 },
    { id: 4, name: 'Broccoli', category: 'vegetables', price: 2.79, unit: 'lb', emoji: '🥦', stock: 25 },
    { id: 5, name: 'Whole Milk', category: 'dairy', price: 4.29, unit: 'gal', emoji: '🥛', stock: 20 },
    { id: 6, name: 'Cheddar Cheese', category: 'dairy', price: 5.99, unit: 'lb', emoji: '🧀', stock: 15 },
    { id: 7, name: 'Chicken Breast', category: 'meat', price: 7.99, unit: 'lb', emoji: '🍗', stock: 18 },
    { id: 8, name: 'Ground Beef', category: 'meat', price: 6.49, unit: 'lb', emoji: '🥩', stock: 22 },
    { id: 9, name: 'White Bread', category: 'bakery', price: 2.99, unit: 'loaf', emoji: '🍞', stock: 35 },
    { id: 10, name: 'Croissants', category: 'bakery', price: 4.49, unit: 'pack', emoji: '🥐', stock: 12 },
    { id: 11, name: 'Chocolate Cookies', category: 'snacks', price: 3.49, unit: 'pack', emoji: '🍪', stock: 40 },
    { id: 12, name: 'Potato Chips', category: 'snacks', price: 2.99, unit: 'bag', emoji: '🥔', stock: 50 },
    { id: 13, name: 'Orange Juice', category: 'beverages', price: 4.99, unit: 'bottle', emoji: '🧃', stock: 28 },
    { id: 14, name: 'Cola', category: 'beverages', price: 5.49, unit: '12-pack', emoji: '🥤', stock: 33 },
    { id: 15, name: 'Fresh Oranges', category: 'fruits', price: 4.29, unit: 'lb', emoji: '🍊', stock: 38 },
    { id: 16, name: 'Strawberries', category: 'fruits', price: 5.99, unit: 'pack', emoji: '🍓', stock: 20 },
    { id: 17, name: 'Tomatoes', category: 'vegetables', price: 3.49, unit: 'lb', emoji: '🍅', stock: 42 },
    { id: 18, name: 'Greek Yogurt', category: 'dairy', price: 6.49, unit: 'pack', emoji: '🥄', stock: 28 },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);



  const ProductCard = ({ product }: { product: Product }) => (
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
      <ThemedText variant="primary" size="sm" weight="semibold" style={styles.productName}>
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
        Add to Cart
      </ThemedButton>
    </ThemedView>
  );



  return (
      <ThemedView variant="primary" style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.primary[500]} />
        
        <ThemedView variant="primary" style={styles.container}>
          {/* Header */}
          <ThemedView style={[styles.header, { backgroundColor: theme.primary[500] }]}>
            <ThemedText variant="inverse" size="2xl" weight="bold" style={styles.headerTitle}>
              Fresh Supermarket
            </ThemedText>
            <ThemedView style={[styles.searchContainer, { backgroundColor: theme.background.secondary }]}>
              <Ionicons name="search-outline" size={20} color={theme.gray[400]} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: theme.text.primary }]}
                placeholder="Search products..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.gray[400]}
              />
            </ThemedView>
          </ThemedView>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: theme.gray[100] },
                  selectedCategory === cat.id && { backgroundColor: theme.primary[500] },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={selectedCategory === cat.id ? theme.text.inverse : theme.gray[700]}
                />
                <ThemedText
                  variant={selectedCategory === cat.id ? 'inverse' : 'secondary'}
                  size="sm"
                  weight="semibold"
                  style={styles.categoryText}
                >
                  {cat.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Products Grid */}
          <FlatList
            style={{ flex: 1 }}
            data={filteredProducts}
            renderItem={({ item }) => <ProductCard product={item} />}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productsContainer}
            showsVerticalScrollIndicator={false}
          />
        </ThemedView>

        {/* Bottom Navigation */}
      </ThemedView>
  );
}

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: StatusBar.currentHeight || 0,
  },
  headerTitle: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  categoriesContainer: {
    maxHeight: 80,
    paddingTop: 12,
    paddingBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    height: 44,
  },
  categoryText: {
    marginLeft: 6,
  },
  productsContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  productRow: {
    justifyContent: 'space-between',
  },
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
    // ThemedButton handles its own styling
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
    paddingBottom: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navText: {
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
  },
});
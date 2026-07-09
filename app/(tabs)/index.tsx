import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { ProductListSkeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { tokens } from '@/constants/tokens';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { getProducts } from '@/services/products';
import { Category } from '@/types/Category';
import { LocalizedProduct } from '@/types/Product';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'price_low' | 'price_high'>('name');

  const { theme } = useTheme();
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();

  const { data: products = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(selectedCategory, searchQuery, true),
  });

  const categories: Category[] = [
    { id: 'all', name: t('cat_all'), icon: 'apps-outline' },
    { id: 'fruits', name: t('cat_fruits'), icon: 'leaf-outline' },
    { id: 'vegetables', name: t('cat_vegetables'), icon: 'nutrition-outline' },
    { id: 'dairy', name: t('cat_dairy'), icon: 'water-outline' },
    { id: 'meat', name: t('cat_meat'), icon: 'restaurant-outline' },
    { id: 'bakery', name: t('cat_bakery'), icon: 'cafe-outline' },
    { id: 'snacks', name: t('cat_snacks'), icon: 'fast-food-outline' },
    { id: 'beverages', name: t('cat_beverages'), icon: 'beer-outline' },
  ];

  const filteredProducts = useMemo(() => {
    let result = products.filter((product: LocalizedProduct) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const localizedName = t(product.nameKey as any).toLowerCase();
      const matchesSearch = localizedName.includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = t(a.nameKey as any).toLowerCase();
        const nameB = t(b.nameKey as any).toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy, t]);

  const renderProduct = useCallback(
    ({ item }: { item: LocalizedProduct }) => <ProductCard product={item} />,
    [],
  );

  const keyExtractor = useCallback((item: LocalizedProduct) => String(item.id), []);

  const onRefresh = () => {
    refetch();
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.primary[500]}
      />
      
      {/* Header */}
      <ThemedView variant="primary" style={[styles.header, { backgroundColor: theme.primary[500], paddingTop: insets.top + tokens.space.md }]}>
        <ThemedText variant="inverse" size="2xl" weight="bold" style={styles.headerTitle}>
          {t('appTitle')}
        </ThemedText>
        <ThemedView style={[styles.searchContainer, { backgroundColor: theme.background.secondary }]}>
          <Ionicons name="search-outline" size={20} color={theme.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text.primary }]}
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.gray[400]}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.gray[400]} />
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>

      {/* Categories */}
      <ThemedView style={styles.categoriesWrapper}>
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
      </ThemedView>
      
      {/* Search Result Count & Sort UI */}
      <ThemedView variant="secondary" style={styles.sortContainer}>
        <ThemedText variant="tertiary" size="sm">
          {filteredProducts.length} {t('cat_all')}
        </ThemedText>
        <View style={styles.sortButtons}>
          <TouchableOpacity 
            onPress={() => setSortBy('name')} 
            style={[styles.sortBtn, sortBy === 'name' && { backgroundColor: theme.primary[500] + '20' }]}
          >
            <ThemedText variant={sortBy === 'name' ? 'success' : 'tertiary'} size="xs" weight="bold">A-Z</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSortBy('price_low')} 
            style={[styles.sortBtn, sortBy === 'price_low' && { backgroundColor: theme.primary[500] + '20' }]}
          >
            <Ionicons name="trending-up-outline" size={14} color={sortBy === 'price_low' ? theme.primary[500] : theme.gray[400]} />
            <ThemedText variant={sortBy === 'price_low' ? 'success' : 'tertiary'} size="xs" weight="bold">Low</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSortBy('price_high')} 
            style={[styles.sortBtn, sortBy === 'price_high' && { backgroundColor: theme.primary[500] + '20' }]}
          >
            <Ionicons name="trending-down-outline" size={14} color={sortBy === 'price_high' ? theme.primary[500] : theme.gray[400]} />
            <ThemedText variant={sortBy === 'price_high' ? 'success' : 'tertiary'} size="xs" weight="bold">High</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Products Grid */}
      {isLoading && !isRefetching ? (
        <ProductListSkeleton />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productsContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={Platform.OS === 'android'}
          windowSize={7}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              colors={[theme.primary[500]]}
              tintColor={theme.primary[500]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title={t('noProducts')}
              message={t('noProductsMessage')}
              actionLabel={searchQuery || selectedCategory !== 'all' ? t('cat_all') : undefined}
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: tokens.space.xl,
    paddingBottom: tokens.space.xl,
  },
  headerTitle: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  categoriesWrapper: {
    height: 70,
  },
  categoriesContainer: {
    flex: 1,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    height: 44,
  },
  categoryText: {
    marginLeft: 6,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productsContainer: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  productRow: {
    justifyContent: 'space-between',
  },
});

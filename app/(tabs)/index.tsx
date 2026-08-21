import { EmptyState } from '@/components/EmptyState';
import { Logo } from '@/components/Logo';
import { ProductCard } from '@/components/ProductCard';
import { ProductListSkeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { tokens } from '@/constants/tokens';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { getCategories } from '@/services/categories';
import { getProducts } from '@/services/products';
import { Category } from '@/types/Category';
import { Product } from '@/types/Product';
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

// Cycled tint palette for category chips, matching the el3amer brand sheet.
const CATEGORY_TINTS = [
  { bg: '#E4F2F1', ink: '#0F6F6C' },
  { bg: '#FFFBEB', ink: '#A16207' },
  { bg: '#FDF3E7', ink: '#B45309' },
  { bg: '#FEF2F2', ink: '#B91C1C' },
  { bg: '#EFF6FF', ink: '#2563EB' },
  { bg: '#F0FDF4', ink: '#15803D' },
  { bg: '#FAF6F2', ink: '#7C6F60' },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'price_low' | 'price_high'>('name');

  const { theme } = useTheme();
  const { t, isRtl } = useLocalization();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const { data: products = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(selectedCategory, searchQuery, true),
  });

  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const categories = useMemo(() => {
    const allCategory: Category = { id: 'all', name: t('cat_all'), icon: 'apps-outline' };
    return [allCategory, ...fetchedCategories];
  }, [fetchedCategories, t]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greetingMorning');
    if (hour < 18) return t('greetingAfternoon');
    return t('greetingEvening');
  }, [t]);

  const firstName = user?.fullName?.split(' ')[0];

  const filteredProducts = useMemo(() => {
    let result = products.filter((product: Product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      }
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => <ProductCard product={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Product) => String(item.id), []);

  const onRefresh = () => {
    refetch();
  };

  const listHeader = (
    <>
      {/* Brand header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.space.md }]}>
        <View style={styles.brandRow}>
          <Logo size={44} />
          <View style={styles.brandText}>
            <ThemedText variant="primary" size="xl" weight="extrabold">
              {t('appTitle')}
            </ThemedText>
            <ThemedText variant="tertiary" size="xs" style={styles.tagline}>
              {t('appTagline')}
            </ThemedText>
          </View>
        </View>

        <ThemedText variant="primary" size="xl" weight="extrabold" style={styles.greeting}>
          {greeting}{firstName ? `${isRtl ? '،' : ','} ${firstName}` : ''}
        </ThemedText>
        <ThemedText variant="tertiary" size="sm" style={styles.subGreeting}>
          {t('homeSubtitle')}
        </ThemedText>

        <View style={[styles.searchContainer, { backgroundColor: theme.background.card, borderColor: theme.gray[200] }]}>
          <Ionicons name="search-outline" size={19} color={theme.gray[400]} style={styles.searchIcon} />
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
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat, index) => {
          const active = selectedCategory === cat.id;
          const tint = CATEGORY_TINTS[index % CATEGORY_TINTS.length];
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <View
                style={[
                  styles.categoryCircle,
                  { backgroundColor: active ? theme.primary[500] : tint.bg },
                ]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={22}
                  color={active ? '#fff' : tint.ink}
                />
              </View>
              <ThemedText
                variant={active ? 'primary' : 'tertiary'}
                size="xs"
                weight={active ? 'bold' : 'medium'}
                style={styles.categoryLabel}
                numberOfLines={1}
              >
                {cat.name}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Result count & sort */}
      <View style={styles.sortContainer}>
        <ThemedText variant="tertiary" size="sm">
          {filteredProducts.length} {t('itemsCount')}
        </ThemedText>
        <View style={[styles.sortButtons, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
          <TouchableOpacity
            onPress={() => setSortBy('name')}
            style={[styles.sortBtn, sortBy === 'name' && { backgroundColor: theme.primary[500] }]}
          >
            <ThemedText variant={sortBy === 'name' ? 'inverse' : 'tertiary'} size="xs" weight="bold">A-Z</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy('price_low')}
            style={[styles.sortBtn, sortBy === 'price_low' && { backgroundColor: theme.primary[500] }]}
          >
            <Ionicons name="trending-up-outline" size={13} color={sortBy === 'price_low' ? '#fff' : theme.gray[400]} />
            <ThemedText variant={sortBy === 'price_low' ? 'inverse' : 'tertiary'} size="xs" weight="bold">Low</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy('price_high')}
            style={[styles.sortBtn, sortBy === 'price_high' && { backgroundColor: theme.primary[500] }]}
          >
            <Ionicons name="trending-down-outline" size={13} color={sortBy === 'price_high' ? '#fff' : theme.gray[400]} />
            <ThemedText variant={sortBy === 'price_high' ? 'inverse' : 'tertiary'} size="xs" weight="bold">High</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <ThemedView variant="primary" style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background.primary} />

      {isLoading && !isRefetching ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {listHeader}
          <ProductListSkeleton />
        </ScrollView>
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
          ListHeaderComponent={listHeader}
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
    paddingBottom: tokens.space.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  brandText: {
    flex: 1,
  },
  tagline: {
    marginTop: 2,
  },
  greeting: {
    marginBottom: 3,
  },
  subGreeting: {
    marginBottom: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 16,
    paddingVertical: 6,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 7,
    width: 68,
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    textAlign: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    padding: 3,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  productsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  productRow: {
    justifyContent: 'space-between',
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ProductListSkeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useCartContext } from '@/context/CartContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useProducts } from '@/hooks/useProducts';
import { useTheme } from '@/hooks/useTheme';
import { getCategories } from '@/services/categories';
import { Product } from '@/types/Product';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CategoryScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [category, setCategory] = useState(params.category || 'all');
  const { theme } = useTheme();
  const { t } = useLocalization();
  const { cartItemCount, cartTotal } = useCartContext();
  const formatPrice = useCurrency();
  const insets = useSafeAreaInsets();

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const { products, total, isLoading, loadMore, isFetchingNextPage } = useProducts({ category, sort: 'name' });

  const chips = [{ id: 'all', name: t('cat_all') }, ...categories];
  const title = category === 'all' ? t('allCategories') : category;

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ScreenHeader title={title} subtitle={`${total} ${t('productsCount')}`} />

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {chips.map((c) => {
            const active = c.id === category;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setCategory(c.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.primary[500] : theme.background.card,
                    borderColor: active ? theme.primary[500] : theme.gray[200],
                  },
                ]}
              >
                <ThemedText size="xs" weight="bold" variant={active ? 'inverse' : 'tertiary'}>
                  {c.name}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <ProductListSkeleton />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p: Product) => String(p.id)}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} color={theme.primary[500]} /> : null
          }
          ListEmptyComponent={
            <EmptyState icon="search-outline" title={t('noProducts')} message={t('noProductsMessage')} />
          }
        />
      )}

      {cartItemCount > 0 && (
        <View style={[styles.cartBarWrap, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.cartBar} onPress={() => router.push(ROUTES.CART as never)}>
            <View style={styles.cartBarLeft}>
              <View style={styles.cartIcon}>
                <Ionicons name="cart-outline" size={17} color="#fff" />
              </View>
              <View>
                <ThemedText size="xs" weight="bold" style={{ color: '#F3C9A8' }}>
                  {cartItemCount} {t('itemsCount')}
                </ThemedText>
                <ThemedText size="base" weight="extrabold" style={{ color: '#fff' }}>
                  {formatPrice(cartTotal)}
                </ThemedText>
              </View>
            </View>
            <ThemedText size="sm" weight="extrabold" style={{ color: '#fff' }}>
              {t('viewCart')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chips: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  list: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  cartBarWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
  cartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#2B1A10',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#1C1712',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 8,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

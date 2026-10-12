import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ProductListSkeleton } from '@/components/Skeleton';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useFavorites } from '@/context/FavoritesContext';
import { useLocalization } from '@/context/LocalizationContext';
import { getProducts } from '@/services/products';
import { Product } from '@/types/Product';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { t } = useLocalization();
  

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts('all'),
  });

  const favoriteProducts = useMemo(() => {
    return products.filter((p: Product) => favorites.includes(p.id));
  }, [products, favorites]);

  return (
    <ThemedView variant="primary" style={styles.container}>

      <ScreenHeader title={t('favorites')} />

      {isLoading ? (
        <ProductListSkeleton />
      ) : (
        <FlatList
          data={favoriteProducts}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productsContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title={t('noFavorites')}
              message={t('noFavoritesMessage')}
              actionLabel={t('startShopping')}
              onAction={() => router.push(ROUTES.HOME as any)}
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
  productsContainer: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  productRow: {
    justifyContent: 'space-between',
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

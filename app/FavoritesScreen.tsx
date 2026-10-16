import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ProductListSkeleton } from '@/components/Skeleton';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useFavorites } from '@/context/FavoritesContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/Product';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { t } = useLocalization();
  

  // Only the favorited products, not the whole catalogue.
  const { products, isLoading } = useProducts({ ids: favorites, limit: 100 }, favorites.length > 0);

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

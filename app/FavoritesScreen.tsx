import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { ProductListSkeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useFavorites } from '@/context/FavoritesContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { getProducts } from '@/services/products';
import { LocalizedProduct } from '@/types/Product';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { FlatList, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const navigation = useNavigation();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const favoriteProducts = useMemo(() => {
    return products.filter((p: LocalizedProduct) => favorites.includes(p.id));
  }, [products, favorites]);

  return (
    <ThemedView variant="primary" style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary[500]} />
      
      {/* Header */}
      <ThemedView variant="primary" style={[styles.header, { backgroundColor: theme.primary[500] }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text.inverse} />
        </TouchableOpacity>
        <ThemedText variant="inverse" size="2xl" weight="bold">
          {t('favorites')}
        </ThemedText>
      </ThemedView>

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
              onAction={() => navigation.navigate(ROUTES.HOME as never)}
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
    padding: 20,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
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

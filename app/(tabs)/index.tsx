import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { ProductListSkeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { tokens } from '@/constants/tokens';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { getCategories } from '@/services/categories';
import { getOrders } from '@/services/orders';
import { getUserInfo } from '@/services/user';
import { ROUTES } from '@/constants/routes';
import { router } from 'expo-router';
import { useCartContext } from '@/context/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useProducts } from '@/hooks/useProducts';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Category } from '@/types/Category';
import { Product } from '@/types/Product';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { imageUrl } from '@/constants/format';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Cycled tint palette for category chips, matching the el3amer brand sheet.
const CATEGORY_TINTS = [
  { bg: '#FFF3EB', ink: '#C94A0A' },
  { bg: '#FFFBEB', ink: '#A16207' },
  { bg: '#E4F2F1', ink: '#0F6F6C' },
  { bg: '#FEF2F2', ink: '#B91C1C' },
  { bg: '#EFF6FF', ink: '#2563EB' },
  { bg: '#F0FDF4', ink: '#15803D' },
  { bg: '#FAF6F2', ink: '#7C6F60' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'price_low' | 'price_high'>('name');

  const { theme } = useTheme();
  const { t, isRtl } = useLocalization();
  const { user } = useAuth();
  const { addToCart } = useCartContext();
  const formatPrice = useCurrency();
  const insets = useSafeAreaInsets();
  const [bannerIndex, setBannerIndex] = useState(0);

  // Search runs on the server (the catalogue is too big to filter here), so
  // wait for a pause in typing before asking.
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { products, total, isLoading, refetch, isRefetching, loadMore, isFetchingNextPage } =
    useProducts({ search, sort: sortBy });
  const settings = useStoreSettings();

  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: me } = useQuery({
    queryKey: ['me', user?.id],
    queryFn: () => getUserInfo(String(user!.id)),
    enabled: !!user,
  });
  const address: string | undefined = me?.user?.address;

  const { data: pastOrders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: !!user,
  });

  const categories = useMemo(() => {
    const allCategory: Category = { id: 'all', name: t('cat_all'), icon: 'apps-outline' };
    return [allCategory, ...fetchedCategories];
  }, [fetchedCategories, t]);

  // Most recently ordered distinct items, newest order first — real reorder
  // history, not fabricated "popular" data.
  const reorderItems = useMemo(() => {
    const seen = new Map<number, (typeof pastOrders)[number]['items'][number]>();
    for (const order of pastOrders) {
      for (const item of order.items) {
        if (!seen.has(item.id)) seen.set(item.id, item);
      }
    }
    return Array.from(seen.values()).slice(0, 6);
  }, [pastOrders]);

  const banners = useMemo(
    () => [
      {
        eyebrow: t('bannerEyebrow1'),
        title: t('bannerTitle1').replace('{eta}', String(settings?.etaMinutes ?? 30)),
        sub: t('bannerSub1'),
      },
      {
        eyebrow: t('bannerEyebrow2'),
        title: settings?.deliveryFee
          ? t('bannerTitle2').replace('{fee}', formatPrice(settings.deliveryFee))
          : t('freeDeliveryAll'),
        sub: t('bannerSub2'),
      },
      { eyebrow: t('bannerEyebrow3'), title: t('bannerTitle3'), sub: t('bannerSub3') },
    ],
    [t, settings, formatPrice],
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greetingMorning');
    if (hour < 18) return t('greetingAfternoon');
    return t('greetingEvening');
  }, [t]);

  const firstName = user?.fullName?.split(' ')[0];

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
        <TouchableOpacity style={styles.brandRow} onPress={() => router.push(ROUTES.ADDRESSES as never)}>
          <Ionicons name="location-outline" size={20} color={theme.primary[500]} />
          <View style={styles.brandText}>
            <ThemedText size="sm" weight="bold">{t('deliverTo')}</ThemedText>
            <ThemedText variant="tertiary" size="xs" numberOfLines={1} style={styles.tagline}>
              {address || t('setAddress')}
            </ThemedText>
          </View>
          <Ionicons name="chevron-down" size={16} color={theme.gray[400]} />
        </TouchableOpacity>

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

      {settings?.isOpen === false && (
        <View style={[styles.closedNotice, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <Ionicons name="moon-outline" size={18} color="#B91C1C" />
          <View style={{ flex: 1 }}>
            <ThemedText size="xs" weight="extrabold" style={{ color: '#B91C1C' }}>{t('storeClosedTitle')}</ThemedText>
            <ThemedText size="xs" style={{ color: '#7C6F60', marginTop: 2, lineHeight: 17 }}>{t('storeClosedBody')}</ThemedText>
          </View>
        </View>
      )}

      {/* Promo banner */}
      <View style={styles.bannerWrap}>
        {/* Solid fill + soft circle instead of expo-linear-gradient: no native
            module needed, so it renders on any existing dev build. */}
        <View style={[styles.banner, { backgroundColor: theme.primary[500] }]}>
          <View style={styles.bannerCircle} />
          <ThemedText size="xs" weight="bold" style={{ color: theme.primary[200], letterSpacing: 1 }}>
            {banners[bannerIndex].eyebrow}
          </ThemedText>
          <ThemedText variant="inverse" size="lg" weight="extrabold" style={styles.bannerTitle}>
            {banners[bannerIndex].title}
          </ThemedText>
          <ThemedText size="sm" style={{ color: theme.primary[100], marginTop: 4 }}>
            {banners[bannerIndex].sub}
          </ThemedText>
          <View style={styles.bannerDots}>
            {banners.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setBannerIndex(i)} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                <View
                  style={[
                    styles.bannerDot,
                    { width: i === bannerIndex ? 18 : 6, backgroundColor: i === bannerIndex ? '#fff' : 'rgba(255,255,255,0.4)' },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat, index) => {
          const tint = CATEGORY_TINTS[index % CATEGORY_TINTS.length];
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => router.push({ pathname: ROUTES.CATEGORY as never, params: { category: cat.id } })}
            >
              <View
                style={[
                  styles.categoryCircle,
                  { backgroundColor: tint.bg },
                ]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={22}
                  color={tint.ink}
                />
              </View>
              <ThemedText
                variant="secondary"
                size="xs"
                weight="bold"
                style={styles.categoryLabel}
                numberOfLines={1}
              >
                {cat.name}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bought before (real reorder history) */}
      {reorderItems.length > 0 && (
        <View style={styles.reorderSection}>
          <ThemedText variant="primary" size="base" weight="extrabold" style={styles.reorderTitle}>
            {t('boughtBefore')}
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reorderContent}
          >
            {reorderItems.map((item) => {
              const photo = imageUrl(item.image, 200);
              return (
                <View
                  key={item.id}
                  style={[styles.reorderCard, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}
                >
                  <View style={[styles.reorderThumb, { backgroundColor: theme.gray[50] }]}>
                    <Image source={{ uri: photo }} style={styles.reorderThumbImage} contentFit="contain" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <ThemedText size="xs" weight="bold" numberOfLines={1}>{item.name}</ThemedText>
                    <ThemedText variant="tertiary" size="xs" style={{ marginTop: 1 }}>
                      {formatPrice(item.price)}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => addToCart(item as unknown as Product)}
                    style={[styles.reorderAddBtn, { borderColor: theme.primary[500] }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <ThemedText size="xs" weight="extrabold" style={{ color: theme.primary[500] }}>
                      {t('add')}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Result count & sort */}
      <View style={styles.sortContainer}>
        <ThemedText variant="tertiary" size="sm">
          {total} {t('itemsCount')}
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

      {isLoading && !isRefetching ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {listHeader}
          <ProductListSkeleton />
        </ScrollView>
      ) : (
        <FlatList
          data={products}
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={styles.pageSpinner} color={theme.primary[500]} /> : null
          }
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
              actionLabel={searchQuery ? t('cat_all') : undefined}
              onAction={() => setSearchQuery('')}
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
  closedNotice: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: tokens.space.xl,
    marginBottom: 12,
  },
  pageSpinner: {
    marginVertical: 16,
  },
  header: {
    paddingHorizontal: tokens.space.xl,
    paddingBottom: tokens.space.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
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
  bannerWrap: {
    paddingHorizontal: 20,
  },
  banner: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  bannerCircle: {
    position: 'absolute',
    start: -30,
    bottom: -40,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  bannerTitle: {
    marginTop: 8,
    maxWidth: 240,
    lineHeight: 24,
  },
  bannerDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 18,
  },
  bannerDot: {
    height: 6,
    borderRadius: 999,
  },
  reorderSection: {
    paddingTop: 24,
  },
  reorderTitle: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  reorderContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  reorderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: 200,
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
  },
  reorderThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  reorderThumbImage: {
    width: '100%',
    height: '100%',
  },
  reorderAddBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
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

import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatCount } from '@/constants/format';
import { ROUTES } from '@/constants/routes';
import { useLocalization } from '@/context/LocalizationContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTheme } from '@/hooks/useTheme';
import { getOrders } from '@/services/orders';
import { Order } from '@/types/Order';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import React from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OrdersScreen() {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const formatPrice = useCurrency();

  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const OrderItem = ({ order }: { order: Order }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: ROUTES.ORDER_DETAILS as any, params: { order: JSON.stringify(order) } })}
    >
      <View style={[styles.orderCard, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
        <View style={styles.orderHeader}>
          <View>
            <ThemedText size="sm" weight="extrabold">#AMR-{order.id}</ThemedText>
            <ThemedText variant="tertiary" size="xs" style={{ marginTop: 2 }}>
              {new Date(order.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status, theme) + '20' },
            ]}
          >
            <ThemedText style={{ color: getStatusColor(order.status, theme) }} size="xs" weight="extrabold">
              {t(`status_${order.status}`)}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.orderDivider, { backgroundColor: theme.gray[100] }]} />

        <View style={styles.orderFooter}>
          <ThemedText variant="tertiary" size="sm">
            {formatCount(order.items.length)}
          </ThemedText>
          <ThemedText size="base" weight="extrabold" style={{ color: theme.primary[500] }}>
            {formatPrice(order.totalAmount)}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView variant="primary" style={styles.container}>

      <ScreenHeader title={t('myOrders')} />

      {isLoading && !isRefetching ? (
        <OrdersSkeleton theme={theme} />
      ) : (
        <FlatList
          data={orders}
          renderItem={({ item }) => <OrderItem order={item} />}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[theme.primary[500]]}
              tintColor={theme.primary[500]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title={t('noOrders')}
              message={t('noOrdersMessage')}
              actionLabel={t('startShopping')}
              onAction={() => router.push(ROUTES.HOME as any)}
            />
          }
        />
      )}
    </ThemedView>
  );
}

const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'delivered': return theme.status.success;
    case 'shipped': return theme.primary[500];
    case 'pending':
    case 'confirmed': return theme.status.warning;
    case 'cancelled': return theme.status.error;
    default: return theme.gray[500];
  }
};

const OrdersSkeleton = ({ theme }: { theme: any }) => (
  <View style={styles.listContainer}>
    {[1, 2, 3].map(i => (
      <View key={i} style={[styles.orderCard, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 10 }} />
        <Skeleton width="40%" height={12} style={{ marginBottom: 18 }} />
        <View style={[styles.orderDivider, { backgroundColor: theme.gray[100] }]} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <Skeleton width="30%" height={14} />
          <Skeleton width="25%" height={18} />
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingTop: 4,
    flexGrow: 1,
  },
  orderCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  orderDivider: {
    height: 1,
    marginVertical: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { getOrders } from '@/services/orders';
import { Order } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { FlatList, RefreshControl, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';

export default function OrdersScreen() {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const navigation = useNavigation();

  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const OrderItem = ({ order }: { order: Order }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => (navigation.navigate as any)(ROUTES.ORDER_DETAILS, { order })}
    >
      <ThemedView variant="card" style={styles.orderCard}>
        <ThemedView variant="default" style={styles.orderHeader}>
          <ThemedView variant="default">
            <ThemedText variant="primary" weight="bold">
              Order #{order.id.substring(0, 8).toUpperCase()}
            </ThemedText>
            <ThemedText variant="tertiary" size="sm">
              {new Date(order.createdAt).toLocaleDateString()}
            </ThemedText>
          </ThemedView>
          <ThemedView 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(order.status, theme) + '20' }
            ]}
          >
            <ThemedText 
              style={{ color: getStatusColor(order.status, theme), fontSize: 12 }} 
              weight="bold"
            >
              {order.status.toUpperCase()}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.orderDivider} />

        <ThemedView variant="default" style={styles.orderFooter}>
          <ThemedText variant="secondary">
            {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
          </ThemedText>
          <ThemedText variant="success" weight="bold" size="lg">
            ${order.total.toFixed(2)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

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
          {t('myOrders')}
        </ThemedText>
      </ThemedView>

      {isLoading && !isRefetching ? (
        <OrdersSkeleton />
      ) : (
        <FlatList
          data={orders}
          renderItem={({ item }) => <OrderItem order={item} />}
          keyExtractor={item => item.id}
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
              onAction={() => navigation.navigate(ROUTES.HOME as never)}
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
    case 'pending': return theme.primary[500];
    case 'cancelled': return theme.status.error;
    default: return theme.gray[500];
  }
};

const OrdersSkeleton = () => (
  <ThemedView style={styles.listContainer}>
    {[1, 2, 3].map(i => (
      <ThemedView key={i} variant="card" style={[styles.orderCard]}>
        <Skeleton width="60%" height={20} style={{ marginBottom: 12 }} />
        <Skeleton width="40%" height={14} style={{ marginBottom: 20 }} />
        <ThemedView style={styles.orderDivider} />
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <Skeleton width="30%" height={16} />
          <Skeleton width="25%" height={20} />
        </ThemedView>
      </ThemedView>
    ))}
  </ThemedView>
);

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
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
});

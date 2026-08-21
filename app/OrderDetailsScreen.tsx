import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { env } from '@/config/env';
import { formatUnit } from '@/constants/format';
import { useLocalization } from '@/context/LocalizationContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTheme } from '@/hooks/useTheme';
import { cancelOrder } from '@/services/orders';
import { Order } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

const STAGES: { key: Order['status']; label: string }[] = [
  { key: 'pending', label: 'Order received' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const [order, setOrder] = useState<Order>(
    typeof params.order === 'string' ? JSON.parse(params.order) : params.order,
  );
  const { theme } = useTheme();
  const { t } = useLocalization();
  const formatPrice = useCurrency();
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const isCancelled = order.status === 'cancelled';
  const currentStage = isCancelled ? -1 : STAGES.findIndex(s => s.key === order.status);
  const canCancel = order.status === 'pending' || order.status === 'confirmed';

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      // The cancel endpoint returns a bare order row with no items/user
      // include, so only take the fields it actually updated.
      const updated = await cancelOrder(order.id);
      setOrder(prev => ({ ...prev, status: updated.status, updatedAt: updated.updatedAt }));
    } catch (error) {
      console.error('Cancel order error:', error);
      Alert.alert(t('error'), t('orderFailedMessage'));
    } finally {
      setIsCancelling(false);
      setConfirmingCancel(false);
    }
  };

  const OrderItem = ({ item }: { item: any }) => (
    <View style={styles.itemRow}>
      <View style={[styles.emojiContainer, { backgroundColor: theme.gray[50] }]}>
        <Image
          source={{
            uri: item.image?.startsWith('http')
              ? item.image
              : `${env.apiOrigin}${item.image?.startsWith('/') ? '' : '/'}${item.image}`,
          }}
          style={styles.itemImage}
          contentFit="contain"
        />
      </View>
      <View style={styles.itemInfo}>
        <ThemedText size="sm" weight="bold" numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText variant="tertiary" size="xs" style={{ marginTop: 2 }}>
          {item.quantity} × {formatPrice(item.price)} · {formatUnit(item.unit)}
        </ThemedText>
      </View>
      <ThemedText size="sm" weight="bold">
        {formatPrice(item.quantity * item.price)}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView variant="primary" style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background.primary} />

      <ScreenHeader title={`#AMR-${order.id}`} subtitle={new Date(order.createdAt).toLocaleString()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status timeline */}
        <View style={[styles.card, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
          {isCancelled ? (
            <View style={styles.cancelledRow}>
              <Ionicons name="close-circle" size={22} color={theme.status.error} />
              <View style={{ flex: 1 }}>
                <ThemedText size="sm" weight="extrabold" style={{ color: theme.status.error }}>
                  Order cancelled
                </ThemedText>
                <ThemedText variant="tertiary" size="xs" style={{ marginTop: 3 }}>
                  Any payment made will be refunded within 3 business days.
                </ThemedText>
              </View>
            </View>
          ) : (
            STAGES.map((stage, i) => {
              const done = i <= currentStage;
              const isLast = i === STAGES.length - 1;
              return (
                <View key={stage.key} style={styles.timelineRow}>
                  <View style={styles.timelineDotCol}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: done ? theme.primary[500] : theme.background.card,
                          borderColor: done ? theme.primary[500] : theme.gray[200],
                        },
                      ]}
                    >
                      {done && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.dotLine,
                          { backgroundColor: i < currentStage ? theme.primary[500] : theme.gray[100] },
                        ]}
                      />
                    )}
                  </View>
                  <View style={{ paddingBottom: isLast ? 0 : 20 }}>
                    <ThemedText
                      size="sm"
                      weight="bold"
                      variant={done ? 'primary' : 'tertiary'}
                    >
                      {stage.label}
                    </ThemedText>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Items List */}
        <ThemedText size="base" weight="extrabold" style={styles.sectionTitle}>
          Items ({order.items.length})
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
          {order.items.map((item: any, index: number) => (
            <React.Fragment key={item.id}>
              <OrderItem item={item} />
              {index < order.items.length - 1 && <View style={[styles.divider, { backgroundColor: theme.gray[100] }]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Payment Summary */}
        <ThemedText size="base" weight="extrabold" style={styles.sectionTitle}>
          Payment Summary
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
          <View style={styles.summaryRow}>
            <ThemedText variant="tertiary" size="sm">Subtotal</ThemedText>
            <ThemedText size="sm" weight="bold">{formatPrice(order.totalAmount)}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText variant="tertiary" size="sm">Delivery Fee</ThemedText>
            <ThemedText size="sm" weight="bold" style={{ color: theme.status.success }}>FREE</ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.gray[100] }]} />
          <View style={styles.summaryRow}>
            <ThemedText size="base" weight="extrabold">Total</ThemedText>
            <ThemedText size="lg" weight="extrabold" style={{ color: theme.primary[500] }}>
              {formatPrice(order.totalAmount)}
            </ThemedText>
          </View>
        </View>

        {canCancel && (
          <View style={styles.cancelSection}>
            {!confirmingCancel ? (
              <TouchableOpacity onPress={() => setConfirmingCancel(true)} style={styles.cancelLink}>
                <ThemedText size="sm" weight="bold" style={{ color: theme.status.error }}>
                  {t('cancel')} order
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={[styles.cancelBox, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <ThemedText size="sm" weight="extrabold" style={{ color: '#B91C1C' }}>
                  Cancel this order?
                </ThemedText>
                <ThemedText variant="tertiary" size="xs" style={{ marginTop: 4, lineHeight: 18 }}>
                  Your order is currently being processed. Refunds may take up to 3 business days.
                </ThemedText>
                <View style={styles.cancelActions}>
                  <TouchableOpacity
                    style={[styles.cancelActionBtn, { backgroundColor: theme.background.card, borderColor: theme.gray[200] }]}
                    onPress={() => setConfirmingCancel(false)}
                  >
                    <ThemedText size="xs" weight="extrabold">Keep order</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelActionBtn, { backgroundColor: theme.status.error }]}
                    onPress={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <ThemedText variant="inverse" size="xs" weight="extrabold">Yes, cancel</ThemedText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 22,
  },
  cancelledRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineDotCol: {
    alignItems: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  emojiContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelSection: {
    marginTop: -6,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  cancelActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  cancelActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

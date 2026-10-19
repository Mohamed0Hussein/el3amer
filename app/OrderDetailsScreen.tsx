import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatQuantity, formatUnit, lineTotal, priceWithUnit, imageUrl } from '@/constants/format';
import { ROUTES } from '@/constants/routes';
import { useLocalization } from '@/context/LocalizationContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useTheme } from '@/hooks/useTheme';
import { queryClient } from '@/lib/queryClient';
import { cancelOrder, decideOrder, getOrderById, payOrder } from '@/services/orders';
import { Order } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const STAGES = ['pending', 'confirmed', 'shipped', 'delivered'] as const;

const STAGE_ICONS: Record<Order['status'], keyof typeof Ionicons.glyphMap> = {
  pending: 'receipt-outline',
  confirmed: 'basket-outline',
  shipped: 'bicycle-outline',
  delivered: 'checkmark-done-outline',
  cancelled: 'close-circle-outline',
};

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const [initial] = useState<Order>(() =>
    typeof params.order === 'string' ? JSON.parse(params.order) : params.order,
  );
  // Keeps polling while the order can still change, so the store's updates
  // show up without leaving the screen.
  const { data: order = initial, refetch } = useQuery({
    queryKey: ['order', initial.id],
    queryFn: () => getOrderById(initial.id),
    initialData: initial,
    refetchInterval: (query) =>
      ['delivered', 'cancelled'].includes(query.state.data?.status ?? '') ? false : 30_000,
  });
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  const { theme } = useTheme();
  const { t, language } = useLocalization();
  const formatPrice = useCurrency();
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [deciding, setDeciding] = useState<'continue' | 'cancel' | null>(null);
  const settings = useStoreSettings();

  const isCancelled = order.status === 'cancelled';
  const currentStage = isCancelled ? -1 : STAGES.indexOf(order.status as (typeof STAGES)[number]);
  const awaitingDecision = !!order.decisionRequestedAt && !isCancelled;
  const canCancel = (order.status === 'pending' || order.status === 'confirmed') && !awaitingDecision;
  const deliveryFee = order.deliveryFee ?? 0;
  const unavailableItems = order.items.filter((item) => item.unavailable);
  const totalWithoutMissing = order.totalAmount -
    unavailableItems.reduce((sum, item) => sum + lineTotal(item.price, item.quantity), 0);
  const isCard = order.paymentMethod === 'card';
  const needsPayment = isCard && order.paymentStatus !== 'paid' && order.status === 'pending';
  const [startingPayment, setStartingPayment] = useState(false);

  const handlePay = async () => {
    setStartingPayment(true);
    try {
      const url = await payOrder(order.id, language);
      router.push({ pathname: ROUTES.PAYMENT as any, params: { orderId: order.id, url, back: '1' } });
    } catch {
      Alert.alert(t('error'), t('paymentStartFailed'));
    } finally {
      setStartingPayment(false);
    }
  };

  const handleDecision = async (action: 'continue' | 'cancel') => {
    setDeciding(action);
    try {
      const updated = await decideOrder(order.id, action);
      queryClient.setQueryData(['order', order.id], updated);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch {
      Alert.alert(t('error'), t('orderFailedMessage'));
    } finally {
      setDeciding(null);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      // The cancel endpoint returns a bare order row with no items/user
      // include, so only take the fields it actually updated.
      const updated = await cancelOrder(order.id);
      queryClient.setQueryData<Order>(['order', order.id], (prev) =>
        prev && { ...prev, status: updated.status, updatedAt: updated.updatedAt },
      );
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error) {
      console.error('Cancel order error:', error);
      Alert.alert(t('error'), t('orderFailedMessage'));
    } finally {
      setIsCancelling(false);
      setConfirmingCancel(false);
    }
  };

  const OrderItem = ({ item }: { item: any }) => (
    <View style={[styles.itemRow, item.unavailable && { opacity: 0.5 }]}>
      <View style={[styles.emojiContainer, { backgroundColor: theme.gray[50] }]}>
        <Image
          source={{
            uri: imageUrl(item.image, 200),
          }}
          style={styles.itemImage}
          contentFit="contain"
        />
      </View>
      <View style={styles.itemInfo}>
        <ThemedText size="sm" weight="bold" numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText variant="tertiary" size="xs" style={{ marginTop: 2 }}>
          {formatQuantity(item.quantity, item.unit)} × {priceWithUnit(formatPrice(item.price), item.unit)} · {formatUnit(item.unit)}
        </ThemedText>
        {item.unavailable && (
          <ThemedText size="xs" weight="bold" style={{ color: theme.status.error, marginTop: 2 }}>
            {t('unavailable')}
          </ThemedText>
        )}
      </View>
      <ThemedText size="sm" weight="bold">
        {formatPrice(lineTotal(item.price, item.quantity))}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView variant="primary" style={styles.container}>

      <ScreenHeader
        title={`#AMR-${order.id}`}
        subtitle={`${t('placedAt')} ${new Date(order.createdAt).toLocaleString()}`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary[500]} colors={[theme.primary[500]]} />}
      >
        {/* Current status hero */}
        <View style={[styles.hero, { backgroundColor: isCancelled ? '#FEF2F2' : theme.primary[50] }]}>
          <View style={[styles.heroIcon, { backgroundColor: isCancelled ? theme.status.error : theme.primary[500] }]}>
            <Ionicons name={STAGE_ICONS[order.status]} size={26} color="#fff" />
          </View>
          <ThemedText size="lg" weight="extrabold" style={[{ marginTop: 12 }, isCancelled && { color: '#7F1D1D' }]}>
            {t(`status_${order.status}`)}
          </ThemedText>
          {!isCancelled && order.status !== 'delivered' && (
            <ThemedText variant="tertiary" size="xs" style={{ marginTop: 4 }}>
              {t('deliveryEta').replace('{eta}', String(settings?.etaMinutes ?? 30))}
            </ThemedText>
          )}
        </View>

        {/* The store couldn't find some items: the customer decides */}
        {awaitingDecision && (
          <View style={[styles.decisionBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <ThemedText size="sm" weight="extrabold" style={{ color: '#A16207' }}>
              {t('itemsUnavailableTitle')}
            </ThemedText>
            {/* Light card in both themes, so its text colors are fixed too. */}
            <ThemedText size="xs" style={{ marginTop: 4, lineHeight: 18, color: '#57534E' }}>
              {t('itemsUnavailableBody')}
            </ThemedText>
            {unavailableItems.map((item) => (
              <ThemedText key={item.id} size="sm" weight="bold" style={{ marginTop: 6, color: '#1C1917' }}>
                • {item.name} ({formatQuantity(item.quantity, item.unit)})
              </ThemedText>
            ))}
            <View style={styles.decisionActions}>
              <TouchableOpacity
                style={[styles.decisionBtn, { backgroundColor: theme.background.card, borderColor: theme.gray[200] }]}
                onPress={() => handleDecision('cancel')}
                disabled={!!deciding}
              >
                {deciding === 'cancel' ? (
                  <ActivityIndicator size="small" color={theme.status.error} />
                ) : (
                  <ThemedText size="xs" weight="extrabold" style={{ color: theme.status.error }}>{t('cancelOrder')}</ThemedText>
                )}
              </TouchableOpacity>
              {unavailableItems.length < order.items.length && (
                <TouchableOpacity
                  style={[styles.decisionBtn, { backgroundColor: theme.primary[500], borderColor: theme.primary[500] }]}
                  onPress={() => handleDecision('continue')}
                  disabled={!!deciding}
                >
                  {deciding === 'continue' ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ThemedText variant="inverse" size="xs" weight="extrabold" numberOfLines={1}>
                      {t('continueWithout')} · {formatPrice(totalWithoutMissing)}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Status timeline */}
        <View style={[styles.card, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
          {isCancelled ? (
            <View style={styles.cancelledRow}>
              <Ionicons name="close-circle" size={22} color={theme.status.error} />
              <View style={{ flex: 1 }}>
                <ThemedText size="sm" weight="extrabold" style={{ color: theme.status.error }}>
                  {t('orderCancelled')}
                </ThemedText>
                <ThemedText variant="tertiary" size="xs" style={{ marginTop: 3 }}>
                  {t('refundNote')}
                </ThemedText>
              </View>
            </View>
          ) : (
            STAGES.map((stage, i) => {
              const done = i <= currentStage;
              const isLast = i === STAGES.length - 1;
              return (
                <View key={stage} style={styles.timelineRow}>
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
                      {t(`status_${stage}`)}
                    </ThemedText>
                    {i === 0 && (
                      <ThemedText variant="tertiary" size="xs" style={{ marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </ThemedText>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Items List */}
        <ThemedText size="base" weight="extrabold" style={styles.sectionTitle}>
          {t('orderItems')} ({order.items.length})
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
          {t('orderSummary')}
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
          <View style={styles.summaryRow}>
            <ThemedText variant="tertiary" size="sm">{t('subtotal')}</ThemedText>
            <ThemedText size="sm" weight="bold">{formatPrice(order.totalAmount - deliveryFee)}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText variant="tertiary" size="sm">{t('deliveryFee')}</ThemedText>
            <ThemedText size="sm" weight="bold" style={deliveryFee === 0 ? { color: theme.status.success } : undefined}>
              {deliveryFee > 0 ? formatPrice(deliveryFee) : t('free')}
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.gray[100] }]} />
          <View style={styles.summaryRow}>
            <ThemedText size="base" weight="extrabold">{t('total')}</ThemedText>
            <ThemedText size="lg" weight="extrabold" style={{ color: theme.primary[500] }}>
              {formatPrice(order.totalAmount)}
            </ThemedText>
          </View>
          <View style={[styles.summaryRow, { marginTop: 4 }]}>
            <ThemedText variant="tertiary" size="sm">{isCard ? t('payWithCard') : t('cashOnDelivery')}</ThemedText>
            {isCard && (
              <ThemedText
                size="sm"
                weight="bold"
                style={{
                  color: order.paymentStatus === 'paid'
                    ? theme.status.success
                    : order.paymentStatus === 'failed' ? theme.status.error : theme.text.secondary,
                }}
              >
                {order.paymentStatus === 'paid'
                  ? t('paymentPaid')
                  : order.paymentStatus === 'failed' ? t('paymentFailed') : t('paymentAwaiting')}
              </ThemedText>
            )}
          </View>
        </View>

        {needsPayment && (
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: theme.primary[500] }, startingPayment && { opacity: 0.7 }]}
            onPress={handlePay}
            disabled={startingPayment}
          >
            {startingPayment ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText variant="inverse" size="base" weight="extrabold">
                {t('payNow')} · {formatPrice(order.totalAmount)}
              </ThemedText>
            )}
          </TouchableOpacity>
        )}

        {canCancel && (
          <View style={styles.cancelSection}>
            {!confirmingCancel ? (
              <TouchableOpacity onPress={() => setConfirmingCancel(true)} style={styles.cancelLink}>
                <ThemedText size="sm" weight="bold" style={{ color: theme.status.error }}>
                  {t('cancelOrder')}
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={[styles.cancelBox, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <ThemedText size="sm" weight="extrabold" style={{ color: '#B91C1C' }}>
                  {t('cancelOrderQ')}
                </ThemedText>
                <ThemedText size="xs" style={{ marginTop: 4, lineHeight: 18, color: '#7F1D1D' }}>
                  {t('cancelOrderBody')}
                </ThemedText>
                <View style={styles.cancelActions}>
                  <TouchableOpacity
                    style={[styles.cancelActionBtn, { backgroundColor: theme.background.card, borderColor: theme.gray[200] }]}
                    onPress={() => setConfirmingCancel(false)}
                  >
                    <ThemedText size="xs" weight="extrabold">{t('keepOrder')}</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelActionBtn, { backgroundColor: theme.status.error }]}
                    onPress={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <ThemedText variant="inverse" size="xs" weight="extrabold">{t('yesCancel')}</ThemedText>
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
  hero: {
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
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
  decisionBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },
  decisionActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  decisionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButton: {
    marginTop: 16,
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
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

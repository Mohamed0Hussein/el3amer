import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { formatQuantity, localText } from '@/constants/format';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useCartContext } from '@/context/CartContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { queryClient } from '@/lib/queryClient';
import { useTheme } from '@/hooks/useTheme';
import { createOrder, getPaymentConfig, quoteOrder, setPendingPayment } from '@/services/orders';
import { isBusy, isClosed } from '@/services/settings';
import { PromoError } from '@/types/Order';
import { getUserInfo } from '@/services/user';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PaymentMethod = 'cash' | 'card';

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const { t, language } = useLocalization();
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCartContext();
  const formatPrice = useCurrency();
  const insets = useSafeAreaInsets();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isPlacing, setIsPlacing] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<string | null>(null);

  const { data: me } = useQuery({
    queryKey: ['me', user?.id],
    queryFn: () => getUserInfo(String(user!.id)),
    enabled: !!user,
  });

  const { data: payConfig } = useQuery({
    queryKey: ['paymentConfig'],
    queryFn: getPaymentConfig,
    staleTime: 5 * 60_000,
  });
  const method: PaymentMethod = payConfig?.card ? paymentMethod : 'cash';

  const settings = useStoreSettings();
  const shippingAddress: string | undefined = me?.user?.address;
  const pin = me?.user?.latitude != null ? { latitude: me.user.latitude, longitude: me.user.longitude } : null;
  const phone: string | undefined = me?.user?.phone;

  // The backend prices it all: the pin's zone fee, the promo discount, the total.
  const items = cart.map((item) => ({ itemId: Number(item.id), quantity: item.quantity }));
  const { data: quote, refetch: requote, isFetching: quoting, error: quoteError } = useQuery({
    queryKey: ['quote', items, pin?.latitude, pin?.longitude, promo],
    queryFn: () => quoteOrder({ items, shippingLatitude: pin!.latitude, shippingLongitude: pin!.longitude, promoCode: promo ?? undefined }),
    enabled: !!pin && items.length > 0,
  });

  const closed = quote ? quote.storeStatus === 'closed' : isClosed(settings);
  const busy = quote ? quote.storeStatus === 'busy' : isBusy(settings);
  const outsideZone = !!quote && !quote.deliverable;
  const fee = quote?.fee ?? undefined;
  const discount = quote?.discount ?? 0;
  const total = quote?.total ?? cartTotal + (fee ?? 0);
  const promoMessage = (error: PromoError) =>
    error.error === 'minOrder'
      ? t('promoMinOrder').replace('{min}', formatPrice(error.minOrder ?? 0))
      : t(({ invalid: 'promoInvalid', expired: 'promoExpired', usedUp: 'promoUsedUp', alreadyUsed: 'promoAlreadyUsed' } as const)[error.error]);
  // Over a product's per-customer limit (this cart plus orders not yet delivered).
  const limitText = (data: any) => {
    const item = cart.find((i) => Number(i.id) === data.itemId);
    return {
      title: t('limitTitle').replace('{name}', item ? localText(item.name, item.nameAr) : ''),
      body: data.left > 0 ? t('limitBody').replace('{n}', formatQuantity(data.left, item?.unit)) : t('limitNone'),
    };
  };
  const quoteLimit = (quoteError as any)?.response?.data?.code === 'maxPerCustomer' ? limitText((quoteError as any).response.data) : null;
  // Waits for the quote so the total shown is the one that gets charged.
  const canOrder = !!shippingAddress && !!phone && !!pin && !!quote && quote.deliverable && !closed && !quoting;

  const handleConfirm = async () => {
    if (!user || cart.length === 0 || !canOrder) return;

    setIsPlacing(true);
    try {
      const { order, paymentUrl } = await createOrder({
        userId: Number(user.id),
        items,
        shippingAddress,
        shippingLatitude: pin!.latitude,
        shippingLongitude: pin!.longitude,
        deliveryFee: quote!.fee ?? undefined,
        promoCode: promo && !quote!.promoError ? promo : undefined,
        paymentMethod: method,
        language,
      });

      clearCart();
      if (paymentUrl) {
        setPendingPayment(order.id, paymentUrl);
        router.replace({ pathname: ROUTES.PAYMENT as any, params: { orderId: order.id } });
      } else {
        router.replace({ pathname: ROUTES.ORDER_DETAILS as any, params: { order: JSON.stringify(order) } });
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      const data = error?.response?.data;
      if (error?.response?.status === 409 && data?.deliveryFee !== undefined) {
        // Zones changed since the quote: show the new fee before ordering.
        requote();
        Alert.alert(t('feeChangedTitle'), t('feeChangedBody').replace('{fee}', formatPrice(data.deliveryFee)));
      } else if (error?.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: ['settings'] });
        requote();
        Alert.alert(t('storeClosedTitle'), t('storeClosedBody'));
      } else if (data?.code === 'maxPerCustomer') {
        const { title, body } = limitText(data);
        Alert.alert(title, body);
      } else if (data?.promoError) {
        requote();
        Alert.alert(t('promoCode'), promoMessage(data.promoError));
      } else {
        Alert.alert(t('orderFailed'), t('orderFailedMessage'));
      }
    } finally {
      setIsPlacing(false);
    }
  };

  const paymentOptions: { id: PaymentMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'cash', label: t('cashOnDelivery'), icon: 'cash-outline' },
    ...(payConfig?.card ? [{ id: 'card' as const, label: t('payWithCard'), icon: 'card-outline' as const }] : []),
  ];

  return (
    <ThemedView variant="primary" style={styles.container}>

      <ScreenHeader title={t('checkout')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Address */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText size="sm" weight="extrabold">{t('deliveryAddress')}</ThemedText>
          <TouchableOpacity onPress={() => router.push(ROUTES.ADDRESSES as any)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ThemedText size="xs" weight="bold" style={{ color: theme.primary[500] }}>{t('changeAddress')}</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={[styles.card, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
          <View style={styles.addressRow}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primary[50] }]}>
              <Ionicons name="location-outline" size={20} color={theme.primary[500]} />
            </View>
            <ThemedText size="sm" variant={shippingAddress ? 'primary' : 'tertiary'} style={{ flex: 1, lineHeight: 20 }}>
              {shippingAddress || t('addAddressPrompt')}
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.gray[100], marginVertical: 12 }]} />
          <TouchableOpacity
            style={styles.addressRow}
            onPress={() => router.push(ROUTES.EDIT_PROFILE as any)}
            disabled={!!phone}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.primary[50] }]}>
              <Ionicons name="call-outline" size={20} color={theme.primary[500]} />
            </View>
            {phone ? (
              <ThemedText size="sm" style={{ flex: 1 }}>{phone}</ThemedText>
            ) : (
              <ThemedText size="sm" weight="bold" style={{ flex: 1, lineHeight: 20, color: theme.primary[500] }}>
                {t('addPhonePrompt')}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
        {quoteLimit && (
          <View style={[styles.zoneWarning, { backgroundColor: theme.tint.error.bg, borderColor: theme.tint.error.border }]}>
            <Ionicons name="alert-circle" size={18} color={theme.tint.error.strong} />
            <View style={{ flex: 1 }}>
              <ThemedText size="xs" weight="extrabold" style={{ color: theme.tint.error.strong }}>
                {quoteLimit.title}
              </ThemedText>
              <ThemedText size="xs" style={{ color: theme.tint.error.text, marginTop: 2, lineHeight: 17 }}>
                {quoteLimit.body}
              </ThemedText>
            </View>
          </View>
        )}
        {outsideZone && (
          <View style={[styles.zoneWarning, { backgroundColor: theme.tint.error.bg, borderColor: theme.tint.error.border }]}>
            <Ionicons name="alert-circle" size={18} color={theme.tint.error.strong} />
            <View style={{ flex: 1 }}>
              <ThemedText size="xs" weight="extrabold" style={{ color: theme.tint.error.strong }}>
                {t('outsideZoneTitle')}
              </ThemedText>
              <ThemedText size="xs" style={{ color: theme.tint.error.text, marginTop: 2, lineHeight: 17 }}>
                {t('outsideZoneBody')}
              </ThemedText>
            </View>
          </View>
        )}

        {closed && (
          <View style={[styles.zoneWarning, { backgroundColor: theme.tint.error.bg, borderColor: theme.tint.error.border }]}>
            <Ionicons name="moon-outline" size={18} color={theme.tint.error.strong} />
            <View style={{ flex: 1 }}>
              <ThemedText size="xs" weight="extrabold" style={{ color: theme.tint.error.strong }}>
                {t('storeClosedTitle')}
              </ThemedText>
              <ThemedText size="xs" style={{ color: theme.tint.error.text, marginTop: 2, lineHeight: 17 }}>
                {t('storeClosedBody')}
              </ThemedText>
            </View>
          </View>
        )}

        {busy && !closed && (
          <View style={[styles.zoneWarning, { backgroundColor: theme.tint.warning.bg, borderColor: theme.tint.warning.border }]}>
            <Ionicons name="time-outline" size={18} color={theme.tint.warning.strong} />
            <View style={{ flex: 1 }}>
              <ThemedText size="xs" weight="extrabold" style={{ color: theme.tint.warning.strong }}>
                {t('storeBusyTitle')}
              </ThemedText>
              <ThemedText size="xs" style={{ color: theme.tint.warning.text, marginTop: 2, lineHeight: 17 }}>
                {t('storeBusyBody').replace('{eta}', String(quote?.etaMinutes ?? settings?.busyEtaMinutes ?? 60))}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Promo code */}
        <ThemedText size="sm" weight="extrabold" style={styles.sectionTitle}>{t('promoCode')}</ThemedText>
        {promo ? (
          <View style={[styles.promoApplied, { backgroundColor: theme.background.card, borderColor: quote?.promoError ? theme.tint.error.border : theme.status.success }]}>
            <Ionicons name={quote?.promoError ? 'alert-circle' : 'pricetag'} size={18} color={quote?.promoError ? theme.tint.error.strong : theme.status.success} />
            <View style={{ flex: 1 }}>
              <ThemedText size="sm" weight="extrabold">{promo}</ThemedText>
              <ThemedText size="xs" style={{ color: quote?.promoError ? theme.tint.error.strong : theme.status.success, marginTop: 2 }}>
                {quote?.promoError ? promoMessage(quote.promoError) : quote ? t('promoSaved').replace('{amount}', formatPrice(discount)) : '…'}
              </ThemedText>
            </View>
            <TouchableOpacity onPress={() => setPromo(null)} hitSlop={10}>
              <ThemedText size="xs" weight="bold" style={{ color: theme.primary[500] }}>{t('remove')}</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.promoRow}>
            <View style={{ flex: 1 }}>
              <ThemedTextInput
                value={promoInput}
                onChangeText={setPromoInput}
                placeholder={t('promoPlaceholder')}
                autoCapitalize="characters"
                autoCorrect={false}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: theme.primary[500] }, !promoInput.trim() && { opacity: 0.5 }]}
              onPress={() => setPromo(promoInput.trim().toUpperCase())}
              disabled={!promoInput.trim()}
            >
              <ThemedText variant="inverse" size="sm" weight="extrabold">{t('apply')}</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment method */}
        <ThemedText size="sm" weight="extrabold" style={styles.sectionTitle}>{t('paymentMethod')}</ThemedText>
        <View style={styles.paymentList}>
          {paymentOptions.map((opt) => {
            const active = method === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setPaymentMethod(opt.id)}
                style={[
                  styles.paymentRow,
                  {
                    backgroundColor: theme.background.card,
                    borderColor: active ? theme.primary[500] : theme.gray[100],
                  },
                ]}
              >
                <View style={[styles.radioOuter, { borderColor: active ? theme.primary[500] : theme.gray[300] }]}>
                  {active && <View style={[styles.radioInner, { backgroundColor: theme.primary[500] }]} />}
                </View>
                <Ionicons name={opt.icon} size={20} color={active ? theme.primary[500] : theme.gray[500]} />
                <ThemedText size="sm" weight="bold" style={{ flex: 1 }}>{opt.label}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order summary */}
        <ThemedText size="sm" weight="extrabold" style={styles.sectionTitle}>{t('orderSummary')}</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
          <View style={styles.summaryRow}>
            <ThemedText variant="tertiary" size="sm">{t('subtotal')}</ThemedText>
            <ThemedText size="sm" weight="bold">{formatPrice(cartTotal)}</ThemedText>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <ThemedText variant="tertiary" size="sm">{t('discount')}</ThemedText>
              <ThemedText size="sm" weight="bold" style={{ color: theme.status.success }}>−{formatPrice(discount)}</ThemedText>
            </View>
          )}
          <View style={styles.summaryRow}>
            <ThemedText variant="tertiary" size="sm">
              {t('deliveryFee')}
            </ThemedText>
            <ThemedText size="sm" weight="bold" style={fee === 0 ? { color: theme.status.success } : undefined}>
              {fee === undefined ? '…' : fee > 0 ? formatPrice(fee) : t('free')}
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.gray[100] }]} />
          <View style={styles.summaryRow}>
            <ThemedText size="base" weight="extrabold">{t('total')}</ThemedText>
            <ThemedText size="lg" weight="extrabold" style={{ color: theme.primary[500] }}>
              {formatPrice(total)}
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background.secondary, borderColor: theme.gray[100], paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: theme.primary[500], shadowColor: theme.primary[700] },
            (isPlacing || !canOrder) && { opacity: 0.7 },
          ]}
          onPress={handleConfirm}
          disabled={isPlacing || !canOrder}
        >
          {isPlacing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <ThemedText variant="inverse" size="base" weight="extrabold">{t('confirmOrder')}</ThemedText>
              <ThemedText variant="inverse" size="base" weight="bold" style={{ marginLeft: 6 }}>
                · {formatPrice(total)}
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneWarning: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  paymentList: {
    gap: 10,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applyBtn: {
    paddingHorizontal: 18,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 999,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatCount, formatQuantity, formatUnit, lineTotal, localText, maxQuantity, priceWithUnit, imageUrl } from '@/constants/format';
import { useMyDelivery } from '@/hooks/useMyDelivery';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useCartContext } from '@/context/CartContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTheme } from '@/hooks/useTheme';
import { getUserInfo } from '@/services/user';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';

import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Cart = () => {

  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartTotal,
  } = useCartContext();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const formatPrice = useCurrency();
  // The customer's zone fee; checkout confirms it before ordering.
  const delivery = useMyDelivery();
  const fee = delivery?.deliverable ? delivery.fee ?? undefined : undefined;
  const total = cartTotal + (fee ?? 0);

  // The backend requires a non-null shippingAddress on every order — read it
  // fresh (AuthContext's cached user can be stale after an EditProfileScreen edit).
  const { data: me } = useQuery({
    queryKey: ['me', user?.id],
    queryFn: () => getUserInfo(String(user!.id)),
    enabled: !!user,
  });

  const handleCheckout = () => {
    if (cart.length === 0 || !user) return;

    const shippingAddress: string | undefined = me?.user?.address;
    if (!shippingAddress) {
      Alert.alert(
        t('deliveryAddress'),
        t('addAddressPrompt'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('editProfile'), onPress: () => router.push('/EditProfileScreen' as never) },
        ],
      );
      return;
    }

    router.push(ROUTES.CHECKOUT as never);
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <ThemedText variant="primary" size="xl" weight="extrabold">
          {t('shoppingCart')}
        </ThemedText>
        {cart.length > 0 && (
          <ThemedText variant="tertiary" size="xs" style={styles.headerCount}>
            {formatCount(cart.length)}
          </ThemedText>
        )}
      </View>

      {/* Empty cart */}
      {cart.length === 0 ? (
        <View style={styles.emptyCart}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.background.card }]}>
            <Ionicons name="cart-outline" size={44} color={theme.gray[300]} />
          </View>
          <ThemedText variant="primary" size="lg" weight="extrabold" style={styles.emptyCartTitle}>
            {t('yourCartIsEmpty')}
          </ThemedText>
          <ThemedText variant="tertiary" size="sm" style={styles.emptyCartText}>
            {t('addProductsToGetStarted')}
          </ThemedText>
          <ThemedButton
            variant="primary"
            size="md"
            onPress={() => router.push(ROUTES.HOME as never)}
          >
            {t('startShopping')}
          </ThemedButton>
        </View>
      ) : (
        <>
          {/* Cart items */}
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={[styles.summaryCard, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
                <View style={styles.summaryRow}>
                  <ThemedText variant="tertiary" size="sm">{t('subtotal')}</ThemedText>
                  <ThemedText variant="tertiary" size="sm">{formatPrice(cartTotal)}</ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText variant="tertiary" size="sm">{t('deliveryFee')}</ThemedText>
                  <ThemedText size="sm" weight="bold" style={fee === 0 ? { color: theme.status.success } : undefined}>
                    {fee === undefined ? t('feeAtCheckout') : fee > 0 ? formatPrice(fee) : t('free')}
                  </ThemedText>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: theme.gray[100] }]} />
                <View style={styles.summaryRow}>
                  <ThemedText size="base" weight="extrabold">{t('total')}</ThemedText>
                  <ThemedText size="lg" weight="extrabold" style={{ color: theme.primary[500] }}>
                    {formatPrice(total)}
                  </ThemedText>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.cartItem, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
                <View style={[styles.itemThumb, { backgroundColor: theme.gray[50] }]}>
                  <Image
                    source={{
                      uri: imageUrl(item.image, 200),
                    }}
                    style={styles.itemThumbImage}
                    contentFit="contain"
                  />
                </View>
                <View style={styles.cartItemDetails}>
                  <View style={styles.cartItemTopRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="primary" size="sm" weight="bold" numberOfLines={1}>
                        {localText(item.name, item.nameAr)}
                      </ThemedText>
                      <ThemedText variant="tertiary" size="xs" style={styles.cartItemUnit}>
                        {formatUnit(item.unit)} · {priceWithUnit(formatPrice(item.price), item.unit)}
                      </ThemedText>
                    </View>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <ThemedText variant="tertiary" size="lg">×</ThemedText>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cartItemBottomRow}>
                    <View style={[styles.stepper, { backgroundColor: theme.primary[500] }]}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => updateCartQuantity(item.id, -1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <ThemedText variant="inverse" size="base" weight="extrabold">−</ThemedText>
                      </TouchableOpacity>
                      <ThemedText variant="inverse" size="sm" weight="bold" style={styles.stepperValue}>
                        {formatQuantity(item.quantity, item.unit)}
                      </ThemedText>
                      <TouchableOpacity
                        style={[styles.stepperBtn, item.quantity >= maxQuantity(item) && { opacity: 0.4 }]}
                        onPress={() => updateCartQuantity(item.id, 1)}
                        disabled={item.quantity >= maxQuantity(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <ThemedText variant="inverse" size="base" weight="extrabold">+</ThemedText>
                      </TouchableOpacity>
                    </View>
                    <ThemedText variant="primary" size="base" weight="extrabold">
                      {formatPrice(lineTotal(item.price, item.quantity))}
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Checkout */}
          <View style={[styles.checkoutContainer, { backgroundColor: theme.background.secondary, borderColor: theme.gray[100], paddingBottom: 16 }]}>
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                { backgroundColor: theme.primary[500], shadowColor: theme.primary[700] },
              ]}
              onPress={handleCheckout}
            >
              <ThemedText variant="inverse" size="base" weight="extrabold">
                {t('proceedToCheckout')}
              </ThemedText>
              <ThemedText variant="inverse" size="base" weight="bold" style={styles.checkoutTotal}>
                · {formatPrice(total)}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ThemedView>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerCount: {
    marginTop: 3,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyCartTitle: {
    marginBottom: 6,
  },
  emptyCartText: {
    textAlign: 'center',
    marginBottom: 22,
  },
  cartList: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 10,
  },
  cartItem: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  itemThumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemThumbImage: {
    width: '100%',
    height: '100%',
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cartItemUnit: {
    marginTop: 2,
  },
  cartItemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    padding: 3,
    gap: 2,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 14,
    textAlign: 'center',
  },
  summaryCard: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 11,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryDivider: {
    height: 1,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  checkoutButton: {
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
  checkoutTotal: {
    marginLeft: 6,
  },
});
export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useCartContext } from '@/context/CartContext';
import { useTheme } from '@/hooks/useTheme';
import { CartItem } from '@/types/CardItem';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';

import { FlatList, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';

const Cart = () => {
  const navigation = useNavigation();
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
  } = useCartContext();
  const cartTotal = cart.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  const { theme } = useTheme();

  return (
    <ThemedView variant="primary" style={styles.container}>
      {/* Header */}
      <ThemedView variant="default" style={[styles.header, { backgroundColor: theme.primary[500] }]}>
        {/* <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text.inverse} />
        </TouchableOpacity> */}
        <ThemedText variant="inverse" size="2xl" weight="bold" style={styles.headerTitle}>
          Shopping Cart
        </ThemedText>
      </ThemedView>

      {/* Empty cart */}
      {cart.length === 0 ? (
        <ThemedView variant="default" style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={80} color={theme.gray[300]} />
          <ThemedText variant="primary" size="xl" weight="semibold" style={styles.emptyCartTitle}>
            Your cart is empty
          </ThemedText>
          <ThemedText variant="tertiary" size="base" style={styles.emptyCartText}>
            Add some products to get started
          </ThemedText>
          <TouchableOpacity
            style={[styles.startShoppingButton, { backgroundColor: theme.primary[500] }]}>
            <ThemedButton variant="primary" size='sm' style={styles.startShoppingText} onPress={() => navigation.navigate(ROUTES.HOME as never)}>
              Start Shopping
            </ThemedButton>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <>
          {/* Cart items */}
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ThemedView variant="card" style={styles.cartItem}>
                <ThemedText style={styles.cartItemEmoji}>{item.emoji}</ThemedText>
                <ThemedView variant="default" style={styles.cartItemDetails}>
                  <ThemedText variant="primary" size="base" weight="semibold" style={styles.cartItemName}>
                    {item.name}
                  </ThemedText>
                  <ThemedText variant="success" size="sm" weight="semibold" style={styles.cartItemPrice}>
                    ${item.price} / {item.unit}
                  </ThemedText>

                  <ThemedView variant="default" style={styles.cartItemActions}>
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: theme.gray[100] }]}
                      onPress={() => updateCartQuantity(item.id, -1)}
                    >
                      <Ionicons name="remove" size={16} color={theme.gray[700]} />
                    </TouchableOpacity>
                    <ThemedText variant="primary" size="base" weight="semibold" style={styles.quantityText}>
                      {item.quantity}
                    </ThemedText>
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: theme.gray[100] }]}
                      onPress={() => updateCartQuantity(item.id, 1)}
                    >
                      <Ionicons name="add" size={16} color={theme.gray[700]} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeFromCart(item.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.status.error} />
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
                <ThemedText variant="primary" size="base" weight="bold" style={styles.cartItemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </ThemedText>
              </ThemedView>
            )}
          />

          {/* Checkout */}
          <ThemedView variant="secondary" style={styles.checkoutContainer}>
            <ThemedView variant="default" style={styles.totalContainer}>
              <ThemedText variant="secondary" size="lg" weight="semibold" style={styles.totalLabel}>
                Total:
              </ThemedText>
              <ThemedText variant="success" size="2xl" weight="bold" style={styles.totalAmount}>
                ${cartTotal.toFixed(2)}
              </ThemedText>
            </ThemedView>
            <TouchableOpacity 
              style={[styles.checkoutButton, { backgroundColor: theme.primary[500] }]}
            >
              <ThemedText variant="inverse" size="lg" weight="bold" style={styles.checkoutButtonText}>
                Proceed to Checkout
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
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
    padding: 20,
    paddingTop: StatusBar.currentHeight || 0,
  },
  headerTitle: {
  },
  backButton: {
    marginBottom: 12,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  startShoppingButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startShoppingText: {
  },
  cartList: {
    padding: 16,
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    marginBottom: 4,
  },
  cartItemPrice: {
    marginBottom: 8,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 8,
    borderRadius: 8,
  },
  quantityText: {
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  deleteButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  cartItemTotal: {
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
  },
  totalAmount: {
  },
  checkoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
  },
});
import { CreateOrderPayload, Order, OrderLineItem } from '@/types/Order';
import axios from './axios';

// Sequelize nests belongsToMany join-table columns under the through model's
// name (`item.OrderItem.{quantity,price}`) instead of flattening them onto
// the item — normalize so the rest of the app can just read `.quantity`/`.price`.
const normalizeOrder = (raw: any): Order => ({
  ...raw,
  items: (raw.items ?? []).map((item: any): OrderLineItem => {
    const through = item.OrderItem ?? item.order_item ?? {};
    return {
      ...item,
      quantity: through.quantity ?? item.quantity,
      price: through.price ?? item.price,
      unavailable: through.unavailable ?? false,
    };
  }),
});

/**
 * Create a new order. `userId` must be included — the backend's validator
 * requires it even though the order is always created for the authenticated
 * caller (server ignores the value and uses the auth token instead).
 */
export const createOrder = async (payload: CreateOrderPayload): Promise<{ order: Order; paymentUrl: string | null }> => {
  const res = await axios.post('/orders', payload);
  return { order: normalizeOrder(res.data.order), paymentUrl: res.data.paymentUrl ?? null };
};

// Card checkout is only offered once the store has Kashier keys set up.
export const getPaymentConfig = async (): Promise<{ card: boolean }> => {
  const res = await axios.get('/payments/config');
  return res.data;
};

// New Kashier checkout page for an unpaid card order.
export const payOrder = async (orderId: number, language: string): Promise<string> => {
  const res = await axios.post(`/orders/${orderId}/pay`, { language });
  return res.data.paymentUrl;
};

/**
 * Get all orders for the current user
 */
export const getOrders = async (): Promise<Order[]> => {
  const res = await axios.get('/orders');
  return (res.data.orders ?? []).map(normalizeOrder);
};

/**
 * Get a specific order by ID
 */
export const getOrderById = async (orderId: number): Promise<Order> => {
  const res = await axios.get(`/orders/${orderId}`);
  return normalizeOrder(res.data.order);
};

/**
 * Cancel an order. The backend returns the bare order row (no items/user
 * include) on this endpoint, so callers should merge the result into their
 * existing order state rather than replace it wholesale.
 */
export const cancelOrder = async (orderId: number): Promise<Order> => {
  const res = await axios.put(`/orders/${orderId}/cancel`);
  return normalizeOrder(res.data.order);
};

// Answer to "some items are out of stock": take the rest, or cancel.
export const decideOrder = async (orderId: number, action: 'continue' | 'cancel'): Promise<Order> => {
  const res = await axios.post(`/orders/${orderId}/decision`, { action });
  return normalizeOrder(res.data.order);
};

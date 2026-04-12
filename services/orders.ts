import { CreateOrderPayload, Order } from '@/types/Order';
import axios from './axios';

/**
 * Create a new order
 */
export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const res = await axios.post('/orders', payload);
  return res.data;
};

/**
 * Get all orders for the current user
 */
export const getOrders = async (): Promise<Order[]> => {
  const res = await axios.get('/orders');
  return res.data;
};

/**
 * Get a specific order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  const res = await axios.get(`/orders/${orderId}`);
  return res.data;
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId: string): Promise<Order> => {
  const res = await axios.put(`/orders/${orderId}/cancel`);
  return res.data;
};

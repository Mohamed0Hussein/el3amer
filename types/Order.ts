import { CartItem } from './CardItem';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shippingAddress?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: CartItem[];
  total: number;
  shippingAddress?: string;
  paymentMethod?: string;
}

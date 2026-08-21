// Matches the backend's Order enum (models/Order.js) — no 'preparing' stage.
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLineItem {
  id: number;
  name: string;
  description?: string;
  category: string;
  unit: string;
  image?: string;
  stock: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderLineItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress?: string;
  paymentMethod?: 'cash' | 'card';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  trackingNumber?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  userId: number;
  items: { itemId: number; quantity: number }[];
  shippingAddress?: string;
  paymentMethod?: 'cash' | 'card';
}

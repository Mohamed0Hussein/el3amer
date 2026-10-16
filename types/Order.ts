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
  step?: number;
  quantity: number;
  price: number;
  // The store found it missing while packing.
  unavailable?: boolean;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderLineItem[];
  totalAmount: number;
  deliveryFee?: number;
  status: OrderStatus;
  // Set while the customer is asked what to do about unavailable items.
  decisionRequestedAt?: string | null;
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
  language?: string;
}

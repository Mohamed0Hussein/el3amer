// Matches the backend's Order enum (models/Order.js) — no 'preparing' stage.
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLineItem {
  id: number;
  name: string;
  nameAr?: string | null;
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

// What the store offers instead of an unavailable line.
export interface Substitute {
  forItemId: number;
  quantity: number;
  item: { id: number; name: string; nameAr?: string | null; price: number; unit: string; image?: string };
}

export interface OrderDriver {
  id: number;
  name: string;
  phone: string;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderLineItem[];
  totalAmount: number;
  deliveryFee?: number;
  discount?: number;
  promoCode?: string | null;
  zoneName?: string | null;
  status: OrderStatus;
  substitutes?: Substitute[];
  driver?: OrderDriver | null;
  // Only sent to the customer while the order is out for delivery.
  deliveryCode?: string;
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
  shippingLatitude?: number;
  shippingLongitude?: number;
  // The fee the customer saw; the backend refuses the order if it changed.
  deliveryFee?: number;
  promoCode?: string;
}

export type PromoError = { error: 'invalid' | 'expired' | 'minOrder' | 'usedUp' | 'alreadyUsed'; minOrder?: number };

export interface OrderQuote {
  deliverable: boolean;
  fee: number | null;
  zoneName: string | null;
  subtotal: number;
  discount: number;
  promoError: PromoError | null;
  total: number | null;
  storeStatus: 'open' | 'busy' | 'closed';
  etaMinutes: number;
}

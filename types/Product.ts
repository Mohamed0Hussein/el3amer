// Product as returned by the backend (`GET /items`, `GET /items/:id`).
// Names/units are plain strings set by whoever created the item — not
// translation keys — so the client renders them as-is.
export interface Product {
  id: number;
  name: string;
  nameAr?: string | null;
  description?: string;
  descriptionAr?: string | null;
  category: string;
  categoryAr?: string | null;
  price: number;
  unit: string;
  // Amount per +/- tap for KG / G products (e.g. 0.25 kg); 1 for counted ones.
  step?: number;
  image?: string;
  stock: number;
  // Most one customer may have in orders not yet delivered; null = no limit.
  maxPerCustomer?: number | null;
  isActive?: boolean;
  category_icon?: string;
}

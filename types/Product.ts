// Product as returned by the backend (`GET /items`, `GET /items/:id`).
// Names/units are plain strings set by whoever created the item — not
// translation keys — so the client renders them as-is.
export interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  unit: string;
  image?: string;
  stock: number;
  isActive?: boolean;
  category_icon?: string;
}

// Auth Stack Routes
export const AUTH_ROUTES = {
  LOGIN: 'login',
  SIGN_UP: 'signup',
  AUTH: 'auth',
} as const;

// Main Tab Routes
export const MAIN_TABS = {
  HOME: 'home',
  CART: 'cart',
  PROFILE: 'profile',
} as const;

// Root Stack Routes
export const ROOT_ROUTES = {
  AUTH: 'auth',
  APP: 'app'
} as const;

// All routes combined for easy access
export const ROUTES = {
  ...AUTH_ROUTES,
  ...MAIN_TABS,
  ...ROOT_ROUTES,
  SETTINGS: 'settings',
  EDIT_PROFILE: 'edit_profile',
  FAVORITES: 'favorites',
  ORDERS: 'orders',
  PRODUCT_DETAILS: 'product_details',
  ORDER_DETAILS: 'order_details',
  ADDRESSES: 'addresses',
  EDIT_ADDRESS: 'edit_address',
  CHANGE_PASSWORD: 'change_password',
} as const;
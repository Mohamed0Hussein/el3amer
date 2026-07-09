// All routes combined for easy access with Expo Router paths
export const ROUTES = {
  // Auth
  LOGIN: '/LoginScreen',
  SIGN_UP: '/SignUpScreen',
  AUTH: '/(auth)',
  
  // Tabs
  HOME: '/(tabs)',
  CART: '/(tabs)/CartScreen',
  PROFILE: '/(tabs)/ProfileScreen',
  
  // App Routes
  SETTINGS: '/SettingsScreen',
  EDIT_PROFILE: '/EditProfileScreen',
  FAVORITES: '/FavoritesScreen',
  ORDERS: '/OrdersScreen',
  PRODUCT_DETAILS: '/ProductDetailsScreen',
  ORDER_DETAILS: '/OrderDetailsScreen',
  ADDRESSES: '/AddressScreen',
  EDIT_ADDRESS: '/EditAddressScreen',
  CHANGE_PASSWORD: '/ChangePasswordScreen',
  ABOUT: '/AboutScreen',
} as const;
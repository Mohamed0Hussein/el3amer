// All routes combined for easy access with Expo Router paths
export const ROUTES = {
  // Auth
  LOGIN: '/LoginScreen',
  SIGN_UP: '/SignUpScreen',
  FORGOT_PASSWORD: '/ForgotPasswordScreen',
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
  CHECKOUT: '/CheckoutScreen',
  CATEGORY: '/CategoryScreen',
  PRODUCT_DETAILS: '/ProductDetailsScreen',
  ORDER_DETAILS: '/OrderDetailsScreen',
  PAYMENT: '/PaymentScreen',
  ADDRESSES: '/AddressScreen',
  CHANGE_PASSWORD: '/ChangePasswordScreen',
  ABOUT: '/AboutScreen',
} as const;
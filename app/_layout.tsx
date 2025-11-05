import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ROUTES } from "@/constants/routes";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartContextProvider, useCartContext } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { capitalize } from 'lodash';
import CartScreen from "./cart";
import HomeScreen from "./index";
import LoginScreen from "./login";
import ProfileScreen from "./profile";
import SignUpScreen from "./signup";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main app tabs (protected routes)
function MainAppTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: theme.background.secondary,
          borderTopColor: theme.gray[200],
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.primary[500],
        tabBarInactiveTintColor: theme.gray[400],
      }}
    >
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel : capitalize(ROUTES.HOME),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 🛒 Cart tab with badge */}
      <Tab.Screen
        name={ROUTES.CART}
        component={CartScreen}
        options={{
          tabBarLabel : capitalize(ROUTES.CART),
          tabBarIcon: ({ focused, color, size }) => (
            <CartTabIcon color={color} size={size} focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel:capitalize(ROUTES.PROFILE),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Auth stack (public routes)
function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={ROUTES.LOGIN}
    >
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.SIGN_UP} component={SignUpScreen} />
    </Stack.Navigator>
  );
}

// Root navigator that switches between auth and main app
function RootNavigator() {
  const { isAuthenticated } = useAuth();
  // const isAuthenticated = true

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name={ROUTES.HOME} component={MainAppTabs} />
      ) : (
        <Stack.Screen name={ROUTES.AUTH} component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

// Cart tab icon component
const CartTabIcon = ({
  color,
  size,
  focused,
}: {
  color: string;
  size: number;
  focused: boolean;
}) => {
  const { cart } = useCartContext(); 
  const count = cart?.map((item: any) => item.quantity).reduce((a: number, b: number) => a + b, 0) || 0;

  return (
    <ThemedView style={{ position: 'relative' }}>
      <Ionicons
        name={focused ? "cart" : "cart-outline"}
        size={size}
        color={color}
      />
      {count > 0 && (
        <ThemedView
          style={{
            position: "absolute",
            top: -4,
            right: -10,
            backgroundColor: "#ef4444",
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 4,
          }}
        >
          <ThemedText
            style={{
              color: "#fff",
              fontSize: 10,
              fontWeight: "bold",
            }}
          >
            {count > 9 ? "9+" : count}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartContextProvider>
          {children}
        </CartContextProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CartContextProvider, useCartContext } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CartScreen from "./cart";
import HomeScreen from "./index";
import ProfileScreen from "./profile";

const Tab = createBottomTabNavigator();

export default function RootLayout() {
  const { theme } = useTheme();

  return (
    <AppProviders>
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
          name="Home"
          component={HomeScreen}
          options={{
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
          name="Cart"
          component={CartScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <CartTabIcon color={color} size={size} focused={focused} />
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
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
    </AppProviders>
  );
}

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <FavoritesProvider>
      <CartContextProvider>{children}</CartContextProvider>
    </FavoritesProvider>
  );
};


const CartTabIcon = ({ // render cart icon with badge
  color,
  size,
  focused,
}: {
  color: string;
  size: number;
  focused: boolean;
}) => {
  const { cart } = useCartContext(); 
  const count = cart?.length || 0;

  return (
    <ThemedView>
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
            {count}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

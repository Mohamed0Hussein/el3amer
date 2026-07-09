import { Tabs } from 'expo-router';
import React, { memo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useLocalization } from '@/context/LocalizationContext';
import { Ionicons } from '@expo/vector-icons';
import { useCartContext } from '@/context/CartContext';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

const CartTabIcon = memo(function CartTabIcon({
  color,
  size,
  focused,
}: {
  color: string;
  size: number;
  focused: boolean;
}) {
  const { cartItemCount } = useCartContext();
  const { theme } = useTheme();
  const count = cartItemCount;

  return (
    <ThemedView style={{ position: 'relative', backgroundColor: 'transparent' }}>
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
            backgroundColor: theme.status.error,
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
              color: theme.text.inverse,
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
});

export default function TabLayout() {
  const { theme } = useTheme();
  const { t } = useLocalization();

  return (
    <Tabs
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
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="CartScreen"
        options={{
          title: t('cart'),
          tabBarIcon: ({ focused, color, size }) => (
            <CartTabIcon color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: t('profile'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

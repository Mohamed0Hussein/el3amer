import { Tabs } from 'expo-router';
import React, { memo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useLocalization } from '@/context/LocalizationContext';
import { Ionicons } from '@expo/vector-icons';
import { useCartContext } from '@/context/CartContext';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

const TAB_PILL_SIZE = 42;

const TabPill = ({ focused, children }: { focused: boolean; children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <ThemedView
      style={{
        width: TAB_PILL_SIZE,
        height: TAB_PILL_SIZE,
        borderRadius: TAB_PILL_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? theme.primary[50] : 'transparent',
      }}
    >
      {children}
    </ThemedView>
  );
};

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
      // bottom-tabs 7.10's own tab press calls navigate({ ...route }), which
      // @react-navigation/routers 7.6 warns is deprecated. Do the navigation
      // ourselves with the (name, params) form and cancel the default.
      // ponytail: drop this once bottom-tabs >= 7.20 (needs native ^7.5) is installed.
      screenListeners={({ navigation, route }) => ({
        tabPress: (e) => {
          if (navigation.isFocused()) return;
          e.preventDefault();
          navigation.navigate(route.name, route.params);
        },
      })}
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
            <TabPill focused={focused}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            </TabPill>
          ),
        }}
      />
      <Tabs.Screen
        name="CartScreen"
        options={{
          title: t('cart'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabPill focused={focused}>
              <CartTabIcon color={color} size={size} focused={focused} />
            </TabPill>
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: t('profile'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabPill focused={focused}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            </TabPill>
          ),
        }}
      />
    </Tabs>
  );
}

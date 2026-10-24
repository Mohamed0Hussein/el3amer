import { Logo } from "@/components/Logo";
import { ROUTES } from "@/constants/routes";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useTheme } from "@/hooks/useTheme";
import Constants from "expo-constants";
import { Image } from "expo-image";
import * as Updates from "expo-updates";

export default function ProfileScreen() {
  const { favorites } = useFavorites();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: 'cube-outline' as const, label: t('myOrders'), onPress: () => router.push(ROUTES.ORDERS as never) },
    { icon: 'heart-outline' as const, label: `${t('favorites')} (${favorites.length})`, onPress: () => router.push(ROUTES.FAVORITES as never) },
    { icon: 'location-outline' as const, label: t('deliveryAddress'), onPress: () => router.push(ROUTES.ADDRESSES as never) },
    { icon: 'settings-outline' as const, label: t('settings'), onPress: () => router.push(ROUTES.SETTINGS as never) },
  ];

  return (
    <ThemedView variant="primary" style={styles.container}>

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <ThemedText size="xl" weight="extrabold">
          {t('profileTitle')}
        </ThemedText>
      </View>

      <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.profileHeader, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}
          onPress={() => router.push(ROUTES.EDIT_PROFILE as never)}
          activeOpacity={0.8}
        >
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.profileAvatar, { backgroundColor: theme.primary[50] }]}>
              <Logo size={40} />
            </View>
          )}

          <View style={styles.profileInfo}>
            <ThemedText size="base" weight="extrabold" numberOfLines={1}>
              {user?.fullName}
            </ThemedText>
            <ThemedText variant="tertiary" size="xs" style={{ marginTop: 2 }} numberOfLines={1}>
              {user?.email}
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.gray[400]} />
        </TouchableOpacity>

        <View style={styles.profileMenu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: theme.primary[50] }]}>
                <Ionicons name={item.icon} size={19} color={theme.primary[500]} />
              </View>
              <ThemedText size="sm" weight="bold" style={styles.menuItemText}>
                {item.label}
              </ThemedText>
              <Ionicons name="chevron-forward" size={18} color={theme.gray[300]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Which build and which instant update is running, for support. */}
        <ThemedText variant="tertiary" size="xs" style={styles.version}>
          v{Updates.runtimeVersion || Constants.expoConfig?.version} · {Updates.updateId ? `${Updates.updateId.slice(0, 8)} (${Updates.createdAt?.toISOString().slice(0, 10)})` : 'built-in'}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  version: {
    textAlign: 'center',
    marginTop: 24,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  profileContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    gap: 14,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileMenu: {
    gap: 10,
    paddingBottom: 100,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    flex: 1,
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

import { ROUTES } from "@/constants/routes";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useTheme } from "@/hooks/useTheme";

export default function ProfileScreen() {
  const { favorites } = useFavorites();
  const { theme } = useTheme();
  const { user } = useAuth()
  const navigation = useNavigation();
  const { t } = useLocalization();

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ThemedView
        variant="default"
        style={[styles.header, { backgroundColor: theme.primary[500] }]}
      >
        <ThemedText variant="inverse" size="2xl" weight="bold">
          {t('profileTitle')}
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.profileContent}>
        <ThemedView variant="card" style={styles.profileCard}>
          {/* Profile header */}
          <ThemedView variant="default" style={styles.profileHeader}>
            <ThemedView
              variant="default"
              style={[styles.profileAvatar, { backgroundColor: theme.primary[100] }]}
            >
              <Image source={{ uri: user?.avatar }} style={styles.avatarImage} />
            </ThemedView>

            <ThemedView variant="default" style={styles.profileInfo}>
              <ThemedText
                variant="primary"
                size="xl"
                weight="bold"
                style={styles.profileName}
              >
                {user?.fullName}
              </ThemedText>
              <ThemedText variant="tertiary" size="sm" style={styles.profileEmail}>
                {user?.email}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Profile menu */}
          <ThemedView variant="default" style={styles.profileMenu}>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.gray[50] }]}>
              <Ionicons name="cube-outline" size={24} color={theme.gray[500]} />
              <ThemedText
                variant="secondary"
                size="base"
                weight="semibold"
                style={styles.menuItemText}
              >
                {t('myOrders')}
              </ThemedText>
              <Ionicons name="chevron-forward" size={24} color={theme.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.gray[50] }]}>
              <Ionicons name="heart-outline" size={24} color={theme.gray[500]} />
              <ThemedText
                variant="secondary"
                size="base"
                weight="semibold"
                style={styles.menuItemText}
              >
                {t('favorites')} ({favorites.length})
              </ThemedText>
              <Ionicons name="chevron-forward" size={24} color={theme.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.gray[50] }]}>
              <Ionicons name="location-outline" size={24} color={theme.gray[500]} />
              <ThemedText
                variant="secondary"
                size="base"
                weight="semibold"
                style={styles.menuItemText}
              >
                {t('deliveryAddress')}
              </ThemedText>
              <Ionicons name="chevron-forward" size={24} color={theme.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.gray[50] }]}>
              <Ionicons name="card-outline" size={24} color={theme.gray[500]} />
              <ThemedText
                variant="secondary"
                size="base"
                weight="semibold"
                style={styles.menuItemText}
              >
                {t('paymentMethods')}
              </ThemedText>
              <Ionicons name="chevron-forward" size={24} color={theme.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.gray[50] }]} onPress={() => navigation.navigate(ROUTES.SETTINGS as never)}>
              <Ionicons name="settings-outline" size={24} color={theme.gray[500]} />
              <ThemedText
                variant="secondary"
                size="base"
                weight="semibold"
                style={styles.menuItemText}
              >
                {t('settings')}
              </ThemedText>
              <Ionicons name="chevron-forward" size={24} color={theme.gray[400]} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: StatusBar.currentHeight || 0,
  },
  profileContent: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 80,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
    resizeMode: "cover",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: 4,
  },
  profileEmail: {},
  profileMenu: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
  },
});

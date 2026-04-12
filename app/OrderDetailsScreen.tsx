import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { Order } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OrderDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { order } = route.params as { order: Order };
  const { theme } = useTheme();
  const { t } = useLocalization();

  const OrderItem = ({ item }: { item: any }) => (
    <View style={styles.itemRow}>
      <View style={[styles.emojiContainer, { backgroundColor: theme.gray[100] }]}>
        <ThemedText style={styles.itemEmoji}>{item.emoji}</ThemedText>
      </View>
      <View style={styles.itemInfo}>
        <ThemedText weight="bold">{t(item.nameKey as any)}</ThemedText>
        <ThemedText variant="tertiary" size="sm">
          {item.quantity} x ${item.price}
        </ThemedText>
      </View>
      <ThemedText weight="bold">
        ${(item.quantity * item.price).toFixed(2)}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView variant="primary" style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary[500]} />
      
      {/* Header */}
      <ThemedView variant="primary" style={[styles.header, { backgroundColor: theme.primary[500] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.text.inverse} />
        </TouchableOpacity>
        <ThemedText variant="inverse" size="2xl" weight="bold">
          Order Details
        </ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <ThemedView variant="card" style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <ThemedText variant="tertiary" size="sm">Order ID</ThemedText>
              <ThemedText weight="bold">#{order.id.toUpperCase()}</ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: theme.primary[500] + '20' }]}>
              <ThemedText style={{ color: theme.primary[500] }} weight="bold">
                {order.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.gray[400]} />
            <ThemedText variant="secondary" style={{ marginLeft: 8 }}>
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Items List */}
        <ThemedText size="lg" weight="bold" style={styles.sectionTitle}>
          Items ({order.items.length})
        </ThemedText>
        <ThemedView variant="card" style={styles.itemsCard}>
          {order.items.map((item, index) => (
            <React.Fragment key={item.id}>
              <OrderItem item={item} />
              {index < order.items.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </ThemedView>

        {/* Payment Summary */}
        <ThemedText size="lg" weight="bold" style={styles.sectionTitle}>
          Payment Summary
        </ThemedText>
        <ThemedView variant="card" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <ThemedText variant="secondary">Subtotal</ThemedText>
            <ThemedText weight="semibold">${order.total.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText variant="secondary">Delivery Fee</ThemedText>
            <ThemedText weight="semibold" style={{ color: theme.status.success }}>FREE</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <ThemedText size="lg" weight="bold">Total Amount</ThemedText>
            <ThemedText variant="success" size="lg" weight="bold">
              ${order.total.toFixed(2)}
            </ThemedText>
          </View>
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
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  itemsCard: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

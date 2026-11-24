import { ThemedText } from '@/components/themed-text';
import { formatQuantity, lineTotal, localText } from '@/constants/format';
import { useLocalization } from '@/context/LocalizationContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTheme } from '@/hooks/useTheme';
import { CartItem } from '@/types/CardItem';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SECONDS = 10;

type Props = {
  visible: boolean;
  placing: boolean;
  items: CartItem[];
  subtotal: number;
  discount: number;
  fee: number;
  total: number;
  address: string;
  phone: string;
  payment: string;
  onBack: () => void;
  onConfirm: () => void;
};

// Last look before the order is sent: what, where, how much. Goes ahead on its
// own when the countdown ends, so a customer who is sure doesn't need a second tap.
export function OrderReview({ visible, placing, items, subtotal, discount, fee, total, address, phone, payment, onBack, onConfirm }: Props) {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const formatPrice = useCurrency();
  const insets = useSafeAreaInsets();
  const [left, setLeft] = useState(SECONDS);

  useEffect(() => {
    if (!visible) return;
    setLeft(SECONDS);
    const timer = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [visible]);

  useEffect(() => {
    if (visible && left === 0 && !placing) onConfirm();
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const row = (label: string, value: string, color?: string) => (
    <View style={styles.row}>
      <ThemedText variant="tertiary" size="sm">{label}</ThemedText>
      <ThemedText size="sm" weight="bold" style={color ? { color } : undefined}>{value}</ThemedText>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={() => !placing && onBack()} statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: theme.background.primary, paddingTop: insets.top + 12 }]}>
        <ThemedText size="xl" weight="extrabold" style={styles.title}>{t('reviewTitle')}</ThemedText>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
            {items.map((item) => (
              <View key={item.id} style={styles.row}>
                <ThemedText size="sm" style={{ flex: 1 }} numberOfLines={1}>
                  {localText(item.name, item.nameAr)} × {formatQuantity(item.quantity, item.unit)}
                </ThemedText>
                <ThemedText size="sm" weight="bold">{formatPrice(lineTotal(item.price, item.quantity))}</ThemedText>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: theme.gray[100] }]} />
            {row(t('subtotal'), formatPrice(subtotal))}
            {discount > 0 && row(t('discount'), `−${formatPrice(discount)}`, theme.status.success)}
            {row(t('deliveryFee'), fee > 0 ? formatPrice(fee) : t('free'), fee > 0 ? undefined : theme.status.success)}
            <View style={[styles.divider, { backgroundColor: theme.gray[100] }]} />
            <View style={styles.row}>
              <ThemedText size="base" weight="extrabold">{t('total')}</ThemedText>
              <ThemedText size="lg" weight="extrabold" style={{ color: theme.primary[500] }}>{formatPrice(total)}</ThemedText>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.background.card, borderColor: theme.gray[100], gap: 12 }]}>
            {([['location-outline', address], ['call-outline', phone], ['cash-outline', payment]] as const).map(([icon, text]) => (
              <View key={icon} style={styles.infoRow}>
                <Ionicons name={icon} size={18} color={theme.primary[500]} />
                <ThemedText size="sm" style={{ flex: 1, lineHeight: 20 }}>{text}</ThemedText>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <ThemedText variant="tertiary" size="xs" style={styles.hint}>
            {placing ? ' ' : t('reviewHint').replace('{s}', String(Math.max(left, 0)))}
          </ThemedText>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, { borderWidth: 1.5, borderColor: theme.gray[300] }, placing && { opacity: 0.5 }]}
              onPress={onBack}
              disabled={placing}
            >
              <ThemedText size="base" weight="bold">{t('reviewEdit')}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { flex: 1.4, backgroundColor: theme.primary[500] }]}
              onPress={onConfirm}
              disabled={placing}
            >
              {placing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText variant="inverse" size="base" weight="extrabold">
                  {t('reviewLooksGood')} ({Math.max(left, 0)})
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { paddingHorizontal: 20, marginBottom: 12 },
  content: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divider: { height: 1, marginVertical: 6 },
  footer: { paddingHorizontal: 18, paddingTop: 8 },
  hint: { textAlign: 'center', marginBottom: 10 },
  buttons: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 999 },
});

import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { queryClient } from '@/lib/queryClient';
import { getOrderById, takePendingPayment } from '@/services/orders';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

// Kashier sends the customer back to this backend page when checkout ends.
const RETURN_PATH = '/payments/kashier/return';

export default function PaymentScreen() {
  const { orderId, back } = useLocalSearchParams<{ orderId: string; back?: string }>();
  const [url] = useState(() => takePendingPayment(Number(orderId)));
  const { t } = useLocalization();
  const { theme } = useTheme();
  const done = useRef(false);

  // However checkout ended (paid, failed, or the customer left), show the
  // order with its current payment status.
  const finish = async () => {
    if (done.current) return;
    done.current = true;
    try {
      const order = await getOrderById(Number(orderId));
      queryClient.setQueryData(['order', order.id], order);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (back) {
        router.back();
      } else {
        router.replace({ pathname: ROUTES.ORDER_DETAILS as any, params: { order: JSON.stringify(order) } });
      }
    } catch {
      router.back();
    }
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      finish();
      return true;
    });
    return () => sub.remove();
  });

  // Opened without a checkout from this app (e.g. a deep link): just show the order.
  useEffect(() => {
    if (!url) finish();
  }, []);

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ScreenHeader title={t('payment')} onBack={finish} />
      {url ? <WebView
        source={{ uri: url }}
        style={styles.container}
        startInLoadingState
        renderLoading={() => (
          <View style={[StyleSheet.absoluteFill, styles.loading]}>
            <ActivityIndicator size="large" color={theme.primary[500]} />
          </View>
        )}
        onLoadEnd={(e) => {
          if (e.nativeEvent.url.includes(RETURN_PATH)) finish();
        }}
      /> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

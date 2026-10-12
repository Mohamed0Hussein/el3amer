import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { queryClient } from '@/lib/queryClient';
import { getOrderById } from '@/services/orders';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

// Kashier sends the customer back to this backend page when checkout ends.
const RETURN_PATH = '/payments/kashier/return';

export default function PaymentScreen() {
  const { orderId, url, back } = useLocalSearchParams<{ orderId: string; url: string; back?: string }>();
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

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ScreenHeader title={t('payment')} onBack={finish} />
      <WebView
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
      />
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

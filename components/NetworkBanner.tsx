import { useLocalization } from '@/context/LocalizationContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

export const NetworkBanner = () => {
  const { isConnected } = useNetworkStatus();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    if (isConnected === false) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected]);

  if (isConnected === true) return null;

  return (
    <Animated.View 
      style={[
        styles.banner, 
        { 
          backgroundColor: theme.status.error,
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      <Ionicons name="cloud-offline-outline" size={20} color="#fff" />
      <ThemedText weight="semibold" style={styles.text}>
        {t('networkErrorMessage')}
      </ThemedText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
});

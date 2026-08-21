import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { getUserInfo, updateUser } from '@/services/user';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StatusBar, StyleSheet, View } from 'react-native';

// The backend only stores a single free-text address per user (User.address) —
// there's no address-book model, so this screen edits that one field directly
// instead of pretending to manage a list of saved addresses.
export default function AddressScreen() {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['me', user?.id],
    queryFn: () => getUserInfo(String(user!.id)),
    enabled: !!user,
  });

  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAddress(data?.user?.address || '');
  }, [data]);

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await updateUser(String(user.id), { address: address.trim() });
      await queryClient.invalidateQueries({ queryKey: ['me', user.id] });
      Alert.alert(t('profileUpdated'), t('profileUpdatedMessage'), [
        { text: t('ok'), onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(t('updateFailed'), t('updateFailedMessage'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background.primary} />

      <ScreenHeader title={t('deliveryAddress')} />

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primary[50] }]}>
            <Ionicons name="location-outline" size={22} color={theme.primary[500]} />
          </View>
          <ThemedText size="sm" weight="bold" style={{ marginTop: 12 }}>
            {t('deliveryAddress')}
          </ThemedText>
          <ThemedText variant="tertiary" size="xs" style={{ marginTop: 3, lineHeight: 17 }}>
            Used to calculate delivery and shown to your rider at checkout.
          </ThemedText>

          <ThemedTextInput
            value={address}
            editable={!isLoading}
            onChangeText={setAddress}
            multiline
            placeholder="e.g. 12 El Galaa St, Mohandessin, Giza"
            containerStyle={{ marginTop: 16, marginBottom: 0 }}
            style={styles.input}
          />
        </View>

        <ThemedButton
          variant="primary"
          size="lg"
          onPress={handleSave}
          loading={isSaving}
          disabled={isLoading}
          style={{ marginTop: 20 }}
        >
          {t('save')}
        </ThemedButton>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

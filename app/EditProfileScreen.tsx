import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { getUserInfo, updateUser } from '@/services/user';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // ← added useQueryClient
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLocalization();
  const navigation = useNavigation();

  const queryClient = useQueryClient(); // ← new

  const { data, isLoading } = useQuery({
    queryFn: () => getUserInfo(user?.id as string),
    queryKey: [user?.id],
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setFullName(data?.user?.fullName || '');
    setEmail(data?.user?.email || '');
    setAddress(data?.user?.address || '');
    setPhone(data?.user?.phone || '');
  }, [data, isLoading]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      await updateUser(user.id.toString(), {
        fullName,
        email,
        phone,
        address,
      });


      // Invalidate cache so the screen refetches fresh data on next visit
      await queryClient.invalidateQueries({ queryKey: [user?.id] });


      Alert.alert(t('profileUpdated'), t('profileUpdatedMessage'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(t('updateFailed'), t('updateFailedMessage'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ThemedView variant="primary" style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={theme.gray[700]} />
        </TouchableOpacity>

        <ThemedText size="2xl" weight="bold" style={styles.title}>Edit Profile</ThemedText>

        <ThemedView variant="card" style={[styles.card, { backgroundColor: theme.background.card }]}>
          <ThemedText size="lg" weight="semibold" style={styles.label}>Full Name</ThemedText>
          {isLoading ? <ActivityIndicator color={theme.primary[500]} /> : (
            <ThemedTextInput
              value={fullName}
              editable={!isLoading}
              onChangeText={setFullName}
              style={[styles.input, { backgroundColor: theme.gray[50], color: theme.text.primary }]}
              placeholder="Enter your name"
              placeholderTextColor={theme.gray[400]}
            />
          )}

          <ThemedText size="lg" weight="semibold" style={styles.label}>Email</ThemedText>
          {isLoading ? <ActivityIndicator color={theme.primary[500]} /> : (
            <ThemedTextInput
              value={email}
              editable={!(data?.user?.googleAccount || false) && !isLoading}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={[styles.input, { backgroundColor: theme.gray[50], color: theme.text.primary }, { opacity: data?.user?.googleAccount ? 0.5 : 1 }]}
              placeholder="Enter your email"
              placeholderTextColor={theme.gray[400]}
            />
          )}

          <ThemedText size="lg" weight="semibold" style={styles.label}>Phone</ThemedText>
          {isLoading ? <ActivityIndicator color={theme.primary[500]} /> : (
            <ThemedTextInput
              value={phone}
              editable={!isLoading}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={[styles.input, { backgroundColor: theme.gray[50], color: theme.text.primary }]}
              placeholder="Enter your phone"
              placeholderTextColor={theme.gray[400]}
            />
          )}

          <ThemedText size="lg" weight="semibold" style={styles.label}>Address</ThemedText>
          {isLoading ? <ActivityIndicator color={theme.primary[500]} /> : (
            <ThemedTextInput
              value={address}
              editable={!isLoading}
              onChangeText={setAddress}
              keyboardType="default"
              style={[styles.input, { backgroundColor: theme.gray[50], color: theme.text.primary }]}
              placeholder="Enter your address"
              placeholderTextColor={theme.gray[400]}
            />
          )}
        </ThemedView>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary[500] }]}
          onPress={handleSave}
          disabled={isUpdating || isLoading}
        >
          {(isUpdating || isLoading) ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText weight="semibold" style={{ color: '#fff' }}>Save Changes</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  title: { marginBottom: 10 },
  card: { borderRadius: 16, padding: 16, gap: 16 },
  label: { marginBottom: 4 },
  input: { padding: 14, borderRadius: 12, fontSize: 16 },
  saveButton: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
});
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { getUserInfo } from '@/services/user';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const {data, isLoading} = useQuery({queryFn: () => getUserInfo(user?.id as string), queryKey:[user?.id]})
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSave = async () => {
    
    // await updateUser({ fullName, email });
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
          <ThemedTextInput
            value={fullName}
            onChangeText={setFullName}
            style={[styles.input, { backgroundColor: theme.gray[50], color: theme.text.primary }]}
            placeholder="Enter your name"
            placeholderTextColor={theme.gray[400]}
          />

          <ThemedText size="lg" weight="semibold" style={styles.label}>Email</ThemedText>
          <ThemedTextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={[styles.input, { backgroundColor: theme.gray[50], color: theme.text.primary }]}
            placeholder="Enter your email"
            placeholderTextColor={theme.gray[400]}
          />

          <ThemedText size="lg" weight="semibold" style={styles.label}>Phone</ThemedText>
          <ThemedTextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={[styles.input, { backgroundColor: theme.gray[50], color: theme.text.primary }]}
            placeholder="Enter your phone"
            placeholderTextColor={theme.gray[400]}
          />

          <ThemedText size="lg" weight="semibold" style={styles.label}>address</ThemedText>
          <ThemedTextInput
            value={address}
            onChangeText={setAddress}
            keyboardType="default"
            style={[styles.input, { backgroundColor: theme.gray[50], color: theme.text.primary }]}
            placeholder="Enter your address"
            placeholderTextColor={theme.gray[400]}
          />
        </ThemedView>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary[500] }]}         
          onPress={handleSave}
          disabled={isUpdating}
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
  container: {
    padding: 16,
    gap: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  title: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  saveButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
});

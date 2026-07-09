import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  address: string;
  details: string;
  isDefault: boolean;
}

export default function AddressScreen() {
  
  const { theme } = useTheme();
  const { t } = useLocalization();
  
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', type: 'home', address: '123 Main Street, New York, NY', details: 'Apt 4B, Building A', isDefault: true },
    { id: '2', type: 'work', address: '456 Business Blvd, Brooklyn, NY', details: 'Floor 12, Office 1204', isDefault: false },
  ]);

  const handleEditAddress = (address: Address) => {
    router.push(ROUTES.EDIT_ADDRESS, { address });
  };

  const handleAddAddress = () => {
    router.push(ROUTES.EDIT_ADDRESS);
  };

  const AddressCard = ({ item }: { item: Address }) => (
    <ThemedView variant="card" style={[styles.addressCard, item.isDefault && { borderColor: theme.primary[500], borderWidth: 2 }]}>
      <View style={styles.addressLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.gray[100] }]}>
          <Ionicons 
            name={item.type === 'home' ? 'home-outline' : item.type === 'work' ? 'briefcase-outline' : 'location-outline'} 
            size={24} 
            color={theme.primary[500]} 
          />
        </View>
        <View style={styles.addressInfo}>
          <View style={styles.titleRow}>
            <ThemedText weight="bold" size="lg">
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </ThemedText>
            {item.isDefault && (
              <View style={[styles.defaultBadge, { backgroundColor: theme.primary[500] }]}>
                <ThemedText variant="inverse" size="xs" weight="bold">DEFAULT</ThemedText>
              </View>
            )}
          </View>
          <ThemedText variant="secondary" size="sm">{item.address}</ThemedText>
          <ThemedText variant="tertiary" size="xs">{item.details}</ThemedText>
        </View>
      </View>
      <TouchableOpacity style={styles.editBtn} onPress={() => handleEditAddress(item)}>
        <Ionicons name="create-outline" size={20} color={theme.gray[400]} />
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView variant="primary" style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary[500]} />
      
      {/* Header */}
      <ThemedView variant="primary" style={[styles.header, { backgroundColor: theme.primary[500] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.text.inverse} />
        </TouchableOpacity>
        <ThemedText variant="inverse" size="2xl" weight="bold">
          {t('deliveryAddress')}
        </ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {addresses.map(addr => (
          <AddressCard key={addr.id} item={addr} />
        ))}

        <TouchableOpacity style={[styles.addButton, { borderStyle: 'dashed', borderColor: theme.gray[300], borderWidth: 2 }]} onPress={handleAddAddress}>
          <Ionicons name="add" size={24} color={theme.primary[500]} />
          <ThemedText style={{ color: theme.primary[500], marginLeft: 8 }} weight="bold">
            Add New Address
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <ThemedView variant="card" style={styles.footer}>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary[500] }]}>
          <ThemedText variant="inverse" weight="bold" size="lg">Save Changes</ThemedText>
        </TouchableOpacity>
      </ThemedView>
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
  },
  addressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addressInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  editBtn: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  saveBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
});

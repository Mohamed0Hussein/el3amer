import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  address: string;
  details: string;
  isDefault: boolean;
}

export default function EditAddressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, tokens } = useTheme();
  const { t } = useLocalization();

  const addressToEdit = (route.params as any)?.address as Address | undefined;
  const isEditing = !!addressToEdit;

  const [type, setType] = useState<'home' | 'work' | 'other'>(addressToEdit?.type || 'home');
  const [address, setAddress] = useState(addressToEdit?.address || '');
  const [details, setDetails] = useState(addressToEdit?.details || '');
  const [isDefault, setIsDefault] = useState(addressToEdit?.isDefault || false);

  const handleSave = () => {
    // Save logic here (e.g., API call, update context)
    navigation.goBack();
  };

  const TypeButton = ({ value, icon, label }: { value: 'home' | 'work' | 'other', icon: any, label: string }) => {
    const isSelected = type === value;
    return (
      <TouchableOpacity 
        style={[
          styles.typeButton,
          { 
            backgroundColor: isSelected ? theme.primary[50] : theme.background.card,
            borderColor: isSelected ? theme.primary[500] : theme.gray[200],
            borderWidth: isSelected ? 2 : 1,
            borderRadius: tokens.radius.md,
          }
        ]}
        onPress={() => setType(value)}
      >
        <Ionicons 
          name={icon} 
          size={24} 
          color={isSelected ? theme.primary[500] : theme.gray[500]} 
        />
        <ThemedText 
          style={{ 
            color: isSelected ? theme.primary[500] : theme.gray[600],
            marginTop: 8,
            fontWeight: isSelected ? 'bold' : 'normal'
          }}
        >
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary[500]} />
      
      {/* Header */}
      <ThemedView variant="primary" style={[styles.header, { backgroundColor: theme.primary[500] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.text.inverse} />
        </TouchableOpacity>
        <ThemedText variant="inverse" size="2xl" weight="bold">
          {isEditing ? 'Edit Address' : 'Add New Address'}
        </ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText variant="primary" weight="bold" size="lg" style={styles.sectionTitle}>
          Address Type
        </ThemedText>
        
        <View style={styles.typeContainer}>
          <TypeButton value="home" icon="home-outline" label="Home" />
          <TypeButton value="work" icon="briefcase-outline" label="Work" />
          <TypeButton value="other" icon="location-outline" label="Other" />
        </View>

        <ThemedTextInput
          label="Full Address"
          placeholder="e.g., 123 Main Street, New York, NY"
          value={address}
          onChangeText={setAddress}
          icon="location-outline"
        />

        <ThemedTextInput
          label="Details (Apartment, Floor, etc.)"
          placeholder="e.g., Apt 4B, Building A"
          value={details}
          onChangeText={setDetails}
          icon="business-outline"
        />

        <View style={styles.switchContainer}>
          <ThemedText weight="medium">Set as default address</ThemedText>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: theme.gray[300], true: theme.primary[300] }}
            thumbColor={isDefault ? theme.primary[500] : theme.gray[100]}
          />
        </View>
      </ScrollView>

      <ThemedView variant="card" style={styles.footer}>
        <ThemedButton 
          variant="primary" 
          size="lg" 
          onPress={handleSave}
          style={{ width: '100%' }}
        >
          Save Address
        </ThemedButton>
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
  sectionTitle: {
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});

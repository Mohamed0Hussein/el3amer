import { PinMap, PinMapHandle } from '@/components/PinMap';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { DELIVERY_ZONE, Point } from '@/constants/deliveryZone';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTheme } from '@/hooks/useTheme';
import { getUserInfo, updateUser } from '@/services/user';
import { checkDelivery, getZoneMap } from '@/services/zones';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const formatPlace = (p: Location.LocationGeocodedAddress) =>
  p.formattedAddress ??
  [p.streetNumber && p.street ? `${p.streetNumber} ${p.street}` : p.street, p.district, p.city ?? p.subregion]
    .filter(Boolean)
    .join(', ');

// Android's geocoder only runs with location permission — ask the first time
// it's needed; if refused, the user just types the address.
const ensureLocationPermission = async () => {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Location.requestForegroundPermissionsAsync()).granted;
};

// The backend stores one address per user (User.address) plus its map pin
// (User.latitude/longitude); orders copy the pin so the rider gets the exact spot.
export default function AddressScreen() {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const formatPrice = useCurrency();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const mapRef = useRef<PinMapHandle>(null);
  const lookupId = useRef(0);

  const { data, isLoading } = useQuery({
    queryKey: ['me', user?.id],
    queryFn: () => getUserInfo(String(user!.id)),
    enabled: !!user,
  });

  const [address, setAddress] = useState('');
  const [point, setPoint] = useState<Point | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saved: Point | null =
    data?.user?.latitude != null && data?.user?.longitude != null
      ? { latitude: data.user.latitude, longitude: data.user.longitude }
      : null;

  const { data: zones } = useQuery({ queryKey: ['zoneMap'], queryFn: getZoneMap, staleTime: 5 * 60_000 });
  // Rounded so small drags don't refetch; the backend has the final say anyway.
  const key = point ? [point.latitude.toFixed(4), point.longitude.toFixed(4)] : null;
  const { data: delivery } = useQuery({
    queryKey: ['delivery', key],
    queryFn: () => checkDelivery(point!.latitude, point!.longitude),
    enabled: !!point,
    staleTime: 60_000,
  });
  const outsideZone = !!point && delivery?.deliverable === false;
  const outsideZoneMessage = t('outsideZoneBody');

  useEffect(() => {
    setAddress(data?.user?.address || '');
    setPoint(saved);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fill the text field from the pin; the user can still edit it afterwards.
  const fillAddressFrom = async (p: Point) => {
    const id = ++lookupId.current;
    try {
      if (!(await ensureLocationPermission())) return;
      const [place] = await Location.reverseGeocodeAsync(p);
      // Drop answers for pins the user has already moved away from.
      if (place && id === lookupId.current) setAddress(formatPlace(place));
    } catch {
      // Geocoder unavailable — the user just types the address.
    }
  };

  const onMapMove = (p: Point) => {
    setPoint(p);
    fillAddressFrom(p);
  };

  const locateMe = async () => {
    setIsLocating(true);
    try {
      if (!(await ensureLocationPermission())) {
        Alert.alert(t('deliveryAddress'), t('locationDenied'));
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const p = { latitude: coords.latitude, longitude: coords.longitude };
      mapRef.current?.moveTo(p);
      onMapMove(p);
    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), t('locationDenied'));
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (outsideZone) {
      Alert.alert(t('outsideZoneTitle'), outsideZoneMessage);
      return;
    }
    setIsSaving(true);
    try {
      await updateUser(String(user.id), { address: address.trim(), ...(point ?? {}) });
      await queryClient.invalidateQueries({ queryKey: ['me', user.id] });
      queryClient.invalidateQueries({ queryKey: ['quote'] });
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

      <ScreenHeader title={t('deliveryAddress')} />

      {/* No ScrollView: it would fight the map for drag gestures. The map
          flexes, so it shrinks when the keyboard opens. */}
      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <View style={[styles.mapCard, { borderColor: theme.gray[100], backgroundColor: theme.gray[100] }]}>
          {isLoading ? (
            <ActivityIndicator style={StyleSheet.absoluteFill} color={theme.primary[500]} />
          ) : (
            // No saved pin yet: start on the store with the whole zone in view.
            <PinMap ref={mapRef} initial={saved ?? DELIVERY_ZONE.center} zoom={saved ? 17 : null} zones={zones} onMove={onMapMove} />
          )}

          {/* Fixed center pin: the map moves under it. Tip sits on the center. */}
          <View pointerEvents="none" style={styles.pinWrap}>
            <Ionicons name="location" size={42} color={theme.primary[500]} />
          </View>

          <TouchableOpacity
            onPress={locateMe}
            disabled={isLocating}
            style={[styles.locateBtn, { backgroundColor: theme.background.card }]}
            accessibilityLabel={t('useMyLocation')}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={theme.primary[500]} />
            ) : (
              <Ionicons name="locate" size={20} color={theme.primary[500]} />
            )}
          </TouchableOpacity>
        </View>
        {outsideZone ? (
          <View style={[styles.zoneWarning, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <Ionicons name="alert-circle" size={18} color="#B91C1C" />
            <View style={{ flex: 1 }}>
              <ThemedText size="xs" weight="extrabold" style={{ color: '#B91C1C' }}>
                {t('outsideZoneTitle')}
              </ThemedText>
              <ThemedText size="xs" style={{ color: '#7C6F60', marginTop: 2, lineHeight: 17 }}>
                {outsideZoneMessage}
              </ThemedText>
            </View>
          </View>
        ) : (
          <ThemedText variant="tertiary" size="xs" style={styles.pinHint}>
            {delivery?.deliverable && delivery.fee != null
              ? t('zoneFeeHint').replace('{fee}', delivery.fee > 0 ? formatPrice(delivery.fee) : t('free'))
              : t('pinHint')}
          </ThemedText>
        )}

        <View style={[styles.card, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>
          <ThemedText size="sm" weight="bold">
            {t('deliveryAddress')}
          </ThemedText>
          <ThemedText variant="tertiary" size="xs" style={{ marginTop: 3, lineHeight: 17 }}>
            {t('addressDetailsHint')}
          </ThemedText>

          <ThemedTextInput
            value={address}
            editable={!isLoading}
            onChangeText={setAddress}
            multiline
            placeholder={t('addressPlaceholder')}
            containerStyle={{ marginTop: 14, marginBottom: 0 }}
            style={styles.input}
          />
        </View>

        <ThemedButton
          variant="primary"
          size="lg"
          onPress={handleSave}
          loading={isSaving}
          disabled={isLoading}
          style={{ marginTop: 16 }}
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
    flex: 1,
    paddingHorizontal: 20,
  },
  mapCard: {
    flex: 1,
    minHeight: 160,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -21,
    marginTop: -40,
  },
  locateBtn: {
    position: 'absolute',
    bottom: 12,
    end: 12,
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C1712',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  pinHint: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  zoneWarning: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  input: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';

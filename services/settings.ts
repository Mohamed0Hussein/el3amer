import axios from './axios';

export interface StoreSettings {
  deliveryFee: number;
  isOpen: boolean;
  // Older backends only send isOpen.
  status?: 'open' | 'busy' | 'closed';
  etaMinutes: number;
  busyEtaMinutes?: number;
}

export const isClosed = (s?: StoreSettings) => (s ? (s.status ? s.status === 'closed' : !s.isOpen) : false);
export const isBusy = (s?: StoreSettings) => s?.status === 'busy';
// Delivery time to promise: longer while the store is busy.
export const etaOf = (s?: StoreSettings) => (isBusy(s) ? s?.busyEtaMinutes ?? 60 : s?.etaMinutes ?? 30);

// Set from the store app: fee, whether the store is taking orders, delivery time.
export const getSettings = async (): Promise<StoreSettings> => {
  const res = await axios.get('/settings');
  return res.data;
};

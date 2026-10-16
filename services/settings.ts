import axios from './axios';

export interface StoreSettings {
  deliveryFee: number;
  isOpen: boolean;
  etaMinutes: number;
}

// Set from the store app: fee, whether the store is taking orders, delivery time.
export const getSettings = async (): Promise<StoreSettings> => {
  const res = await axios.get('/settings');
  return res.data;
};

import axios from './axios';

export type DeliveryCheck = { deliverable: boolean; fee: number | null; zoneName: string | null };
export type ZoneShape = { id: number; name: string; polygon: [number, number][]; fee: number; delivers: boolean };

// Can the store deliver to this pin, and for how much (the pin's zone fee)?
export const checkDelivery = async (latitude: number, longitude: number): Promise<DeliveryCheck> => {
  const res = await axios.get('/zones/check', { params: { lat: latitude, lng: longitude } });
  return res.data;
};

// Zones to draw on the address map; empty until the store draws its first one.
export const getZoneMap = async (): Promise<ZoneShape[]> => {
  const res = await axios.get('/zones/map');
  return res.data.zones ?? [];
};

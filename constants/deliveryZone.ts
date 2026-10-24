export type Point = { latitude: number; longitude: number };

// The store, and the circle drawn until the store draws its delivery zones
// (the backend falls back to the same circle).
export const DELIVERY_ZONE = {
  center: { latitude: 30.114895643618727, longitude: 31.308119170587364 },
  radiusKm: 2,
};

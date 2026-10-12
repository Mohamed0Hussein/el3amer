export type Point = { latitude: number; longitude: number };

// Single delivery zone: a circle around the store. Keep in sync with
// el3amer-backend/routes/orders.js, which rejects orders outside it.
export const DELIVERY_ZONE = {
  center: { latitude: 30.114895643618727, longitude: 31.308119170587364 },
  radiusKm: 2,
};

// Great-circle (haversine) distance in km.
export const distanceKm = (a: Point, b: Point) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.sqrt(h));
};

export const isInDeliveryZone = (p: Point) => distanceKm(p, DELIVERY_ZONE.center) <= DELIVERY_ZONE.radiusKm;

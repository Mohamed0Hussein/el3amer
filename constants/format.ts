import { env } from '@/config/env';

// Backend units are shouty enum-like strings ("PACK", "BOTTLE") — title-case
// them for display without needing a translation table.
export const formatUnit = (unit: string) =>
  unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();

type Sellable = { unit?: string; step?: number; stock: number };

// KG and G products are sold by weight; price is per kg / per g.
export const isWeighted = (unit?: string) => ['KG', 'G'].includes(String(unit).toUpperCase());

// How much one tap on +/- changes: the product's step when weighed, 1 when counted.
export const stepOf = (p: Sellable) => (isWeighted(p.unit) ? p.step || 1 : 1);

const round3 = (n: number) => Math.round(n * 1000) / 1000;

// Largest amount that is both in stock and a whole number of steps, so the
// backend never sees e.g. 0.6 kg on a 0.25 kg step.
export const maxQuantity = (p: Sellable) => round3(Math.floor(p.stock / stepOf(p) + 1e-9) * stepOf(p));

export const clampQuantity = (quantity: number, p: Sellable) => Math.min(round3(quantity), maxQuantity(p));

// Kilos under 1 read better as grams ("750 g"), and big gram amounts as kilos.
export const formatQuantity = (quantity: number, unit?: string) => {
  if (!isWeighted(unit)) return String(quantity);
  const grams = String(unit).toUpperCase() === 'KG' ? quantity * 1000 : quantity;
  return grams >= 1000 ? `${round3(grams / 1000)} kg` : `${Math.round(grams)} g`;
};

export const lineTotal = (price: number, quantity: number) => Math.round(price * quantity * 100) / 100;

// "EGP 24.00 / kg" for weighed products, the plain price otherwise.
export const priceWithUnit = (formatted: string, unit?: string) =>
  isWeighted(unit) ? `${formatted} / ${String(unit).toLowerCase()}` : formatted;

// Product images are full URLs or paths on the backend. Cloudinary photos are
// resized to `width` pixels and served in the best format for the phone.
export const imageUrl = (image: string | null | undefined, width: number) => {
  if (!image) return undefined;
  if (!image.startsWith('http')) return `${env.apiOrigin}${image.startsWith('/') ? '' : '/'}${image}`;
  return image.includes('res.cloudinary.com') ? image.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`) : image;
};

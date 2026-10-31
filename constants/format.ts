import { env } from '@/config/env';
import { SupportedLanguage, translations } from '@/localization/translations';

// LocalizationProvider sets this, so the helpers below use the app's language
// without every caller passing it in.
let words: (typeof translations)[SupportedLanguage] = translations.en;
let arabic = false;
export const setFormatLanguage = (language: SupportedLanguage) => {
  words = translations[language];
  arabic = language === 'ar';
};

// Products carry Arabic copies (nameAr, descriptionAr, categoryAr) that win in
// Arabic; an empty one falls back to the English text.
export const localText = (en?: string, ar?: string | null) => (arabic && ar) || en || '';

// Backend units are enum-like strings ("PACK", "KG"); unknown ones are title-cased.
export const formatUnit = (unit: string) =>
  words[`unit_${unit.toUpperCase()}` as keyof typeof words] ?? unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();

// "1 item", "5 items". Arabic has its own forms for 1, 2, 3–10 and 11+.
export const formatCount = (n: number) => {
  const form = n === 1 ? words.items_one : n === 2 ? words.items_two : n % 100 >= 3 && n % 100 <= 10 ? words.items_few : words.items_many;
  return form.replace('{n}', String(n));
};

type Sellable = { unit?: string; step?: number; stock: number; maxPerCustomer?: number | null };

// KG and G products are sold by weight; price is per kg / per g.
export const isWeighted = (unit?: string) => ['KG', 'G'].includes(String(unit).toUpperCase());

// How much one tap on +/- changes: the product's step when weighed, 1 when counted.
export const stepOf = (p: Sellable) => (isWeighted(p.unit) ? p.step || 1 : 1);

const round3 = (n: number) => Math.round(n * 1000) / 1000;

// Largest amount that is in stock, within the per-customer limit and a whole
// number of steps, so the backend never sees e.g. 0.6 kg on a 0.25 kg step.
export const maxQuantity = (p: Sellable) =>
  round3(Math.floor(Math.min(p.stock, p.maxPerCustomer ?? Infinity) / stepOf(p) + 1e-9) * stepOf(p));

export const clampQuantity = (quantity: number, p: Sellable) => Math.min(round3(quantity), maxQuantity(p));

// Kilos under 1 read better as grams ("750 g"), and big gram amounts as kilos.
export const formatQuantity = (quantity: number, unit?: string) => {
  if (!isWeighted(unit)) return String(quantity);
  const grams = String(unit).toUpperCase() === 'KG' ? quantity * 1000 : quantity;
  return grams >= 1000 ? `${round3(grams / 1000)} ${words.qtyKg}` : `${Math.round(grams)} ${words.qtyG}`;
};

export const lineTotal = (price: number, quantity: number) => Math.round(price * quantity * 100) / 100;

// "EGP 24.00 / kg" for weighed products, the plain price otherwise.
export const priceWithUnit = (formatted: string, unit?: string) =>
  isWeighted(unit) ? `${formatted} / ${String(unit).toUpperCase() === 'KG' ? words.qtyKg : words.qtyG}` : formatted;

// Product images are full URLs or paths on the backend. Cloudinary photos are
// resized to `width` pixels and served in the best format for the phone.
export const imageUrl = (image: string | null | undefined, width: number) => {
  if (!image) return undefined;
  if (!image.startsWith('http')) return `${env.apiOrigin}${image.startsWith('/') ? '' : '/'}${image}`;
  return image.includes('res.cloudinary.com') ? image.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`) : image;
};

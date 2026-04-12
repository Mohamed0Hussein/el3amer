import { translations } from '@/localization/translations';

type TranslationKeys = keyof typeof translations['en'];

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  emoji: string;
  stock: number;
}

// Product with localization keys for multi-language support
export interface LocalizedProduct extends Omit<Product, 'name' | 'unit'> {
  name: string;
  nameKey: TranslationKeys;
  unit: string;
  unitKey: TranslationKeys;
}

// Product as returned from API
export interface ApiProduct {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  unit: string;
  image?: string;
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
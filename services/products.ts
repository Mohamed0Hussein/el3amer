import { translations } from '@/localization/translations';
import { LocalizedProduct } from '@/types/Product';

type TranslationKeys = keyof typeof translations['en'];

const MOCK_PRODUCTS: LocalizedProduct[] = [
  { id: 1, name: 'Fresh Apples', nameKey: 'prod_freshApples', category: 'fruits', price: 3.99, unit: 'lb', unitKey: 'unit_lb', emoji: '🍎', stock: 50 },
  { id: 2, name: 'Organic Bananas', nameKey: 'prod_organicBananas', category: 'fruits', price: 2.49, unit: 'lb', unitKey: 'unit_lb', emoji: '🍌', stock: 45 },
  { id: 3, name: 'Fresh Carrots', nameKey: 'prod_freshCarrots', category: 'vegetables', price: 1.99, unit: 'lb', unitKey: 'unit_lb', emoji: '🥕', stock: 30 },
  { id: 4, name: 'Broccoli', nameKey: 'prod_broccoli', category: 'vegetables', price: 2.79, unit: 'lb', unitKey: 'unit_lb', emoji: '🥦', stock: 25 },
  { id: 5, name: 'Whole Milk', nameKey: 'prod_wholeMilk', category: 'dairy', price: 4.29, unit: 'gal', unitKey: 'unit_gal', emoji: '🥛', stock: 20 },
  { id: 6, name: 'Cheddar Cheese', nameKey: 'prod_cheddarCheese', category: 'dairy', price: 5.99, unit: 'lb', unitKey: 'unit_lb', emoji: '🧀', stock: 15 },
  { id: 7, name: 'Chicken Breast', nameKey: 'prod_chickenBreast', category: 'meat', price: 7.99, unit: 'lb', unitKey: 'unit_lb', emoji: '🍗', stock: 18 },
  { id: 8, name: 'Ground Beef', nameKey: 'prod_groundBeef', category: 'meat', price: 6.49, unit: 'lb', unitKey: 'unit_lb', emoji: '🥩', stock: 22 },
  { id: 9, name: 'White Bread', nameKey: 'prod_whiteBread', category: 'bakery', price: 2.99, unit: 'loaf', unitKey: 'unit_loaf', emoji: '🍞', stock: 35 },
  { id: 10, name: 'Croissants', nameKey: 'prod_croissants', category: 'bakery', price: 4.49, unit: 'pack', unitKey: 'unit_pack', emoji: '🥐', stock: 12 },
  { id: 11, name: 'Chocolate Cookies', nameKey: 'prod_chocolateCookies', category: 'snacks', price: 3.49, unit: 'pack', unitKey: 'unit_pack', emoji: '🍪', stock: 40 },
  { id: 12, name: 'Potato Chips', nameKey: 'prod_potatoChips', category: 'snacks', price: 2.99, unit: 'pack', unitKey: 'unit_pack', emoji: '🥔', stock: 50 },
  { id: 13, name: 'Orange Juice', nameKey: 'prod_orangeJuice', category: 'beverages', price: 4.99, unit: 'bottle', unitKey: 'unit_bottle', emoji: '🧃', stock: 28 },
  { id: 14, name: 'Cola', nameKey: 'prod_cola', category: 'beverages', price: 5.49, unit: '12-pack', unitKey: 'unit_12pack', emoji: '🥤', stock: 33 },
  { id: 15, name: 'Fresh Oranges', nameKey: 'prod_freshOranges', category: 'fruits', price: 4.29, unit: 'lb', unitKey: 'unit_lb', emoji: '🍊', stock: 38 },
  { id: 16, name: 'Strawberries', nameKey: 'prod_strawberries', category: 'fruits', price: 5.99, unit: 'pack', unitKey: 'unit_pack', emoji: '🍓', stock: 20 },
  { id: 17, name: 'Tomatoes', nameKey: 'prod_tomatoes', category: 'vegetables', price: 3.49, unit: 'lb', unitKey: 'unit_lb', emoji: '🍅', stock: 42 },
  { id: 18, name: 'Greek Yogurt', nameKey: 'prod_greekYogurt', category: 'dairy', price: 6.49, unit: 'pack', unitKey: 'unit_pack', emoji: '🥄', stock: 28 },
];

export const getProducts = async (): Promise<LocalizedProduct[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return MOCK_PRODUCTS;
};

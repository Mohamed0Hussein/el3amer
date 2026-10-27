import { Ionicons } from '@expo/vector-icons';

// The backend only returns distinct category name strings (`GET /items/category`),
// with no icon metadata — pick a sensible Ionicon by keyword match.
const KEYWORD_ICONS: [RegExp, keyof typeof Ionicons.glyphMap][] = [
  [/fruit|veg/i, 'nutrition-outline'],
  [/dairy|milk|egg/i, 'water-outline'],
  [/bak(e|ing)|bread/i, 'pizza-outline'],
  [/meat|fish|seafood/i, 'restaurant-outline'],
  [/drink|beverage|juice/i, 'wine-outline'],
  [/snack|chip|candy|sweet/i, 'fast-food-outline'],
  [/clean|home|household/i, 'sparkles-outline'],
  [/herb|spice|legume|condiment/i, 'leaf-outline'],
  [/pantry|staple|grocer/i, 'basket-outline'],
  [/personal|care|beauty/i, 'heart-outline'],
];

export const iconForCategory = (name: string): keyof typeof Ionicons.glyphMap => {
  const match = KEYWORD_ICONS.find(([pattern]) => pattern.test(name));
  return match ? match[1] : 'pricetag-outline';
};

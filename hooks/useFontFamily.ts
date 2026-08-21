import { useLocalization } from '@/context/LocalizationContext';

export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

const LATIN: Record<FontWeight, string> = {
  normal: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
};

const ARABIC: Record<FontWeight, string> = {
  normal: 'Almarai_400Regular',
  medium: 'Almarai_400Regular',
  semibold: 'Almarai_700Bold',
  bold: 'Almarai_700Bold',
  extrabold: 'Almarai_800ExtraBold',
};

// Brand wordmark ("el3amer") always renders in Figtree, regardless of language.
export const BRAND_FONT = LATIN.extrabold;

export const useFontFamily = () => {
  const { isRtl } = useLocalization();
  const map = isRtl ? ARABIC : LATIN;
  return (weight: FontWeight = 'normal') => map[weight];
};

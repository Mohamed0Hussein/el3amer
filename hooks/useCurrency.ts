import { useLocalization } from '@/context/LocalizationContext';

// Catalog prices are EGP (confirmed by the real seed data), not USD —
// format accordingly rather than hardcoding a '$' prefix.
export const useCurrency = () => {
  const { isRtl } = useLocalization();
  return (amount: number) => (isRtl ? `${amount.toFixed(2)} ج.م` : `EGP ${amount.toFixed(2)}`);
};

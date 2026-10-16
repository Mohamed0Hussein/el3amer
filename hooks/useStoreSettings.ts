import { getSettings } from '@/services/settings';
import { useQuery } from '@tanstack/react-query';

// undefined until loaded. Short staleTime: the store can close at any moment.
export const useStoreSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: getSettings, staleTime: 30_000 }).data;

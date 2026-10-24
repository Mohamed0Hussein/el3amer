import { useAuth } from '@/context/AuthContext';
import { getUserInfo } from '@/services/user';
import { checkDelivery } from '@/services/zones';
import { useQuery } from '@tanstack/react-query';

// Delivery check for the customer's saved pin: whether we deliver there and
// the fee of its zone. undefined until loaded or when there is no pin yet.
export const useMyDelivery = () => {
  const { user } = useAuth();
  const { data: me } = useQuery({
    queryKey: ['me', user?.id],
    queryFn: () => getUserInfo(String(user!.id)),
    enabled: !!user,
  });
  const lat: number | undefined = me?.user?.latitude ?? undefined;
  const lng: number | undefined = me?.user?.longitude ?? undefined;
  return useQuery({
    queryKey: ['delivery', lat, lng],
    queryFn: () => checkDelivery(lat!, lng!),
    enabled: lat != null && lng != null,
    staleTime: 60_000,
  }).data;
};

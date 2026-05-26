import { ROUTES } from '@/constants/routes';
import type { Order } from '@/types/Order';
import type { LocalizedProduct } from '@/types/Product';

/** Root stack after authentication (matches `_layout.tsx` stack screens). */
export type AuthenticatedStackParamList = {
  [ROUTES.APP]: undefined;
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.EDIT_PROFILE]: undefined;
  [ROUTES.FAVORITES]: undefined;
  [ROUTES.ORDERS]: undefined;
  [ROUTES.PRODUCT_DETAILS]: { product: LocalizedProduct };
  [ROUTES.ORDER_DETAILS]: { order: Order };
  [ROUTES.ADDRESSES]: undefined;
  [ROUTES.CHANGE_PASSWORD]: undefined;
};

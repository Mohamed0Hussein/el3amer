import { Product } from '@/types/Product';
import axios from './axios';

export type ProductSort = 'name' | 'price_low' | 'price_high' | 'newest';

export interface ProductQuery {
  search?: string;
  category?: string;
  sort?: ProductSort;
  ids?: number[];
  limit?: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

// The catalogue is too big to download at once, so it comes a page at a time.
export const getProductPage = async (query: ProductQuery, page = 1): Promise<ProductPage> => {
  const res = await axios.get('/items', {
    params: {
      isActive: true,
      search: query.search || undefined,
      category: query.category && query.category !== 'all' ? query.category : undefined,
      sort: query.sort,
      ids: query.ids?.join(','),
      limit: query.limit ?? 30,
      page,
    },
  });
  return res.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const res = await axios.get(`/items/${id}`);
  return res.data.item;
};

import { Product } from '@/types/Product';
import axios from './axios';

export const getProducts = async (category?: string, search?: string, isActive?: boolean): Promise<Product[]> => {
  const res = await axios.get(`/items`, {
    params: {
      category: category && category !== 'all' ? category : undefined,
      search,
      isActive,
    },
  });

  return res.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const res = await axios.get(`/items/${id}`);
  return res.data.item;
};

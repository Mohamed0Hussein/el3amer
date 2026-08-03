import { Category } from '@/types/Category';
import axios from './axios';

export const getCategories = async (): Promise<Category[]> => {
  const res = await axios.get('/items/category');
  return res.data.categories.map((cat: string) => ({
    name: cat,
    icon: '⭐',
  }));
};

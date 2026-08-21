import { iconForCategory } from '@/constants/categoryIcons';
import { Category } from '@/types/Category';
import axios from './axios';

export const getCategories = async (): Promise<Category[]> => {
  const res = await axios.get('/items/category');
  const categories: string[] = res.data.categories ?? [];
  return categories
    .filter((cat): cat is string => !!cat)
    .map((cat) => ({
      id: cat,
      name: cat,
      icon: iconForCategory(cat),
    }));
};

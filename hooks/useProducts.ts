import { getProductPage, ProductQuery } from '@/services/products';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// Pages of products for a list; call loadMore() from onEndReached. Previous
// results stay on screen while a new search or filter loads.
export const useProducts = (query: ProductQuery, enabled = true) => {
  const result = useInfiniteQuery({
    queryKey: ['products', query],
    queryFn: ({ pageParam }) => getProductPage(query, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.limit < last.total ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
    enabled,
  });

  const products = useMemo(() => result.data?.pages.flatMap((p) => p.items) ?? [], [result.data]);

  return {
    ...result,
    products,
    total: result.data?.pages[0]?.total ?? 0,
    loadMore: () => {
      if (result.hasNextPage && !result.isFetchingNextPage) result.fetchNextPage();
    },
  };
};

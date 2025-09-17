export interface ProductItem {
  name: string;
  price: number;
  amount: number;
  url: string;
}

export interface Product {
  name: string;
  id: string;
  category: string;
  thumb: string;
  images: string[];
  detail: string;
  detail_url: string;
  totals: number;
  items: ProductItem[];
}

export interface ProductData {
  products: Product[];
}

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  searchText: string;
  favoritesOnly?: boolean;
}

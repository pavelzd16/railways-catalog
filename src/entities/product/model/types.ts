// src/entities/product/model/types.ts
export type ProductCondition = 'new' | 'used' | 'service';

export interface ProductSpec {
  id: string;
  label: string;
  unit?: string;
  value: number | string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  gost: string;
  price: number | null;
  stock: number;
  condition: ProductCondition;
  images: string[];
  /** Ролик в карточке: /uploads/<файл>.mp4|webm, API отдаёт null, если его нет. */
  video?: string | null;
  categorySlug: string;
  subcategorySlug?: string;
  description?: string;
  descriptionTags?: string | null;
  specs?: ProductSpec[];
  analogues?: string[];
}

export interface CreateProductDto {
  sku: string;
  title: string;
  slug: string;
  gost: string;
  price?: number | null;
  stock: number;
  condition: ProductCondition;
  categorySlug: string;
  subcategorySlug?: string;
  description?: string;
  descriptionTags?: string;
  specs?: Omit<ProductSpec, "id">[];
  analogues?: string[];
}

export type UpdateProductDto = Partial<CreateProductDto> & { retainedImages?: string[] };

export type SortOption = 'name' | 'price-asc' | 'price-desc' | 'popular' | 'newest';
export type StockFilter = 'all' | 'in-stock' | 'on-order';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  search?: string;
  gost?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: ProductCondition | 'all';
  stock?: StockFilter;
  sort?: SortOption;
  attributes?: Record<string, string>;
}

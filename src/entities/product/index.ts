// src/entities/product/index.ts
export { productApi } from './api/product.api';
export { usePositionsCount } from './model/use-positions-count';
export type {
  Product,
  ProductCondition,
  ProductSpec,
  CreateProductDto,
  UpdateProductDto,
  GetProductsParams,
} from './model/types';
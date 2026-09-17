export interface PaginatedCollection<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  message: string;
  data: PaginatedCollection<T>;
}

export interface ResourceCollectionLinks {
  first: string | null;
  last: string | null;
  previous: string | null;
  next: string | null;
}

export interface ResourceCollectionMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface ResourceCollectionResponse<T> {
  data: T[];
  links: ResourceCollectionLinks;
  meta: ResourceCollectionMeta;
  message: string;
}
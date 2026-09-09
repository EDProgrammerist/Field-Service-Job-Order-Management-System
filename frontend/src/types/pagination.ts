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
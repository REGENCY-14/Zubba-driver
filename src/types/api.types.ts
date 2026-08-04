export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PagedApiResponse<T> {
  success: boolean;
  data: {
    items: T;
    metadata: {
      total: number;
      pages: number;
      current_page: number;
      limit: number;
    };
  };
  message: string;
}

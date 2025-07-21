export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateSiteRequest {
  name: string;
  type: 'CITY' | 'ATTRACTION' | 'REGION' | 'CUSTOM';
  subdomain: string;
  languages: string[];
  defaultLanguage: string;
  locationContext: string;
}
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface PaginationParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    [key: string]: any;
}

export interface FilterParams extends PaginationParams {
    global?: { value: any; matchMode: string };
    [key: string]: any;
}
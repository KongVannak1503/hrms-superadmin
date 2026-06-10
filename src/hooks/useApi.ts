import { useState, useCallback, useRef } from 'react';
import type { ApiResponse, PaginatedResponse } from '../types';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    immediate?: boolean;
}

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

interface UseApiReturn<T, Args extends any[]> {
    execute: (...args: Args) => Promise<T | null>;
    data: T | null;
    loading: boolean;
    error: Error | null;
    reset: () => void;
}

export function useApi<T, Args extends any[]>(
    apiFn: (...args: Args) => Promise<ApiResponse<T>>,
    options: UseApiOptions<T> = {}
): UseApiReturn<T, Args> {
    const { onSuccess, onError, immediate = false } = options;
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: immediate,
        error: null,
    });
    const mountedRef = useRef(true);

    const execute = useCallback(
        async (...args: Args): Promise<T | null> => {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                const response = await apiFn(...args);
                const data = response.data;
                if (mountedRef.current) {
                    setState({ data, loading: false, error: null });
                    onSuccess?.(data);
                }
                return data;
            } catch (error) {
                const err = error as Error;
                if (mountedRef.current) {
                    setState((prev) => ({ ...prev, loading: false, error: err }));
                    onError?.(err);
                }
                return null;
            }
        },
        [apiFn, onSuccess, onError]
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        execute,
        data: state.data,
        loading: state.loading,
        error: state.error,
        reset,
    };
}

export function usePaginatedApi<T, Args extends any[]>(
    apiFn: (...args: Args) => Promise<ApiResponse<PaginatedResponse<T>>>,
    options: UseApiOptions<PaginatedResponse<T>> = {}
) {
    const { execute, data, loading, error, reset } = useApi<
        PaginatedResponse<T>,
        Args
    >(apiFn, options);

    return {
        execute,
        data: data?.data || [],
        pagination: data
            ? {
                  currentPage: data.current_page,
                  lastPage: data.last_page,
                  perPage: data.per_page,
                  total: data.total,
              }
            : null,
        loading,
        error,
        reset,
    };
}

export function useDebounce<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedFn = useCallback(
        ((...args: any[]) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        }) as T,
        [callback, delay]
    );

    return debouncedFn;
}
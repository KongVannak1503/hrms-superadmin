import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function parseURLValue<T>(
  value: string, key: keyof T,
  initialValues: T, options: any
): any {
  if (options.jsonFields?.includes(key)) {
    try { return JSON.parse(value); } catch { return value; }
  } else if (options.dateFields?.includes(key)) {
    return new Date(value);
  } else if (options.numberFields?.includes(key)) {
    const n = Number(value);
    return isNaN(n) ? initialValues[key] : n;
  } else if (options.booleanFields?.includes(key)) {
    return value === 'true' || value === '1';
  }
  return value;
}

function readURLParams<T>(initialValues: T, options: any): Partial<T> {
  const fromURL: Partial<T> = {};
  const urlParams = Object.fromEntries(new URLSearchParams(window.location.search));
  for (const key in initialValues) {
    const v = urlParams[key];
    if (v !== undefined && v !== null) {
      fromURL[key] = parseURLValue(v, key, initialValues, options);
    }
  }
  return fromURL;
}

function buildSearchString<T>(state: T, initialValues: T, options: any): string {
  const params = new URLSearchParams();
  for (const key in initialValues) {
    const v = state[key];
    if (v === undefined || v === null || v === '') continue;
    let sv: string;
    if (options.jsonFields?.includes(key)) {
      sv = JSON.stringify(v);
    } else if (options.dateFields?.includes(key)) {
      sv = v instanceof Date ? v.toISOString() : String(v);
    } else if (options.numberFields?.includes(key)) {
      sv = String(v);
    } else if (options.booleanFields?.includes(key)) {
      sv = v ? '1' : '0';
    } else {
      sv = String(v);
    }
    params.set(key, sv);
  }
  return params.toString();
}

export function useFilterState<T extends Record<string, any>>(
  initialValues: T,
  options: {
    debounceFields?: Array<keyof T>;
    debounceDelay?: number;
    jsonFields?: Array<keyof T>;
    dateFields?: Array<keyof T>;
    numberFields?: Array<keyof T>;
    booleanFields?: Array<keyof T>;
  } = {}
) {
  const [internalState, setInternalState] = useState<T>(() => {
    return { ...initialValues, ...readURLParams(initialValues, options) } as T;
  });

  const [committedState, setCommittedState] = useState<T>(internalState);

  const debounceFieldsSet = new Set(options.debounceFields ?? []);
  const debounceDelay = options.debounceDelay ?? 300;

  useEffect(() => {
    if (debounceFieldsSet.size === 0) {
      setCommittedState(internalState);
      return;
    }

    const hasDebouncedChange = [...debounceFieldsSet].some(
      key => internalState[key] !== committedState[key]
    );

    if (!hasDebouncedChange) return;

    const timer = setTimeout(() => {
      setCommittedState(internalState);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [internalState, committedState, debounceFieldsSet, debounceDelay]);

  const effectiveState = useMemo<T>(() => {
    if (debounceFieldsSet.size === 0) return internalState;

    const merged = { ...internalState };
    for (const key of debounceFieldsSet) {
      (merged as any)[key] = committedState[key];
    }
    return merged;
  }, [internalState, committedState, debounceFieldsSet]);

  const stateForUrl = debounceFieldsSet.size > 0 ? effectiveState : internalState;

  useEffect(() => {
    const currentQS = window.location.search.replace('?', '');
    const targetQS = buildSearchString(stateForUrl, initialValues, options);
    if (currentQS === targetQS) return;

    const newURL = window.location.pathname + (targetQS ? '?' + targetQS : '');
    window.history.replaceState(null, '', newURL);
  }, [stateForUrl, initialValues, options]);

  const stateRef = useRef(internalState);
  stateRef.current = internalState;

  useEffect(() => {
    const handlePopState = () => {
      const fromURL = readURLParams(initialValues, options);
      const changed = Object.keys(fromURL).some(k => stateRef.current[k] !== fromURL[k]);
      if (changed) {
        setInternalState(prev => ({ ...prev, ...fromURL }) as T);
        setCommittedState(prev => ({ ...prev, ...fromURL }) as T);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialValues, options]);

  const setFilters = useCallback((updates: Partial<T> | ((prev: T) => Partial<T>)) => {
    setInternalState(prev => {
      const u = typeof updates === 'function' ? (updates as Function)(prev) : updates;
      return { ...prev, ...u } as T;
    });
  }, []);

  return [effectiveState, setFilters] as const;
}

export default useFilterState;

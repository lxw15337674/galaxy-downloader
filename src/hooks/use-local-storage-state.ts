'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type SetValue<T> = T | ((prev: T) => T);

interface UseLocalStorageStateOptions<T> {
  defaultValue: T;
}

export function useLocalStorageState<T>(
  key: string,
  options: UseLocalStorageStateOptions<T>
) {
  const defaultValueRef = useRef(options.defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  const [value, setValue] = useState<T>(() => options.defaultValue);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      const nextValue =
        raw === null ? defaultValueRef.current : (JSON.parse(raw) as T);
      setValue(nextValue);
    } catch {
      setValue(defaultValueRef.current);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage quota and serialization errors.
    }
  }, [isHydrated, key, value]);

  const updateValue = useCallback((next: SetValue<T>) => {
    setValue((prev) =>
      typeof next === 'function' ? (next as (prev: T) => T)(prev) : next
    );
  }, []);

  return [value, updateValue, isHydrated] as const;
}

// PURPOSE: Provides a small, safe async state wrapper for service-layer calls.
// USAGE: Call `useApi(serviceFn)` in pages to load data without duplicating loading/error logic.

import { useCallback, useEffect, useRef, useState } from "react";

export function useApi(serviceFn, options = { immediate: true }) {
  const { immediate = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(immediate));
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const serviceFnRef = useRef(serviceFn);

  useEffect(() => {
    serviceFnRef.current = serviceFn;
  }, [serviceFn]);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await serviceFnRef.current(...args);
        if (mountedRef.current) {
          setData(result);
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err);
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (immediate) {
      execute().catch(() => undefined);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [execute, immediate]);

  return { data, loading, error, execute, reset };
}

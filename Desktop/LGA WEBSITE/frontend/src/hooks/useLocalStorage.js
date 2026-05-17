// PURPOSE: Synchronizes React state with localStorage for lightweight local UI preferences and auth state.
// USAGE: Call `useLocalStorage(key, initialValue)` from components that need persistent local state.

import { useCallback, useEffect, useState } from "react";

function readStoredValue(key, initialValue) {
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage can be unavailable in restricted browser contexts.
    }
  }, [key, value]);

  const removeValue = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
    setValue(initialValue);
  }, [initialValue, key]);

  return [value, setValue, removeValue];
}

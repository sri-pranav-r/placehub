import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

// The API can be briefly unreachable while it starts (the dev proxy answers 502-504,
// or fetch itself fails), so those errors are retried a few times before giving up.
const RETRIES = 6;
const RETRY_DELAY_MS = 1500;
const isServerUnreachable = (err) => err instanceof TypeError || (err.status >= 502 && err.status <= 504);

// Loads `path` on mount (and whenever it changes). Returns { data, error, loading, reload }.
export function useApi(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    for (let attempt = 0; ; attempt++) {
      try {
        setData(await api(path));
        setError(null);
        break;
      } catch (err) {
        if (attempt < RETRIES && isServerUnreachable(err)) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          continue;
        }
        setError(err.message);
        break;
      }
    }
    setLoading(false);
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload };
}

// Branch / status lists from the server, fetched once and shared
let metaPromise;
export function useMeta() {
  const [meta, setMeta] = useState(null);
  useEffect(() => {
    metaPromise ??= api('/meta');
    metaPromise.then(setMeta).catch(() => (metaPromise = null));
  }, []);
  return meta;
}

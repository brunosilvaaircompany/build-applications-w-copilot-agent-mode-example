import { useEffect, useState } from 'react';

export function useCapabilityData<T>(load: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setHasError(false);
    load()
      .then((loadedItems) => {
        if (!Array.isArray(loadedItems)) throw new Error('Resposta inválida da API.');
        if (active) setItems(loadedItems);
      })
      .catch(() => {
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [load]);

  return { items, loading, hasError };
}

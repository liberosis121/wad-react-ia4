import { useCallback, useEffect, useState } from 'react';

// The last answer the page accepted, and the request it answers.
// `query: null` matches no search text, so the first render counts as loading.
const NOTHING_YET = { query: null, attempt: 0, products: [], failed: false };

// Loads GET /api/products?q=<query>. One request per (query, attempt):
// the effect's cleanup aborts the previous one, so only the answer for the
// current text is ever stored — an aborted request is dropped, not a failure.
export default function useProducts(query) {
  const [attempt, setAttempt] = useState(0); // Retry adds one
  const [settled, setSettled] = useState(NOTHING_YET);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch(`/api/products?q=${encodeURIComponent(query)}`, { signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((products) => {
        if (signal.aborted) return;
        if (!Array.isArray(products)) throw new Error('The answer is not a list');
        setSettled({ query, attempt, products, failed: false });
      })
      .catch(() => {
        if (signal.aborted) return;
        setSettled({ query, attempt, products: [], failed: true });
      });

    return () => controller.abort();
  }, [query, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // Computed, not stored: a request is out until the stored answer is the
  // answer to the current query and attempt.
  const loading = settled.query !== query || settled.attempt !== attempt;

  return {
    products: settled.products, // the previous answer stays until the next one
    loading,
    failed: !loading && settled.failed,
    retry,
  };
}

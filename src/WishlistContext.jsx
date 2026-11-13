import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// null = "no provider above": useWishlist() turns that into an error instead
// of silently handing out an empty wishlist.
const WishlistContext = createContext(null);

// The page's one wishlist. Rendered once, by App, around everything.
export function WishlistProvider({ children }) {
  // Saved products in the order saved: [{ id, name }]. The name is copied in,
  // so a product the search hides can still be listed.
  const [saved, setSaved] = useState([]);

  const toggle = useCallback((product) => {
    setSaved((list) =>
      list.some((entry) => entry.id === product.id)
        ? list.filter((entry) => entry.id !== product.id)
        : [...list, { id: product.id, name: product.name }],
    );
  }, []);

  const value = useMemo(
    () => ({
      saved,
      isSaved: (id) => saved.some((entry) => entry.id === id),
      toggle,
    }),
    [saved, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

// { saved, isSaved(id), toggle(product) }
export function useWishlist() {
  const wishlist = useContext(WishlistContext);
  if (wishlist === null) {
    throw new Error('useWishlist() must be used inside <WishlistProvider>.');
  }
  return wishlist;
}

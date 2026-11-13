import { useState } from 'react';
import useProducts from './useProducts.js';
import SearchBox from './components/SearchBox.jsx';
import ProductList from './components/ProductList.jsx';
import CartSummary from './components/CartSummary.jsx';
import Header from './components/Header.jsx';
import SavedPanel from './components/SavedPanel.jsx';
import { WishlistProvider } from './WishlistContext.jsx';

function statusText({ loading, failed, products }) {
  if (loading) return 'Loading products…';
  if (failed) return 'Could not load products.';
  if (products.length === 0) return 'No products match.';
  return '';
}

export default function App() {
  const [query, setQuery] = useState('');
  // One line per product: { id, name, price, quantity }. The name and price
  // are copied in, so a product the search no longer shows still counts.
  const [cart, setCart] = useState([]);
  const { products, loading, failed, retry } = useProducts(query);

  function addToCart(product) {
    setCart((lines) => {
      if (lines.some((line) => line.id === product.id)) {
        return lines.map((line) =>
          line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...lines, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  }

  // The one WishlistProvider of the page: the header, the cards and the Saved
  // panel all read the same wishlist through useWishlist().
  return (
    <WishlistProvider>
      <Header />
      <main>
        <SearchBox value={query} onChange={setQuery} />
        <p role="status" className="status">{statusText({ loading, failed, products })}</p>
        {failed && (
          <button type="button" className="retry" onClick={retry}>Retry</button>
        )}
        <div className="layout">
          <ProductList products={products} onAddToCart={addToCart} />
          <div className="sidebar">
            <CartSummary items={cart} />
            <SavedPanel />
          </div>
        </div>
      </main>
    </WishlistProvider>
  );
}

import { useWishlist } from '../WishlistContext.jsx';

// The page's only <header>. The count is worked out from the wishlist.
export default function Header() {
  const { saved } = useWishlist();
  return (
    <header className="container d-flex flex-wrap justify-content-between align-items-baseline column-gap-3 py-3">
      <h1 className="mb-0">Shop</h1>
      <p className="mb-0 fw-semibold">Saved: {saved.length}</p>
    </header>
  );
}

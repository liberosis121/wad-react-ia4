import { useWishlist } from '../WishlistContext.jsx';

// The page's only <header>. The count is worked out from the wishlist.
export default function Header() {
  const { saved } = useWishlist();
  return (
    <header className="page-header">
      <h1>Shop</h1>
      <p>Saved: {saved.length}</p>
    </header>
  );
}

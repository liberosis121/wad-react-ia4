import { useWishlist } from '../WishlistContext.jsx';

// Names of the saved products, in the order they were saved.
export default function SavedPanel() {
  const { saved } = useWishlist();
  return (
    <section aria-label="Saved" className="saved">
      <h2>Saved</h2>
      {saved.length === 0 ? (
        <p>Nothing saved yet.</p>
      ) : (
        <ul>
          {saved.map((entry) => (
            <li key={entry.id}>{entry.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

import { useWishlist } from '../WishlistContext.jsx';

// Names of the saved products, in the order they were saved.
export default function SavedPanel() {
  const { saved } = useWishlist();
  return (
    <section aria-label="Saved" className="card">
      <div className="card-body">
        <h2 className="card-title h5">Saved</h2>
        {saved.length === 0 ? (
          <p className="mb-0">Nothing saved yet.</p>
        ) : (
          <ul className="mb-0 ps-3 text-break">
            {saved.map((entry) => (
              <li key={entry.id}>{entry.name}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

import { useId, useState } from 'react';
import { formatPrice } from '../format.js';
import { useWishlist } from '../WishlistContext.jsx';

export default function ProductCard({ product, onAddToCart }) {
  const [open, setOpen] = useState(false);
  const descriptionId = useId();
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(product.id);

  return (
    <li className="col">
      <div className="card h-100">
        <div className="card-body">
          <h2 className="card-title h5 text-break">{product.name}</h2>
          <p className="card-text">{formatPrice(product.price)}</p>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              aria-expanded={open}
              aria-controls={open ? descriptionId : undefined}
              onClick={() => setOpen((wasOpen) => !wasOpen)}
            >
              Details
            </button>
            <button
              type="button"
              className={saved ? 'btn btn-outline-primary active' : 'btn btn-outline-primary'}
              aria-pressed={saved}
              onClick={() => toggle(product)}
            >
              Save
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onAddToCart(product)}>
              Add to cart
            </button>
          </div>
          {open && (
            <p id={descriptionId} className="card-text text-break mt-3 mb-0">{product.description}</p>
          )}
        </div>
      </div>
    </li>
  );
}

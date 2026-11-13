import { useId, useState } from 'react';
import { formatPrice } from '../format.js';

export default function ProductCard({ product, onAddToCart }) {
  const [open, setOpen] = useState(false);
  const descriptionId = useId();

  return (
    <li className="card">
      <h2>{product.name}</h2>
      <p className="price">{formatPrice(product.price)}</p>
      <div className="actions">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? descriptionId : undefined}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        >
          Details
        </button>
        <button type="button" onClick={() => onAddToCart(product)}>Add to cart</button>
      </div>
      {open && <p id={descriptionId} className="description">{product.description}</p>}
    </li>
  );
}

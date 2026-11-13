import { formatItems, formatPrice } from '../format.js';
import CheckoutForm from './CheckoutForm.jsx';

// `items` are the cart lines: { id, name, price, quantity }.
// The count and the total are worked out here on every render.
// `onOrderPlaced` empties the cart after a valid order.
export default function CartSummary({ items, onOrderPlaced }) {
  const count = items.reduce((sum, line) => sum + line.quantity, 0);
  const total = items.reduce((sum, line) => sum + line.price * line.quantity, 0);

  return (
    <aside aria-label="Cart" className="card">
      <div className="card-body">
        <h2 className="card-title h5">Cart</h2>
        <p className="mb-1">{formatItems(count)}</p>
        <p className="mb-0">Total: {formatPrice(total)}</p>
        <CheckoutForm itemCount={count} total={total} onOrderPlaced={onOrderPlaced} />
      </div>
    </aside>
  );
}

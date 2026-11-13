import { formatItems, formatPrice } from '../format.js';

// `items` are the cart lines: { id, name, price, quantity }.
// The count and the total are worked out here on every render.
export default function CartSummary({ items }) {
  const count = items.reduce((sum, line) => sum + line.quantity, 0);
  const total = items.reduce((sum, line) => sum + line.price * line.quantity, 0);

  return (
    <aside aria-label="Cart" className="cart">
      <h2>Cart</h2>
      <p>{formatItems(count)}</p>
      <p>Total: {formatPrice(total)}</p>
    </aside>
  );
}

// Formatting shared by the product cards and the cart.

// 95000 → "95.000 đ"
export function formatPrice(amount) {
  return amount.toLocaleString('vi-VN') + ' đ';
}

// 0 → "0 items", 1 → "1 item", 2 → "2 items"
export function formatItems(count) {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

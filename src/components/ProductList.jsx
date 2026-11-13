import ProductCard from './ProductCard.jsx';

// Always renders the list, also when it is empty.
export default function ProductList({ products, onAddToCart }) {
  return (
    <ul aria-label="Products" className="products">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </ul>
  );
}

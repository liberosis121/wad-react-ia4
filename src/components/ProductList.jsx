import ProductCard from './ProductCard.jsx';

// Always renders the list, also when it is empty.
// A Bootstrap grid: 1 column on phones, 2 from md (768 px) up.
export default function ProductList({ products, onAddToCart }) {
  return (
    <ul aria-label="Products" className="list-unstyled row row-cols-1 row-cols-md-2 g-3 mb-0">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </ul>
  );
}

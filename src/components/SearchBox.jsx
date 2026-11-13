import { useId } from 'react';

export default function SearchBox({ value, onChange }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="form-label fw-semibold">Search products</label>
      <input
        id={id}
        type="search"
        className="form-control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

import { useId } from 'react';

export default function SearchBox({ value, onChange }) {
  const id = useId();
  return (
    <div className="search">
      <label htmlFor={id}>Search products</label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

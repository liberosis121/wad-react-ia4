import { useId, useState } from 'react';
import { formatItems, formatPrice } from '../format.js';

const EMPTY_FIELDS = { name: '', phone: '', note: '' };
const NOTE_MAX = 200;

// The errors of the fields as they are now: { name?: string, phone?: string }.
// Called on every render — there is no error state to keep in sync.
function validate(fields) {
  const errors = {};
  if (fields.name.trim() === '') {
    errors.name = 'Enter your name.';
  }
  if (!/^0\d{9}$/.test(fields.phone)) {
    errors.phone = 'Enter a 10-digit phone number starting with 0.';
  }
  return errors;
}

// `itemCount` and `total` describe the cart; `onOrderPlaced` empties it.
export default function CheckoutForm({ itemCount, total, onOrderPlaced }) {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  // True from a rejected Place order until the next valid order.
  const [submitted, setSubmitted] = useState(false);
  // A snapshot taken when the order is placed: the cart is empty afterwards.
  const [confirmation, setConfirmation] = useState('');
  const id = useId();

  const errors = validate(fields);
  const nameError = submitted ? errors.name : undefined;
  const phoneError = submitted ? errors.phone : undefined;
  const cartError = submitted && itemCount === 0 ? 'Add something to the cart first.' : '';

  function setField(name, value) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (errors.name || errors.phone || itemCount === 0) {
      setSubmitted(true);
      setConfirmation('');
      return;
    }
    setConfirmation(
      `Order placed for ${fields.name.trim()}: ${formatItems(itemCount)}, ${formatPrice(total)}.`,
    );
    onOrderPlaced();
    setFields(EMPTY_FIELDS);
    setSubmitted(false);
  }

  return (
    <form aria-label="Checkout" className="checkout" noValidate onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor={`${id}-name`}>Name</label>
        <input
          id={`${id}-name`}
          type="text"
          autoComplete="name"
          value={fields.name}
          onChange={(event) => setField('name', event.target.value)}
          aria-invalid={nameError ? 'true' : undefined}
          aria-describedby={nameError ? `${id}-name-error` : undefined}
        />
        {nameError && <p id={`${id}-name-error`} className="field-error">{nameError}</p>}
      </div>

      <div className="field">
        <label htmlFor={`${id}-phone`}>Phone</label>
        <input
          id={`${id}-phone`}
          type="tel"
          autoComplete="tel"
          value={fields.phone}
          onChange={(event) => setField('phone', event.target.value)}
          aria-invalid={phoneError ? 'true' : undefined}
          aria-describedby={phoneError ? `${id}-phone-error` : undefined}
        />
        {phoneError && <p id={`${id}-phone-error`} className="field-error">{phoneError}</p>}
      </div>

      <div className="field">
        <label htmlFor={`${id}-note`}>Note (optional)</label>
        <textarea
          id={`${id}-note`}
          rows={3}
          maxLength={NOTE_MAX}
          value={fields.note}
          onChange={(event) => setField('note', event.target.value.slice(0, NOTE_MAX))}
          aria-describedby={`${id}-note-count`}
        />
        <p id={`${id}-note-count`} className="note-count">{fields.note.length}/{NOTE_MAX}</p>
      </div>

      <button type="submit">Place order</button>

      {/* Announced politely, but not role="status": the page has exactly one. */}
      <p aria-live="polite" className={cartError ? 'form-message field-error' : 'form-message'}>
        {cartError || confirmation}
      </p>
    </form>
  );
}

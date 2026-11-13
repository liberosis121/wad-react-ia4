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
  // Bootstrap only shows .invalid-feedback after a sibling with .is-invalid,
  // so an input with an error gets that class as well as aria-invalid.
  const nameError = submitted ? errors.name : undefined;
  const phoneError = submitted ? errors.phone : undefined;
  const cartError = submitted && itemCount === 0 ? 'Add something to the cart first.' : '';
  // The confirmation describes the order that emptied the cart, so it is only
  // shown while the cart is still empty: adding a product hides it. Worked out
  // here on every render — nothing is reset by an effect.
  const shownConfirmation = itemCount === 0 ? confirmation : '';

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
    <form aria-label="Checkout" className="border-top mt-3 pt-3" noValidate onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor={`${id}-name`} className="form-label">Name</label>
        <input
          id={`${id}-name`}
          type="text"
          className={nameError ? 'form-control is-invalid' : 'form-control'}
          autoComplete="name"
          value={fields.name}
          onChange={(event) => setField('name', event.target.value)}
          aria-invalid={nameError ? 'true' : undefined}
          aria-describedby={nameError ? `${id}-name-error` : undefined}
        />
        {nameError && <p id={`${id}-name-error`} className="invalid-feedback mb-0">{nameError}</p>}
      </div>

      <div className="mb-3">
        <label htmlFor={`${id}-phone`} className="form-label">Phone</label>
        <input
          id={`${id}-phone`}
          type="tel"
          className={phoneError ? 'form-control is-invalid' : 'form-control'}
          autoComplete="tel"
          value={fields.phone}
          onChange={(event) => setField('phone', event.target.value)}
          aria-invalid={phoneError ? 'true' : undefined}
          aria-describedby={phoneError ? `${id}-phone-error` : undefined}
        />
        {phoneError && <p id={`${id}-phone-error`} className="invalid-feedback mb-0">{phoneError}</p>}
      </div>

      <div className="mb-3">
        <label htmlFor={`${id}-note`} className="form-label">Note (optional)</label>
        <textarea
          id={`${id}-note`}
          className="form-control"
          rows={3}
          maxLength={NOTE_MAX}
          value={fields.note}
          onChange={(event) => setField('note', event.target.value.slice(0, NOTE_MAX))}
          aria-describedby={`${id}-note-count`}
        />
        <p id={`${id}-note-count`} className="form-text text-end mb-0">{fields.note.length}/{NOTE_MAX}</p>
      </div>

      <button type="submit" className="btn btn-primary w-100">Place order</button>

      {/* Announced politely, but not role="status": the page has exactly one. */}
      <p
        aria-live="polite"
        className={cartError ? 'mt-2 mb-0 text-danger-emphasis' : 'mt-2 mb-0 text-success-emphasis'}
      >
        {cartError || shownConfirmation}
      </p>
    </form>
  );
}

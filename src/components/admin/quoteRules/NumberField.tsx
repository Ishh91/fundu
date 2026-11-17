import { useEffect, useState } from 'react';

interface NumberFieldProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min: number;
  max: number;
  step?: number;
  /** Allow the field to be emptied (the value becomes undefined). */
  optional?: boolean;
  placeholder?: string;
  label: string;
  className?: string;
}

/**
 * A number input that keeps what is being typed ("0." on the way to "0.78") and only reports a value once it is a number.
 * It turns red when the number is outside min and max, so the admin sees the problem before saving.
 */
export default function NumberField({ value, onChange, min, max, step = 0.001, optional = false, placeholder, label, className = '' }: NumberFieldProps) {
  const [text, setText] = useState(value === undefined ? '' : String(value));

  // Follow the value when it is changed from outside (a reset, a rollback), but not while the typed text already means the same number.
  useEffect(() => {
    if (value === undefined ? text.trim() !== '' : Number(text) !== value) setText(value === undefined ? '' : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const parsed = text.trim() === '' ? undefined : Number(text);
  const outOfBounds = parsed !== undefined && (!Number.isFinite(parsed) || parsed < min || parsed > max);
  const missing = parsed === undefined && !optional;

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={label}
      aria-invalid={outOfBounds || missing}
      title={`${min} to ${max}`}
      placeholder={placeholder}
      value={text}
      step={step}
      onChange={(event) => {
        const next = event.target.value;
        setText(next);
        if (next.trim() === '') {
          if (optional) onChange(undefined);
          return;
        }
        const n = Number(next);
        if (Number.isFinite(n)) onChange(n);
      }}
      className={`input py-2 text-sm font-mono tabular-nums ${outOfBounds || missing ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
    />
  );
}

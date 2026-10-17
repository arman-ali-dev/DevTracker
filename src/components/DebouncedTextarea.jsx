import { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';

// Textarea that types instantly but saves after a short pause (autosave).
// It also saves when it is closed, so nothing typed is lost.
export default function DebouncedTextarea({ value, onSave, label, placeholder, rows = 4 }) {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text, 400);

  const savedRef = useRef(value); // last value we know is saved
  const textRef = useRef(value); // latest typed text
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  textRef.current = text;

  // Save after the pause.
  useEffect(() => {
    if (debounced !== savedRef.current) {
      savedRef.current = debounced;
      onSaveRef.current(debounced);
    }
  }, [debounced]);

  // If the value changes from outside (import / reset), show it.
  useEffect(() => {
    if (value !== savedRef.current) {
      savedRef.current = value;
      setText(value);
    }
  }, [value]);

  // Save pending text when the box closes.
  useEffect(
    () => () => {
      if (textRef.current !== savedRef.current) onSaveRef.current(textRef.current);
    },
    []
  );

  return (
    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
      {label}
      <textarea
        value={text}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
    </label>
  );
}

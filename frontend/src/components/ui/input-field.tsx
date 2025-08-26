import * as React from 'react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
  multiline = false,
  rows = 3,
  disabled = false,
}: InputFieldProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {multiline ? (
        <textarea
          className="border rounded px-2 py-1 w-full resize-none"
          value={value}
          placeholder={placeholder}
          required={required}
          rows={rows}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="border rounded px-2 py-1 w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={value}
          placeholder={placeholder}
          required={required}
          type={type}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

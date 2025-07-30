import React from 'react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: InputFieldProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="border rounded px-2 py-1 w-full"
        value={value}
        placeholder={placeholder}
        required={required}
        type={type}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

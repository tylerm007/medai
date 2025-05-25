// components/FormField.tsx
"use client";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  value: any;
  onChange: (value: string) => void;
  type?: "text" | "number" | "select" | "date" | "email";
  options?: string[];
  required?: boolean;
  step?: string;
  sub?: string;
}

export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  options,
  step,
  sub
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          required={required}
        >
          {options?.map((option) => (
            <option key={option} value={option}>
              {option || "Select"}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            required={required}
            step={step}
          />
          {sub && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              {sub}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
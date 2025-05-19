// src/lib/utils.ts

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

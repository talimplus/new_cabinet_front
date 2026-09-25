import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class lists with conflict-resolution.
 * `clsx` handles conditional/array/object class inputs; `twMerge` collapses
 * conflicting Tailwind utilities so the last one wins (e.g. `px-2 px-4` → `px-4`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

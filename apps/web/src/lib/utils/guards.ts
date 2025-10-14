// Shared guard and normalization utilities
// These help safely work with loosely typed/JSON fields and nullable values.

export interface ShippingAddress {
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postal_code: string;
  country: string; // ISO 2 code
  phone?: string;
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim().length > 0 ? v : undefined;
}

export function asNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

export function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const arr = v.filter(x => typeof x === 'string');
  return arr.length === v.length ? (arr as string[]) : undefined;
}

export function asShippingAddress(value: unknown): ShippingAddress | null {
  if (!isRecord(value)) return null;
  const street = asString(value.address_line_1) || asString((value as any).street);
  if (!asString(value.name) || !street || !asString(value.city) || !asString(value.postal_code) || !asString(value.country)) {
    return null;
  }
  return {
    name: value.name as string,
    address_line_1: street,
    address_line_2: asString(value.address_line_2),
    city: value.city as string,
    postal_code: value.postal_code as string,
    country: value.country as string,
    phone: asString(value.phone)
  };
}

// Generic null/undefined coalescer with type narrowing
export function orNull<T>(v: T | null | undefined): T | null {
  return v == null ? null : v;
}

export function ensure<T>(value: T | null | undefined, message: string): T {
  if (value == null) throw new Error(message);
  return value;
}

export function safeDate(v: unknown): Date | null {
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d;
  }
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  return null;
}

export function toNumber(v: unknown, fallback = 0): number {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
}

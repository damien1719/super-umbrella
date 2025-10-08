// Stable JSON stringify with sorted object keys and deterministic output
// and a FNV-1a 64-bit hash (hex string) over the resulting string.

/* eslint-disable @typescript-eslint/no-explicit-any */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

export function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();

  const stringify = (val: unknown): string => {
    if (val === null || typeof val === 'number' || typeof val === 'boolean') {
      return JSON.stringify(val);
    }
    if (typeof val === 'string') {
      return JSON.stringify(val);
    }
    if (Array.isArray(val)) {
      const parts: string[] = [];
      for (let i = 0; i < val.length; i++) {
        parts.push(stringify(val[i]));
      }
      return `[${parts.join(',')}]`;
    }
    if (isPlainObject(val)) {
      if (seen.has(val)) {
        // Cycles are not expected in Lexical JSON; fall back to null to avoid crashes
        return 'null';
      }
      seen.add(val);
      const keys = Object.keys(val).sort();
      const parts: string[] = [];
      for (const k of keys) {
        const v = (val as Record<string, unknown>)[k];
        // Skip undefined to match JSON.stringify behavior
        if (typeof v === 'undefined') continue;
        parts.push(`${JSON.stringify(k)}:${stringify(v)}`);
      }
      seen.delete(val);
      return `{${parts.join(',')}}`;
    }
    // Functions, symbols, undefined at top-level => JSON.stringify returns undefined; we normalize to null
    return 'null';
  };

  return stringify(value);
}

// FNV-1a 64-bit hash over JS string (UTF-16 code units)
export function hashStringFNV1a(input: string): string {
  // 64-bit FNV-1a offset basis and prime
  let hash = 0xcbf29ce484222325n; // 14695981039346656037
  const FNV_PRIME = 0x100000001b3n; // 1099511628211

  for (let i = 0; i < input.length; i++) {
    const code = BigInt(input.charCodeAt(i) & 0xffff);
    hash ^= code;
    hash *= FNV_PRIME;
    hash &= 0xffffffffffffffffn; // keep 64-bit
  }

  let hex = hash.toString(16);
  // zero-pad to 16 bytes (64 bits => 16 hex chars)
  if (hex.length < 16) hex = '0'.repeat(16 - hex.length) + hex;
  return hex;
}

export function hashJson(value: unknown): string {
  return hashStringFNV1a(stableStringify(value));
}

export default hashJson;


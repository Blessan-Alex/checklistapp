/** Firestore rejects `undefined`; strip recursively before writes. */
export function stripUndefined<T>(value: T): T {
  if (value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        out[key] = stripUndefined(val);
      }
    }
    return out as T;
  }
  return value;
}

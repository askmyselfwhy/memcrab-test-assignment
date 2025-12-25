export function merge<T>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}

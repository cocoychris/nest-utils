/**
 * Use `IsOptional()` instead of this function
 */
export function isTruthy(_: any, value: any): boolean {
  return !!value;
}
export function isFalsy(_: any, value: any): boolean {
  return !value;
}
export function isNull(_: any, value: any): boolean {
  return value === null;
}
export function isUndefined(_: any, value: any): boolean {
  return value === undefined;
}
export function isNotNull(_: any, value: any): boolean {
  return value !== null;
}
export function isNotUndefined(_: any, value: any): boolean {
  return value !== undefined;
}

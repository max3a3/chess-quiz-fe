export function isPrefix<T>(shorter: T[], longer: T[]): boolean {
  if (shorter.length > longer.length) {
    return false;
  }
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] !== longer[i]) {
      return false;
    }
  }
  return true;
}

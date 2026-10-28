export function visitOrdinalLabel(n: number): string {
  return n === 1 ? "첫" : `${n}번째`;
}

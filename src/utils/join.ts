export default function join(
  ...classNames: (string | null | undefined | boolean)[]
): string {
  return classNames.filter(Boolean).join(' ');
}

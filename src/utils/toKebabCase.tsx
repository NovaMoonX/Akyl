export default function toKebabCase(str: string): string {
  return str
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Replace special characters with hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase(); // Convert to lowercase
}

export function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function fromDateInputValue(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const date = new Date(`${value.trim()}T09:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

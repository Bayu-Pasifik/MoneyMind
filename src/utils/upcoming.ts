export function isDueSoon(dueDate: string, withinDays = 3): boolean {
  const diffMs = new Date(dueDate).getTime() - Date.now();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= withinDays;
}

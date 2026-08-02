export function parseDateString(str: string): Date | undefined {
  if (!str) return undefined;
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateTimeDisplay(dateStr: string, timeStr: string): string {
  if (!dateStr) return "";
  const d = parseDateString(dateStr);
  if (!d) return dateStr;
  const datePart = d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  if (!timeStr) return datePart;
  return `${datePart}, ${timeStr}`;
}

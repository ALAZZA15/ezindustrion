export const APP_TZ = "Asia/Jakarta";

// Rp900,000
export function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount).toLocaleString("en-US")}`;
}

// "12 Nov 2025" in WIB. Accepts YYYY-MM-DD or ISO datetime.
export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00+07:00`) : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: APP_TZ }).format(d);
}

// 6281211110002 -> +62 812-1111-0002
export function formatPhone(phone: string): string {
  if (!phone.startsWith("62")) return phone;
  const rest = phone.slice(2);
  return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`.replace(/-$/, "");
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}
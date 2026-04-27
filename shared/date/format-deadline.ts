import type { Locale } from "@/shared/i18n/translations";

function getIntlLocale(locale: Locale): string {
  return locale === "uk" ? "uk-UA" : "en-US";
}

export function formatDeadline(value: string | undefined, locale: Locale): string {
  if (!value) return "n/a";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "n/a";

  const intlLocale = getIntlLocale(locale);
  const formatter = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const byType = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const day = byType("day");
  const month = byType("month");
  const year = byType("year");
  const hour = byType("hour");
  const minute = byType("minute");

  if (locale === "uk") {
    return `${day} ${month} ${year} ${hour}:${minute}`;
  }

  return `${month} ${day}, ${year} ${hour}:${minute}`;
}

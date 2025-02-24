import { DateTime } from "luxon";

export function generateSixDigitsCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateCodeExpiration(): Date {
  const expiration = DateTime.now().plus({ hours: 2 });
  return expiration.toJSDate();
}

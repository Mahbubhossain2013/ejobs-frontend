/**
 * Currency conversion utility.
 * Reads from localStorage where CurrencySwitcher stores the selected rate.
 */

let cachedCode = "BDT";
let cachedSymbol = "৳";
let cachedRate = 1;

if (typeof window !== "undefined") {
  const load = () => {
    cachedCode = localStorage.getItem("currency_code") || "BDT";
    cachedSymbol = localStorage.getItem("currency_symbol") || "৳";
    cachedRate = parseFloat(localStorage.getItem("currency_rate") || "1") || 1;
  };
  load();
  window.addEventListener("storage", load);
}

/**
 * Convert a BDT price to the user's selected currency.
 * @param bdtPrice - Price in BDT (number or string)
 * @returns Formatted price string with symbol (e.g. "৳ 1,000" or "$ 12.50")
 */
export function convertPrice(bdtPrice: number | string | null | undefined): string {
  if (bdtPrice === null || bdtPrice === undefined || bdtPrice === "") return "—";
  const num = typeof bdtPrice === "string" ? parseFloat(bdtPrice) : bdtPrice;
  if (isNaN(num)) return "—";

  const converted = num * cachedRate;
  const formatted = converted.toLocaleString("en-US", {
    minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return `${cachedSymbol} ${formatted}`;
}

/**
 * Get the current currency code.
 */
export function getCurrencyCode(): string {
  return cachedCode;
}

/**
 * Get the current currency symbol.
 */
export function getCurrencySymbol(): string {
  return cachedSymbol;
}

/**
 * Get the current exchange rate (relative to BDT).
 */
export function getExchangeRate(): number {
  return cachedRate;
}

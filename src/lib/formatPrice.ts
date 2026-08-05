// ─── Price display ────────────────────────────────────────────────────────────
// The platform formats prices, not the business (same philosophy as amenities):
// partners enter a plain number, and every card/page renders it consistently
// in both languages. Accommodation reads per-night; everything else "From X".

export function formatPriceLabel(
  priceMin: number | null | undefined,
  mainCategory: string,
  lang: "en" | "fr",
  fallback?: string | null
): string | null {
  if (priceMin == null || priceMin <= 0) {
    const raw = fallback?.trim() || null;
    // Old free-text labels that are just a number (e.g. "8000") get formatted too
    if (raw && /^[\d\s.,]+$/.test(raw)) {
      const parsed = Number(raw.replace(/[^\d]/g, ""));
      if (parsed > 0) return formatPriceLabel(parsed, mainCategory, lang);
    }
    return raw;
  }

  const n = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US").format(priceMin);
  if (mainCategory === "accommodation") {
    return lang === "fr" ? `${n} XAF / nuit` : `${n} XAF / night`;
  }
  return lang === "fr" ? `À partir de ${n} XAF` : `From ${n} XAF`;
}

// ─── Diaspora price transparency ──────────────────────────────────────────────
// XAF (CFA franc BEAC) is pegged to the euro at a FIXED rate — the EUR figure
// is exact, no FX API needed. USD is indicative only, derived via the peg.

export const XAF_PER_EUR = 655.957; // fixed peg (BEAC)
const EUR_PER_USD_APPROX = 0.92; // indicative — update occasionally

export function formatDiasporaEquivalent(xaf: number | null | undefined): string | null {
  if (xaf == null || xaf <= 0) return null;
  const eur = xaf / XAF_PER_EUR;
  const usd = eur / EUR_PER_USD_APPROX;
  const fmt = (n: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: n < 100 ? 2 : 0,
    }).format(n);
  return `≈ ${fmt(eur, "EUR")} · ${fmt(usd, "USD")}`;
}

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

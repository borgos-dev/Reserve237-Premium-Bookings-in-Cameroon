"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  RiArrowLeftLine,
  RiCalendarLine,
  RiTimeLine,
  RiTeamLine,
  RiMapPinLine,
  RiBankCardLine,
  RiHandCoinLine,
  RiShieldCheckLine,
  RiCheckLine,
  RiAddLine,
  RiSubtractLine,
  RiCloseLine,
  RiGiftLine,
  RiWhatsappLine,
} from "react-icons/ri";
import type { Listing } from "@/data/listings";
import { generateSlug } from "@/lib/utils";
import { createBooking } from "@/actions/bookings";
import { formatDiasporaEquivalent } from "@/lib/formatPrice";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookingPageProps {
  listing: Listing;
  pricePerNight: number;
  mainCategory: string;
  userId?: string | null;
  unavailableDates?: string[];
}

type PaymentMethodId = "mtn-momo" | "orange-money" | "card" | "cash";

interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  sublabel: string;
  image?: string;
  icon?: typeof RiBankCardLine;
}

// Payment methods built inside component (uses translations)

const SERVICE_FEE_RATE = 0.07;

const fmtXAF = (n: number) => `${new Intl.NumberFormat("fr-CM").format(Math.round(n))} XAF`;

const today = () => new Date().toISOString().slice(0, 10);
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export function BookingPage({ listing, pricePerNight, mainCategory, userId, unavailableDates = [] }: BookingPageProps) {
  const slug = generateSlug(listing.name);
  const { t, lang } = useLanguage();
  const isAccommodation = mainCategory === "accommodation";

  const PAYMENT_METHODS: PaymentMethod[] = [
    { id: "mtn-momo", label: "MTN MoMo", sublabel: t("mobile_money"), image: "/mtn%20logo%20momo.png" },
    { id: "orange-money", label: "Orange Money", sublabel: t("mobile_money"), image: "/orange-money-logo-png_seeklogo-440383.png" },
    { id: "card", label: t("credit_debit_card"), sublabel: t("visa_mastercard"), icon: RiBankCardLine },
    { id: "cash", label: t("cash_on_arrival"), sublabel: t("pay_at_venue"), icon: RiHandCoinLine },
  ];

  const [checkIn, setCheckIn] = useState<string>(today());
  const [checkOut, setCheckOut] = useState<string>(tomorrow());
  const [bookingDate, setBookingDate] = useState<string>(today());
  const [bookingTime, setBookingTime] = useState<string>("19:00");
  const [guests, setGuests] = useState<number>(2);
  const [payment, setPayment] = useState<PaymentMethodId>("mtn-momo");
  const [form, setForm] = useState({ name: "", phone: "", email: "", requests: "" });
  const [isGift, setIsGift] = useState(false);
  const [giftForm, setGiftForm] = useState({ bookerName: "", bookerPhone: "", giftMessage: "" });
  const [confirmation, setConfirmation] = useState<{ bookingRef: string; totalXaf: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Dates the customer cannot pick (partner-blocked + already-booked)
  const unavailable = useMemo(() => new Set(unavailableDates), [unavailableDates]);

  const dateError = useMemo(() => {
    if (isAccommodation) {
      if (!checkIn || !checkOut || checkIn >= checkOut) return null;
      const cur = new Date(checkIn);
      const end = new Date(checkOut);
      while (cur < end) {
        if (unavailable.has(cur.toISOString().slice(0, 10))) return t("dates_unavailable_range");
        cur.setDate(cur.getDate() + 1);
      }
      return null;
    }
    return bookingDate && unavailable.has(bookingDate) ? t("date_unavailable") : null;
  }, [isAccommodation, checkIn, checkOut, bookingDate, unavailable, t]);

  const { nights, subtotal, serviceFee, total } = useMemo(() => {
    if (isAccommodation) {
      const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
      const n = Math.max(0, Math.round(ms / 86_400_000));
      const sub = pricePerNight * Math.max(1, n) * Math.max(1, guests);
      const fee = sub * SERVICE_FEE_RATE;
      return { nights: n, subtotal: sub, serviceFee: fee, total: sub + fee };
    }
    const sub = pricePerNight * Math.max(1, guests);
    const fee = sub * SERVICE_FEE_RATE;
    return { nights: 0, subtotal: sub, serviceFee: fee, total: sub + fee };
  }, [isAccommodation, checkIn, checkOut, guests, pricePerNight]);

  const formValid =
    form.name.trim().length > 1 &&
    form.phone.trim().length >= 6 &&
    form.email.includes("@") &&
    (isAccommodation ? nights > 0 : bookingDate.length > 0 && bookingTime.length > 0) &&
    !dateError &&
    (!isGift ||
      (giftForm.bookerName.trim().length > 1 && giftForm.bookerPhone.trim().length >= 6));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    const result = await createBooking({
      listingSlug: slug,
      userId,
      guestName: form.name,
      guestEmail: form.email,
      guestPhone: form.phone,
      ...(isAccommodation ? { checkIn, checkOut } : { bookingDate, bookingTime }),
      guests,
      paymentMethod: payment,
      notes: form.requests || undefined,
      isGift,
      ...(isGift
        ? {
            bookerName: giftForm.bookerName,
            bookerEmail: form.email,
            bookerPhone: giftForm.bookerPhone,
            giftMessage: giftForm.giftMessage || undefined,
          }
        : {}),
    });

    setSubmitting(false);

    if (result.success) {
      setConfirmation({ bookingRef: result.bookingRef, totalXaf: result.totalXaf });
    } else {
      setSubmitError(result.error);
    }
  };

  // Shareable WhatsApp summary — for gifts it can go straight to the beneficiary
  const whatsappShareLink = useMemo(() => {
    if (!confirmation) return null;
    const dates = isAccommodation ? `${checkIn} → ${checkOut}` : `${bookingDate} · ${bookingTime}`;
    const lines =
      lang === "fr"
        ? [
            `🎉 Réservation Reserve237`,
            `📍 ${listing.name}`,
            `📅 ${dates}`,
            `🔖 ${t("booking_reference")}: ${confirmation.bookingRef}`,
            ...(isGift && giftForm.giftMessage ? [``, `💬 ${giftForm.giftMessage}`] : []),
          ]
        : [
            `🎉 Reserve237 booking`,
            `📍 ${listing.name}`,
            `📅 ${dates}`,
            `🔖 ${t("booking_reference")}: ${confirmation.bookingRef}`,
            ...(isGift && giftForm.giftMessage ? [``, `💬 ${giftForm.giftMessage}`] : []),
          ];
    const text = encodeURIComponent(lines.join("\n"));
    const beneficiaryDigits = isGift ? form.phone.replace(/\D/g, "") : "";
    return beneficiaryDigits
      ? `https://wa.me/${beneficiaryDigits}?text=${text}`
      : `https://wa.me/?text=${text}`;
  }, [confirmation, isAccommodation, checkIn, checkOut, bookingDate, bookingTime, lang, listing.name, isGift, giftForm.giftMessage, form.phone, t]);

  const inputClass =
    "w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder:text-[var(--text-tertiary)]";

  return (
    <main className="bg-[var(--surface-1)] text-[var(--foreground)] min-h-screen pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28">
        {/* Back to listing */}
        <Link
          href={`/listing/${slug}`}
          className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6 text-sm"
        >
          <RiArrowLeftLine className="w-4 h-4" />
          {t("back_to_listing")}
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">{t("confirm_and_pay")}</h1>
        <p className="text-[var(--muted-foreground)] text-sm mb-8">
          {t("confirm_and_pay_subtitle")}
        </p>

        {/* ── Property Recap ── */}
        <div className="card flex items-center gap-4 p-4 mb-5">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-none">
            <Image
              src={listing.image}
              alt={listing.name}
              fill
              sizes="80px"
              unoptimized={listing.image.startsWith("http")}
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mb-0.5">
              {t("your_booking")}
            </p>
            <h2 className="font-semibold text-base sm:text-lg leading-tight truncate">
              {listing.name}
            </h2>
            <div className="flex items-center gap-1.5 text-[var(--muted-foreground)] text-sm mt-1">
              <RiMapPinLine className="w-4 h-4 flex-none" />
              <span className="truncate">{listing.location}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Booking Summary ── */}
          <section className="card space-y-4">
            <h3 className="font-semibold text-base">{t("booking_details")}</h3>

            {isAccommodation ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                    {t("check_in")}
                  </span>
                  <div className="relative">
                    <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                    <input
                      type="date"
                      value={checkIn}
                      min={today()}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (e.target.value >= checkOut) {
                          const d = new Date(e.target.value);
                          d.setDate(d.getDate() + 1);
                          setCheckOut(d.toISOString().slice(0, 10));
                        }
                      }}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                    {t("check_out")}
                  </span>
                  <div className="relative">
                    <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                    {t("booking_date")}
                  </span>
                  <div className="relative">
                    <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                    <input
                      type="date"
                      value={bookingDate}
                      min={today()}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                    {t("booking_time")}
                  </span>
                  <div className="relative">
                    <RiTimeLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </label>
              </div>
            )}

            {/* Availability conflict — caught before submit, not after */}
            {dateError && (
              <p className="text-sm text-red-500 px-4 py-2 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-800">
                {dateError}
              </p>
            )}

            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <RiTeamLine className="w-4 h-4" />
                <span>{t("guests")}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface-1)] transition-colors disabled:opacity-40"
                  disabled={guests <= 1}
                  aria-label={t("decrease_guests")}
                >
                  <RiSubtractLine className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold tabular-nums">{guests}</span>
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(listing.capacity ?? 20, g + 1))}
                  className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface-1)] transition-colors disabled:opacity-40"
                  disabled={guests >= (listing.capacity ?? 20)}
                  aria-label={t("increase_guests")}
                >
                  <RiAddLine className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isAccommodation && (
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">{t("duration")}</span>
                <span className="font-medium">
                  {nights} {nights === 1 ? t("night") : t("nights")}
                </span>
              </div>
            )}
          </section>

          {/* ── Price Breakdown ── */}
          <section className="card space-y-3">
            <h3 className="font-semibold text-base">{t("price_breakdown")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">
                  {isAccommodation
                    ? `${fmtXAF(pricePerNight)} × ${Math.max(1, nights)} ${nights === 1 ? t("night") : t("nights")} × ${guests}`
                    : `${fmtXAF(pricePerNight)} × ${guests} ${guests === 1 ? t("guest_singular") : t("guest_plural")}`}
                </span>
                <span className="font-medium tabular-nums">{fmtXAF(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">
                  {t("service_fee")} ({Math.round(SERVICE_FEE_RATE * 100)}%)
                </span>
                <span className="font-medium tabular-nums">{fmtXAF(serviceFee)}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <span className="font-semibold">{t("total")}</span>
              <span className="font-display text-2xl font-bold text-[var(--primary)] tabular-nums">
                {fmtXAF(total)}
              </span>
            </div>
            {/* Diaspora transparency — XAF is pegged to EUR, so € is exact */}
            {formatDiasporaEquivalent(total) && (
              <p className="text-xs text-[var(--muted-foreground)] text-right">
                {formatDiasporaEquivalent(total)} <span className="opacity-70">· {t("diaspora_rate_note")}</span>
              </p>
            )}
          </section>

          {/* ── Gift toggle (diaspora) ── */}
          <section className="card space-y-4">
            <button
              type="button"
              onClick={() => setIsGift((g) => !g)}
              className={`w-full text-left rounded-2xl p-4 border-2 transition-all flex items-start gap-3 ${
                isGift
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--primary)]/40"
              }`}
              aria-pressed={isGift}
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--surface-2)] flex items-center justify-center flex-none">
                <RiGiftLine className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm leading-tight">{t("gift_toggle")}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{t("gift_toggle_sub")}</p>
              </div>
              {isGift && (
                <span className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center flex-none mt-0.5">
                  <RiCheckLine className="w-3 h-3 text-[var(--primary-foreground)]" />
                </span>
              )}
            </button>
          </section>

          {/* ── Guest / Beneficiary Details ── */}
          <section className="card space-y-4">
            <h3 className="font-semibold text-base">
              {isGift ? t("beneficiary_details") : t("guest_details")}
            </h3>

            <label className="block">
              <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                {isGift ? t("beneficiary_name") : t("full_name")}
              </span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("as_shown_on_id")}
                className={inputClass}
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                  {isGift ? t("beneficiary_phone") : t("phone_number")}
                </span>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+237 6xx xxx xxx"
                  className={inputClass}
                />
              </label>

              {!isGift && (
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                    {t("email")}
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </label>
              )}
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                {t("special_requests")} <span className="text-[var(--text-tertiary)] normal-case tracking-normal">({t("optional")})</span>
              </span>
              <textarea
                rows={3}
                value={form.requests}
                onChange={(e) => setForm({ ...form, requests: e.target.value })}
                placeholder={t("special_requests_placeholder")}
                className={`${inputClass} resize-none`}
              />
            </label>
          </section>

          {/* ── Payer details (gift bookings only) ── */}
          {isGift && (
            <section className="card space-y-4">
              <h3 className="font-semibold text-base">{t("your_details_payer")}</h3>

              <label className="block">
                <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                  {t("full_name")}
                </span>
                <input
                  type="text"
                  required
                  value={giftForm.bookerName}
                  onChange={(e) => setGiftForm({ ...giftForm, bookerName: e.target.value })}
                  className={inputClass}
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                    {t("phone_number")}
                  </span>
                  <input
                    type="tel"
                    required
                    value={giftForm.bookerPhone}
                    onChange={(e) => setGiftForm({ ...giftForm, bookerPhone: e.target.value })}
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                    {t("email")}
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5">
                  {t("gift_message")} <span className="text-[var(--text-tertiary)] normal-case tracking-normal">({t("optional")})</span>
                </span>
                <textarea
                  rows={2}
                  value={giftForm.giftMessage}
                  onChange={(e) => setGiftForm({ ...giftForm, giftMessage: e.target.value })}
                  placeholder={t("gift_message_placeholder")}
                  className={`${inputClass} resize-none`}
                />
              </label>
            </section>
          )}

          {/* ── Payment Method ── */}
          <section className="card space-y-4">
            <h3 className="font-semibold text-base">{t("payment_method")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((m) => {
                const selected = payment === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayment(m.id)}
                    className={`relative text-left rounded-2xl p-4 border-2 transition-all flex items-center gap-3 ${
                      selected
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--primary)]/40"
                    }`}
                    aria-pressed={selected}
                  >
                    <div className="w-11 h-11 rounded-xl bg-[var(--surface-2)] flex items-center justify-center flex-none overflow-hidden">
                      {m.image ? (
                        <Image
                          src={m.image}
                          alt={m.label}
                          width={36}
                          height={36}
                          className="object-contain"
                          unoptimized
                        />
                      ) : Icon ? (
                        <Icon className="w-5 h-5 text-[var(--primary)]" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm leading-tight">{m.label}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{m.sublabel}</p>
                    </div>
                    {selected && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                        <RiCheckLine className="w-3 h-3 text-[var(--primary-foreground)]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Honest until Campay lands: no card is charged on this page */}
            <p className="text-xs text-[var(--muted-foreground)]">{t("payment_method_note")}</p>
          </section>

          {/* ── Error message ── */}
          {submitError && (
            <p className="text-sm text-red-500 text-center px-4 py-2 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-800">
              {submitError}
            </p>
          )}

          {/* ── Confirm ── */}
          <button
            type="submit"
            disabled={!formValid || submitting}
            className="w-full py-4 rounded-full bg-[#13695A] hover:bg-[#0A5C4A] text-[#F8F1EA] text-base font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? t("processing")
              : formValid
              ? `${t("confirm_booking")} — ${fmtXAF(total)}`
              : t("complete_details")}
          </button>

          {/* ── Footer notes ── */}
          <div className="pt-2 space-y-2 text-xs text-[var(--muted-foreground)] text-center">
            <p className="inline-flex items-center justify-center gap-1.5">
              <RiShieldCheckLine className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{t("secure_booking")}</span>
            </p>
            <p>{t("free_cancellation")}</p>
          </div>
        </form>
      </div>

      {/* ── Confirmation modal ── */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2A2A]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md card text-center px-6 py-8 max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setConfirmation(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-[var(--surface-1)] flex items-center justify-center text-[var(--muted-foreground)]"
                aria-label="Close"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--primary)] flex items-center justify-center mb-4">
                <RiCheckLine className="w-7 h-7 text-[var(--primary-foreground)]" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">{t("booking_confirmed")}</h2>
              <p className="text-[var(--muted-foreground)] text-sm mb-5">
                {t("confirmation_sent_to")} <span className="font-medium text-[var(--foreground)]">{form.email}</span>.
                {" "}{t("venue_contact")}
              </p>

              {/* Booking reference — the thing to show on arrival */}
              <div className="bg-[var(--primary)]/8 border border-[var(--primary)]/20 rounded-2xl p-4 mb-4">
                <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                  {t("booking_reference")}
                </p>
                <p className="font-display text-2xl font-bold tracking-[0.2em] text-[var(--primary)]">
                  {confirmation.bookingRef}
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-1">{t("booking_reference_note")}</p>
              </div>

              <div className="bg-[var(--surface-1)] rounded-2xl p-4 text-left text-sm space-y-1.5 mb-5">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">{t("property")}</span>
                  <span className="font-medium truncate ml-3">{listing.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">{t("dates")}</span>
                  <span className="font-medium">
                    {isAccommodation ? `${checkIn} → ${checkOut}` : `${bookingDate} · ${bookingTime}`}
                  </span>
                </div>
                {isGift && (
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">{t("gift_for")}</span>
                    <span className="font-medium truncate ml-3">{form.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">{t("total_due")}</span>
                  <span className="font-semibold text-[var(--primary)] tabular-nums">{fmtXAF(confirmation.totalXaf)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {whatsappShareLink && (
                  <a
                    href={whatsappShareLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold text-sm bg-[#25D366] hover:bg-[#20BA5A] text-white transition-colors"
                  >
                    <RiWhatsappLine className="w-5 h-5" />
                    {t("share_whatsapp")}
                  </a>
                )}
                {userId ? (
                  <Link
                    href="/profile"
                    className="block w-full py-3 rounded-full bg-[#13695A] hover:bg-[#0A5C4A] text-[#F8F1EA] font-semibold transition-colors"
                  >
                    {t("view_my_bookings")}
                  </Link>
                ) : (
                  <Link
                    href="/"
                    className="block w-full py-3 rounded-full bg-[#13695A] hover:bg-[#0A5C4A] text-[#F8F1EA] font-semibold transition-colors"
                  >
                    {t("back_to_home")}
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

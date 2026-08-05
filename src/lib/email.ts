// EmailJS REST API — works server-side (no browser SDK needed)
const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send'

const PAYMENT_LABELS: Record<string, string> = {
  'mtn-momo': 'MTN MoMo',
  'orange-money': 'Orange Money',
  card: 'Credit/Debit Card',
  cash: 'Cash on Arrival',
}

function fmtXAF(n: number): string {
  return new Intl.NumberFormat('fr-CM').format(Math.round(n)) + ' XAF'
}

async function sendEmail(templateId: string, params: Record<string, string | number>): Promise<void> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  if (!serviceId || !publicKey || !templateId) return

  try {
    await fetch(EMAILJS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: params,
      }),
    })
  } catch (err) {
    console.error('[email] Failed to send:', templateId, err)
  }
}

// ─── Team inbox notification ──────────────────────────────────────────────────
// Reuses the contact-form template (same fields, same destination inbox) so
// operational alerts don't need a separate EmailJS template to be configured.

export interface TeamNotificationData {
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
}

export async function sendTeamNotification(data: TeamNotificationData): Promise<void> {
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  if (!templateId) return

  await sendEmail(templateId, {
    name: data.name,
    email: data.email,
    phone: data.phone ?? '',
    subject: data.subject,
    message: data.message,
    reply_to: data.email,
  })
}

// ─── Booking outcome ──────────────────────────────────────────────────────────
// The return leg of the conversation: the business answered, and the client has
// to hear about it. Without this a client books, gets a "pending" email, and
// never learns whether they have a table.
//
// Needs one EmailJS template exposed as EMAILJS_TEMPLATE_BOOKING_STATUS with
// params: to_name, to_email, listing_name, booking_ref, dates, guests,
// status_label, message. Unset → silent no-op, same as every other template.

export interface BookingStatusEmailData {
  customerEmail: string
  customerName: string
  listingName: string
  bookingRef: string
  dates: string
  guests: number
  status: 'confirmed' | 'cancelled' | 'completed'
  /** Free-text reason shown to the client when a booking is cancelled. */
  reason?: string | null
  /** Who cancelled — changes the wording so nobody is blamed by mistake. */
  cancelledBy?: 'partner' | 'customer' | null
  /** Lets the client reply straight to the venue instead of to the platform. */
  partnerPhone?: string | null
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed / Confirmée',
  cancelled: 'Cancelled / Annulée',
  completed: 'Completed / Terminée',
}

/**
 * Low-level sender for the status template. Addressed by to_email, so the same
 * template serves the client ("the venue confirmed you") and the business
 * ("your client cancelled") — one template to configure instead of two.
 */
export async function sendBookingNoticeEmail(notice: {
  toEmail: string
  toName: string
  listingName: string
  bookingRef: string
  dates: string
  guests: number
  statusLabel: string
  message: string
}): Promise<void> {
  const templateId = process.env.EMAILJS_TEMPLATE_BOOKING_STATUS
  if (!templateId || !notice.toEmail) return

  await sendEmail(templateId, {
    to_name: notice.toName,
    to_email: notice.toEmail,
    listing_name: notice.listingName,
    booking_ref: notice.bookingRef,
    dates: notice.dates,
    guests: notice.guests,
    status_label: notice.statusLabel,
    message: notice.message,
  })
}

function statusMessage(data: BookingStatusEmailData): string {
  const contact = data.partnerPhone
    ? `\n\nQuestions? Call the venue directly on ${data.partnerPhone}.`
    : ''

  if (data.status === 'confirmed') {
    return (
      `Good news — ${data.listingName} has confirmed your booking for ${data.dates}.\n` +
      `Show reference ${data.bookingRef} on arrival.` +
      contact +
      `\n\nBonne nouvelle — ${data.listingName} a confirmé votre réservation pour ${data.dates}. ` +
      `Présentez la référence ${data.bookingRef} à votre arrivée.`
    )
  }

  if (data.status === 'cancelled') {
    const who =
      data.cancelledBy === 'customer'
        ? 'Your booking has been cancelled as requested.'
        : `${data.listingName} could not honour your booking for ${data.dates}.`
    const why = data.reason ? `\nReason: ${data.reason}` : ''
    return (
      `${who}${why}\nNo money has been taken.` +
      contact +
      `\n\nVotre réservation ${data.bookingRef} a été annulée.${
        data.reason ? ` Motif : ${data.reason}` : ''
      } Aucun montant n'a été prélevé.`
    )
  }

  return (
    `Thanks for visiting ${data.listingName}. Your booking ${data.bookingRef} is now complete — ` +
    `we'd love to hear how it went.` +
    `\n\nMerci d'avoir choisi ${data.listingName}. Votre réservation ${data.bookingRef} est terminée — ` +
    `partagez votre avis.`
  )
}

export async function sendBookingStatusEmail(data: BookingStatusEmailData): Promise<void> {
  await sendBookingNoticeEmail({
    toEmail: data.customerEmail,
    toName: data.customerName,
    listingName: data.listingName,
    bookingRef: data.bookingRef,
    dates: data.dates,
    guests: data.guests,
    statusLabel: STATUS_LABELS[data.status] ?? data.status,
    message: statusMessage(data),
  })
}

export interface BookingEmailData {
  customerEmail: string
  customerName: string
  customerPhone: string
  partnerEmail: string | null | undefined
  partnerName: string | null | undefined
  listingName: string
  bookingRef: string     // short booking ID for display
  dates: string          // "2026-07-01 → 2026-07-03" or "2026-07-01 · 19:00"
  guests: number
  totalXaf: number
  paymentMethod: string
  // Diaspora gifting — set when the payer books for a beneficiary in Cameroon
  isGift?: boolean
  beneficiaryName?: string
}

export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
  const customerTemplateId = process.env.EMAILJS_TEMPLATE_BOOKING_CUSTOMER
  const partnerTemplateId = process.env.EMAILJS_TEMPLATE_BOOKING_PARTNER

  const paymentLabel = PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod
  const totalFormatted = fmtXAF(data.totalXaf)

  // A gift booking labels the arriving guest so both emails stay unambiguous
  const giftNote = data.isGift && data.beneficiaryName
    ? ` (gift booking — guest: ${data.beneficiaryName})`
    : ''

  // 1. Confirmation to customer (the payer, for gift bookings)
  if (customerTemplateId) {
    await sendEmail(customerTemplateId, {
      to_name: data.customerName,
      to_email: data.customerEmail,
      listing_name: data.listingName + giftNote,
      booking_ref: data.bookingRef,
      dates: data.dates,
      guests: data.guests,
      total: totalFormatted,
      payment_method: paymentLabel,
    })
  }

  // 2. Alert to business partner
  if (partnerTemplateId && data.partnerEmail) {
    await sendEmail(partnerTemplateId, {
      to_name: data.partnerName ?? 'Partner',
      to_email: data.partnerEmail,
      listing_name: data.listingName + giftNote,
      customer_name: data.isGift && data.beneficiaryName ? data.beneficiaryName : data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail,
      booking_ref: data.bookingRef,
      dates: data.dates,
      guests: data.guests,
      total: totalFormatted,
      payment_method: paymentLabel,
    })
  }
}

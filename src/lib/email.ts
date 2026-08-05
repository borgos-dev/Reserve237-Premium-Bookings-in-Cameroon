// EmailJS REST API — works server-side (no browser SDK needed)
//
// ─── One template, on purpose ────────────────────────────────────────────────
// EmailJS caps how many templates an account may hold, and this platform needs
// at least five distinct emails. So every notification — client, business, team
// — goes through ONE template configured as a bare shell:
//
//     To         {{to_email}}
//     Reply-To   {{reply_to}}
//     Subject    {{subject}}
//     Content    {{message}}
//
// Every word a recipient reads is composed below, in TypeScript. Adding a new
// kind of email costs nothing in the dashboard, and the copy lives in source
// that can be reviewed and diffed instead of a web form that cannot.
//
// EMAILJS_TEMPLATE_NOTIFY names that shell. It falls back to the contact-form
// template only so a half-configured account still sends something; when the
// account has a spare slot, give notifications their own template and leave the
// contact form's bespoke design alone.
const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://reserve237.com'

const PAYMENT_LABELS: Record<string, string> = {
  'mtn-momo': 'MTN MoMo',
  'orange-money': 'Orange Money',
  card: 'Credit/Debit Card',
  cash: 'Cash on Arrival',
}

function fmtXAF(n: number): string {
  return new Intl.NumberFormat('fr-CM').format(Math.round(n)) + ' XAF'
}

/** Drops empty lines that came from optional fields, keeps deliberate blanks. */
function lines(...parts: (string | null | undefined | false)[]): string {
  return parts.filter((p) => p !== null && p !== undefined && p !== false).join('\n')
}

export interface Mail {
  to: string
  toName?: string
  subject: string
  body: string
  /** Where a reply should land — defaults to the recipient. */
  replyTo?: string
}

export async function sendMail(mail: Mail): Promise<boolean> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  // `||`, not `??` — an unset var in .env.local arrives as "" rather than
  // undefined, and `??` would happily hand an empty template ID downstream.
  const templateId =
    process.env.EMAILJS_TEMPLATE_NOTIFY || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  const privateKey = process.env.EMAILJS_PRIVATE_KEY

  const missing = [
    !serviceId && 'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
    !publicKey && 'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY',
    !templateId && 'EMAILJS_TEMPLATE_NOTIFY or NEXT_PUBLIC_EMAILJS_TEMPLATE_ID',
    !mail.to && 'recipient address',
  ].filter(Boolean)

  if (missing.length) {
    // Say why. Returning a bare false here is what hid the fact that this
    // platform had never delivered a single booking email.
    console.error('[email] Not sent — missing:', missing.join(', '))
    return false
  }

  try {
    const res = await fetch(EMAILJS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        // EmailJS refuses calls that don't come from a browser unless the
        // account opts in, and in strict mode it also wants the private key.
        // Sending it whenever we have one satisfies both settings.
        ...(privateKey ? { accessToken: privateKey } : {}),
        template_params: {
          to_email: mail.to,
          to_name: mail.toName ?? '',
          subject: mail.subject,
          message: mail.body,
          reply_to: mail.replyTo ?? mail.to,
        },
      }),
    })

    if (!res.ok) {
      // Swallowing this is what let booking mail look healthy while delivering
      // nothing — a bad status must always be visible in the logs.
      console.error('[email] EmailJS rejected the message:', res.status, await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('[email] Failed to send:', err)
    return false
  }
}

// ─── Team inbox notification ──────────────────────────────────────────────────

export interface TeamNotificationData {
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
}

export async function sendTeamNotification(data: TeamNotificationData): Promise<void> {
  const inbox = process.env.TEAM_INBOX_EMAIL ?? process.env.NEXT_PUBLIC_TEAM_EMAIL
  if (!inbox) return

  await sendMail({
    to: inbox,
    toName: 'Reserve237',
    subject: data.subject,
    replyTo: data.email || undefined,
    body: lines(
      `From: ${data.name}${data.email ? ` <${data.email}>` : ''}`,
      data.phone ? `Phone: ${data.phone}` : null,
      '',
      data.message,
    ),
  })
}

// ─── Shared booking blocks ────────────────────────────────────────────────────

function detailBlock(d: {
  listingName: string
  bookingRef: string
  dates: string
  guests: number
  total?: string
  paymentMethod?: string
}): string {
  return lines(
    `— ${d.listingName}`,
    `Référence / Reference : ${d.bookingRef}`,
    `Date : ${d.dates}`,
    `Personnes / Guests : ${d.guests}`,
    d.total ? `Total : ${d.total}` : null,
    d.paymentMethod ? `Paiement / Payment : ${d.paymentMethod}` : null,
  )
}

/** Reserve237 never decides anything — every email points back to the venue. */
function venueLine(phone?: string | null): string | null {
  return phone
    ? `\nUne question ? Appelez directement l'établissement au ${phone}.\nQuestions? Call the venue directly on ${phone}.`
    : null
}

// ─── Booking outcome ──────────────────────────────────────────────────────────
// The return leg of the conversation: the business answered, and the client has
// to hear about it. Without this a client books, gets a "pending" email, and
// never learns whether they have a table.

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
  confirmed: 'Confirmée / Confirmed',
  cancelled: 'Annulée / Cancelled',
  completed: 'Terminée / Completed',
}

/**
 * Low-level sender for any booking notice. Addressed by recipient, so the same
 * shape serves the client ("the venue confirmed you") and the business ("your
 * client cancelled").
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
  if (!notice.toEmail) return

  await sendMail({
    to: notice.toEmail,
    toName: notice.toName,
    subject: `${notice.statusLabel} — ${notice.listingName} (${notice.bookingRef})`,
    body: lines(
      `Bonjour ${notice.toName},`,
      '',
      notice.message,
      '',
      detailBlock(notice),
      '',
      'Reserve237',
    ),
  })
}

function statusMessage(data: BookingStatusEmailData): string {
  const contact = venueLine(data.partnerPhone)

  if (data.status === 'confirmed') {
    return lines(
      `Bonne nouvelle — ${data.listingName} a confirmé votre réservation pour ${data.dates}. ` +
        `Présentez la référence ${data.bookingRef} à votre arrivée.`,
      '',
      `Good news — ${data.listingName} has confirmed your booking for ${data.dates}. ` +
        `Show reference ${data.bookingRef} on arrival.`,
      contact,
    )
  }

  if (data.status === 'cancelled') {
    const fr =
      data.cancelledBy === 'customer'
        ? 'Votre réservation a été annulée à votre demande.'
        : `${data.listingName} n'a pas pu honorer votre réservation du ${data.dates}.`
    const en =
      data.cancelledBy === 'customer'
        ? 'Your booking has been cancelled as requested.'
        : `${data.listingName} could not honour your booking for ${data.dates}.`
    return lines(
      fr,
      data.reason ? `Motif : ${data.reason}` : null,
      "Aucun montant n'a été prélevé.",
      '',
      en,
      data.reason ? `Reason: ${data.reason}` : null,
      'No money has been taken.',
      contact,
    )
  }

  return lines(
    `Merci d'avoir choisi ${data.listingName}. Votre réservation ${data.bookingRef} est terminée — ` +
      `partagez votre avis.`,
    '',
    `Thanks for visiting ${data.listingName}. Your booking ${data.bookingRef} is now complete — ` +
      `we'd love to hear how it went.`,
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

// ─── New booking ──────────────────────────────────────────────────────────────

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
  const paymentLabel = PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod
  const total = fmtXAF(data.totalXaf)

  // A gift booking labels the arriving guest so both emails stay unambiguous
  const giftNote =
    data.isGift && data.beneficiaryName
      ? ` (réservation cadeau — invité : ${data.beneficiaryName})`
      : ''
  const listingName = data.listingName + giftNote

  const details = detailBlock({
    listingName,
    bookingRef: data.bookingRef,
    dates: data.dates,
    guests: data.guests,
    total,
    paymentMethod: paymentLabel,
  })

  // 1. Acknowledgement to the customer (the payer, for gift bookings).
  //    Careful wording: the request is *sent*, not accepted. Only the venue
  //    can accept it, and it has not answered yet.
  await sendMail({
    to: data.customerEmail,
    toName: data.customerName,
    subject: `Demande de réservation ${data.bookingRef} — ${data.listingName}`,
    body: lines(
      `Bonjour ${data.customerName},`,
      '',
      `Votre demande a bien été transmise à ${data.listingName}. ` +
        `L'établissement vous répondra pour confirmer ou refuser — vous recevrez un email et un SMS dès sa réponse.`,
      '',
      details,
      '',
      `Suivez ou annulez votre réservation ici : ${APP_URL}/booking`,
      '',
      '— — —',
      '',
      `Hello ${data.customerName}, your request has been passed to ${data.listingName}. ` +
        `The venue will confirm or decline it, and we'll email and text you the moment it answers.`,
      `Track or cancel your booking: ${APP_URL}/booking`,
      '',
      'Reserve237',
    ),
  })

  // 2. Alert to the business — the only email that needs to prompt an action
  if (data.partnerEmail) {
    const guestName =
      data.isGift && data.beneficiaryName ? data.beneficiaryName : data.customerName

    await sendMail({
      to: data.partnerEmail,
      toName: data.partnerName ?? 'Partenaire',
      replyTo: data.customerEmail,
      subject: `Nouvelle réservation ${data.bookingRef} — ${data.listingName}`,
      body: lines(
        `Bonjour ${data.partnerName ?? ''},`.replace(' ,', ','),
        '',
        `Vous avez une nouvelle demande de réservation. Confirmez-la ou refusez-la depuis votre tableau de bord — ` +
          `le client sera prévenu automatiquement de votre réponse.`,
        '',
        details,
        '',
        `Client : ${guestName}`,
        `Téléphone : ${data.customerPhone}`,
        `Email : ${data.customerEmail}`,
        '',
        `Répondre maintenant : ${APP_URL}/dashboard`,
        '',
        '— — —',
        '',
        `You have a new booking request. Confirm or decline it from your dashboard and the guest is notified automatically.`,
        '',
        'Reserve237',
      ),
    })
  }
}

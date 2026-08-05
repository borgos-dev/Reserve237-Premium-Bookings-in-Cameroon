// SMS delivery — provider-agnostic.
//
// Reserve237 never decides a booking; it only carries the message between the
// client and the business. Email is the guaranteed floor (see ./email.ts); SMS
// is the channel that actually gets read on a phone in Cameroon.
//
// Configure exactly one provider through env. With none set every call is a
// silent no-op, so the booking flow keeps working before an account exists.
//
//   SMS_PROVIDER=twilio
//     TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
//
//   SMS_PROVIDER=generic          ← most local Cameroon aggregators
//     SMS_API_URL      POST endpoint accepting JSON { to, from, message }
//     SMS_API_KEY      sent as "Authorization: Bearer <key>"
//     SMS_SENDER_ID    alphanumeric sender name, e.g. "Reserve237"

const CM_COUNTRY_CODE = '237'

/**
 * Normalises a Cameroonian phone number to E.164 (+237XXXXXXXXX).
 * Accepts "6 99 12 34 56", "237699123456", "+237 699 12 34 56", "00237...".
 * Returns null when the number can't be understood — callers skip sending
 * rather than burn credit on a malformed destination.
 */
export function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null

  let digits = raw.replace(/\D/g, '')
  if (!digits) return null

  // 00237… international prefix
  if (digits.startsWith('00')) digits = digits.slice(2)

  // Local 9-digit subscriber number (6XXXXXXXX)
  if (digits.length === 9) digits = CM_COUNTRY_CODE + digits

  // Too short to be a real number even with a country code
  if (digits.length < 11 || digits.length > 15) return null

  return '+' + digits
}

async function sendViaTwilio(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM
  if (!sid || !token || !from) return false

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    }
  )

  if (!res.ok) {
    console.error('[sms] Twilio rejected the message:', res.status, await res.text())
    return false
  }
  return true
}

async function sendViaGeneric(to: string, body: string): Promise<boolean> {
  const url = process.env.SMS_API_URL
  const key = process.env.SMS_API_KEY
  if (!url || !key) return false

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      from: process.env.SMS_SENDER_ID ?? 'Reserve237',
      message: body,
    }),
  })

  if (!res.ok) {
    console.error('[sms] Gateway rejected the message:', res.status, await res.text())
    return false
  }
  return true
}

/**
 * Sends one SMS. Never throws — a failed notification must not roll back a
 * booking that was already written to the database.
 *
 * @returns true only when the provider accepted the message.
 */
export async function sendSms(
  to: string | null | undefined,
  body: string
): Promise<boolean> {
  const provider = process.env.SMS_PROVIDER
  if (!provider) return false

  const number = toE164(to)
  if (!number) return false

  try {
    if (provider === 'twilio') return await sendViaTwilio(number, body)
    if (provider === 'generic') return await sendViaGeneric(number, body)
    console.error('[sms] Unknown SMS_PROVIDER:', provider)
    return false
  } catch (err) {
    console.error('[sms] Failed to send:', err)
    return false
  }
}

// ─── Message bodies ───────────────────────────────────────────────────────────
// Kept short on purpose: one SMS segment is 160 GSM-7 characters and every
// extra segment is billed separately. French first — it is the default UI
// language and the majority language of both cities we serve.

export interface BookingSmsContext {
  listingName: string
  bookingRef: string
  dates: string
  guests: number
}

/** New booking landed — sent to the business. */
export function newBookingSms(
  c: BookingSmsContext & { guestName: string; guestPhone: string }
): string {
  return [
    `Reserve237 — nouvelle demande`,
    `${c.guestName} (${c.guestPhone})`,
    `${c.listingName} · ${c.dates} · ${c.guests}p`,
    `Ref ${c.bookingRef}`,
    `Repondez sur votre tableau de bord.`,
  ].join('\n')
}

/** The business answered — sent to the client. */
export function bookingStatusSms(
  c: BookingSmsContext & { status: 'confirmed' | 'cancelled' | 'completed' }
): string {
  const head =
    c.status === 'confirmed'
      ? `Reserve237 — reservation CONFIRMEE`
      : c.status === 'cancelled'
        ? `Reserve237 — reservation ANNULEE`
        : `Reserve237 — sejour termine`

  const tail =
    c.status === 'confirmed'
      ? `A bientot !`
      : c.status === 'cancelled'
        ? `Aucun montant n'a ete preleve.`
        : `Laissez un avis sur reserve237.`

  return [head, `${c.listingName}`, `${c.dates} · Ref ${c.bookingRef}`, tail].join('\n')
}

/** The client cancelled — sent to the business so the slot is known to be free. */
export function clientCancelledSms(c: BookingSmsContext & { guestName: string }): string {
  return [
    `Reserve237 — annulation client`,
    `${c.guestName} a annule`,
    `${c.listingName} · ${c.dates}`,
    `Ref ${c.bookingRef} — creneau libere.`,
  ].join('\n')
}

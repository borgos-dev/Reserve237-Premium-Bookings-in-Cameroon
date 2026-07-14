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
}

export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
  const customerTemplateId = process.env.EMAILJS_TEMPLATE_BOOKING_CUSTOMER
  const partnerTemplateId = process.env.EMAILJS_TEMPLATE_BOOKING_PARTNER

  const paymentLabel = PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod
  const totalFormatted = fmtXAF(data.totalXaf)

  // 1. Confirmation to customer
  if (customerTemplateId) {
    await sendEmail(customerTemplateId, {
      to_name: data.customerName,
      to_email: data.customerEmail,
      listing_name: data.listingName,
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
      listing_name: data.listingName,
      customer_name: data.customerName,
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

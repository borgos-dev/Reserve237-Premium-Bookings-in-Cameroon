/**
 * Sends one real test email and one real test SMS, then reports exactly what
 * happened. Both notification channels are written to fail silently in
 * production — a missing env var or a rejected API call must never break a
 * booking — which is precisely why they need a loud tool like this one.
 *
 *   npm run notify:test -- you@example.com +237699887766
 *
 * Either argument may be omitted to skip that channel.
 */
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const [email, phone] = process.argv.slice(2)

function report(name: string, ok: boolean, note: string) {
  console.log(`${ok ? '✅' : '❌'} ${name.padEnd(8)} ${note}`)
}

async function main() {
  // Imported after dotenv so the modules read a populated environment.
  const { sendMail } = await import('../src/lib/email')
  const { sendSms, toE164 } = await import('../src/lib/sms')

  console.log('\nConfiguration')
  const cfg: [string, string | undefined][] = [
    ['EMAILJS service', process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID],
    ['EMAILJS template', process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID],
    ['EMAILJS public key', process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY],
    ['EMAILJS private key', process.env.EMAILJS_PRIVATE_KEY],
    ['Team inbox', process.env.TEAM_INBOX_EMAIL ?? process.env.NEXT_PUBLIC_TEAM_EMAIL],
    ['SMS provider', process.env.SMS_PROVIDER],
  ]
  for (const [label, value] of cfg) {
    console.log(`   ${value ? 'set  ' : 'MISSING'}  ${label}`)
  }

  console.log('\nDelivery')

  if (email) {
    const ok = await sendMail({
      to: email,
      toName: 'Test',
      subject: 'Reserve237 — test de notification',
      body:
        'Si vous lisez ceci, les emails de réservation fonctionnent.\n\n' +
        'If you can read this, booking emails are working.',
    })
    report('email', ok, ok ? `sent to ${email}` : 'rejected — see the error above')
  } else {
    report('email', false, 'skipped (no address given)')
  }

  if (phone) {
    const normalised = toE164(phone)
    if (!normalised) {
      report('sms', false, `"${phone}" is not a usable number`)
    } else {
      const ok = await sendSms(normalised, 'Reserve237 : test de notification. Ignorez ce message.')
      report('sms', ok, ok ? `sent to ${normalised}` : 'rejected — see the error above')
    }
  } else {
    report('sms', false, 'skipped (no number given)')
  }

  console.log()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

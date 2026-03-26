// Booking confirmation email template
// Rendered server-side by Resend into a clean HTML email

interface BookingConfirmationProps {
  customerName: string
  confirmationCode: string
  serviceName: string
  serviceDuration: number
  servicePrice: number
  barberName: string
  date: string        // e.g. "Friday, March 28, 2026"
  time: string        // e.g. "2:00 PM"
  customerEmail: string
  manageUrl: string   // link to /manage?code=...
}

export function BookingConfirmationEmail({
  customerName,
  confirmationCode,
  serviceName,
  serviceDuration,
  servicePrice,
  barberName,
  date,
  time,
  manageUrl,
}: BookingConfirmationProps) {
  const gold = '#C9A84C'
  const bg = '#0a0a0a'
  const card = '#1a1a1a'
  const border = '#2a2a2a'
  const muted = '#888888'

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Booking Confirmed – Aryan Blendz</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: bg, fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: bg }}>
          <tr>
            <td align="center" style={{ padding: '40px 16px' }}>
              <table width="100%" style={{ maxWidth: 560, backgroundColor: card, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>

                {/* Header */}
                <tr>
                  <td style={{ background: `linear-gradient(135deg, #1a1a0a 0%, #111100 100%)`, borderBottom: `1px solid ${border}`, padding: '32px 40px', textAlign: 'center' }}>
                    {/* Logo */}
                    <div style={{ marginBottom: 20 }}>
                      <span style={{ display: 'inline-block', background: 'rgba(201,168,76,0.12)', border: `1px solid rgba(201,168,76,0.25)`, borderRadius: 10, padding: '8px 20px' }}>
                        <span style={{ color: gold, fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                          ✂ ARYAN BLENDZ
                        </span>
                      </span>
                    </div>
                    {/* Checkmark */}
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: `2px solid ${gold}`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '64px', textAlign: 'center' }}>
                      <span style={{ fontSize: 28, color: gold }}>✓</span>
                    </div>
                    <h1 style={{ margin: 0, color: '#ffffff', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
                      You&apos;re all set!
                    </h1>
                    <p style={{ margin: '8px 0 0', color: muted, fontSize: 14 }}>
                      Your appointment has been confirmed.
                    </p>
                  </td>
                </tr>

                {/* Confirmation code */}
                <tr>
                  <td style={{ padding: '24px 40px', textAlign: 'center', borderBottom: `1px solid ${border}` }}>
                    <p style={{ margin: '0 0 6px', color: muted, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                      Confirmation Code
                    </p>
                    <p style={{ margin: 0, color: gold, fontSize: 28, fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'Courier New, monospace' }}>
                      {confirmationCode}
                    </p>
                    <p style={{ margin: '8px 0 0', color: muted, fontSize: 12 }}>
                      Save this code to manage your appointment
                    </p>
                  </td>
                </tr>

                {/* Appointment details */}
                <tr>
                  <td style={{ padding: '24px 40px', borderBottom: `1px solid ${border}` }}>
                    <p style={{ margin: '0 0 16px', color: muted, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                      Appointment Details
                    </p>
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      {[
                        { label: 'Service', value: serviceName },
                        { label: 'Duration', value: `${serviceDuration} minutes` },
                        { label: 'Price', value: `$${servicePrice}` },
                        { label: 'Barber', value: barberName },
                        { label: 'Date', value: date },
                        { label: 'Time', value: time },
                      ].map(({ label, value }, i) => (
                        <tr key={label} style={{ borderTop: i > 0 ? `1px solid ${border}` : 'none' }}>
                          <td style={{ padding: '10px 0', color: muted, fontSize: 13, width: '40%' }}>{label}</td>
                          <td style={{ padding: '10px 0', color: '#ffffff', fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{value}</td>
                        </tr>
                      ))}
                    </table>
                  </td>
                </tr>

                {/* Location */}
                <tr>
                  <td style={{ padding: '20px 40px', borderBottom: `1px solid ${border}`, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      <tr>
                        <td>
                          <p style={{ margin: 0, color: muted, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                            📍 Location
                          </p>
                          <p style={{ margin: '4px 0 0', color: '#ffffff', fontSize: 13 }}>
                            Judson Suites, 103 Davidson Rd, Piscataway, NJ 08854
                          </p>
                          <p style={{ margin: '2px 0 0', color: muted, fontSize: 12 }}>
                            201-748-9849
                          </p>
                        </td>
                        <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                          <p style={{ margin: 0, color: muted, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                            🕐 Hours
                          </p>
                          <p style={{ margin: '4px 0 0', color: '#ffffff', fontSize: 13 }}>
                            Mon–Fri: 9am–7pm
                          </p>
                          <p style={{ margin: '2px 0 0', color: muted, fontSize: 12 }}>
                            Sat: 9am–6pm
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Cancellation notice */}
                <tr>
                  <td style={{ padding: '16px 40px', borderBottom: `1px solid ${border}`, backgroundColor: 'rgba(34,197,94,0.05)' }}>
                    <p style={{ margin: 0, color: '#4ade80', fontSize: 13 }}>
                      <strong>Free cancellation</strong> up to 24 hours before your appointment.
                    </p>
                  </td>
                </tr>

                {/* Manage button */}
                <tr>
                  <td style={{ padding: '28px 40px', textAlign: 'center' }}>
                    <a
                      href={manageUrl}
                      style={{
                        display: 'inline-block',
                        background: `linear-gradient(135deg, #C9A84C 0%, #B8972E 100%)`,
                        color: '#0a0a0a',
                        fontWeight: 700,
                        fontSize: 14,
                        textDecoration: 'none',
                        padding: '14px 36px',
                        borderRadius: 8,
                        letterSpacing: '0.04em',
                      }}
                    >
                      Manage My Booking →
                    </a>
                    <p style={{ margin: '16px 0 0', color: muted, fontSize: 12 }}>
                      Need help? Reply to this email or call{' '}
                      <a href="tel:+12017489849" style={{ color: gold, textDecoration: 'none' }}>
                        201-748-9849
                      </a>
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ borderTop: `1px solid ${border}`, padding: '20px 40px', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#444', fontSize: 11 }}>
                      © {new Date().getFullYear()} Aryan Blendz · Judson Suites, 103 Davidson Rd, Piscataway, NJ 08854
                    </p>
                    <p style={{ margin: '4px 0 0', color: '#333', fontSize: 11 }}>
                      You received this because you booked an appointment with us.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}

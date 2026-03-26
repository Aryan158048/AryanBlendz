'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DAYS_OF_WEEK } from '@/lib/constants'
import {
  adminGetBarberInfo, adminUpdateBarberInfo,
  adminGetSettings, adminSaveSettings,
} from '@/app/actions/admin'
import { getPublicHours } from '@/app/actions/booking'
import Link from 'next/link'

const dayOrder = [1, 2, 3, 4, 5, 6, 0]

function fmt12h(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/70 text-sm">{label}</Label>
      {children}
      {hint && <p className="text-white/30 text-xs">{hint}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState<string | null>(null)
  const [hours, setHours]       = useState<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }[]>([])

  // Barber / shop info
  const [barberName, setBarberName]         = useState('')
  const [shopInstagram, setShopInstagram]   = useState('')
  const [shopName, setShopName]             = useState('')
  const [shopAddress, setShopAddress]       = useState('')
  const [shopPhone, setShopPhone]           = useState('')
  const [shopEmail, setShopEmail]           = useState('')

  // Notification settings (persisted in DB settings table)
  const [adminEmail, setAdminEmail]         = useState('')
  const [adminPhone, setAdminPhone]         = useState('')
  const [emailEnabled, setEmailEnabled]     = useState(true)
  const [smsEnabled, setSmsEnabled]         = useState(false)

  useEffect(() => {
    Promise.all([adminGetBarberInfo(), adminGetSettings(), getPublicHours()])
      .then(([barber, settings, publicHours]) => {
        if (barber) {
          setBarberName(barber.name ?? '')
          setShopInstagram(barber.instagram ?? '')
        }
        setShopName(settings.shop_name    ?? 'Aryan Blendz')
        setShopAddress(settings.shop_address ?? '')
        setShopPhone(settings.shop_phone   ?? '')
        setShopEmail(settings.shop_email   ?? '')
        setAdminEmail(settings.admin_notification_email ?? '')
        setAdminPhone(settings.admin_phone ?? '')
        setEmailEnabled(settings.email_notifications !== 'false')
        setSmsEnabled(settings.sms_reminders === 'true')
        setHours(publicHours)
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const saveShopInfo = async () => {
    setSaving('shop')
    try {
      await Promise.all([
        adminUpdateBarberInfo({ name: barberName, instagram: shopInstagram }),
        adminSaveSettings({
          shop_name:    shopName,
          shop_address: shopAddress,
          shop_phone:   shopPhone,
          shop_email:   shopEmail,
        }),
      ])
      toast.success('Info saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(null)
    }
  }

  const saveNotifications = async () => {
    setSaving('notifications')
    try {
      await adminSaveSettings({
        admin_notification_email: adminEmail,
        admin_phone:              adminPhone,
        email_notifications:      String(emailEnabled),
        sms_reminders:            String(smsEnabled),
      })
      toast.success('Notification settings saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Settings</h2>
        <p className="text-white/35 text-xs mt-0.5">Manage shop info and notifications</p>
      </div>

      <Tabs defaultValue="shop">
        <TabsList className="bg-charcoal-900 border border-white/8">
          <TabsTrigger value="shop"          className="data-[state=active]:bg-gold-500/15 data-[state=active]:text-gold-400 text-sm">My Info</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-gold-500/15 data-[state=active]:text-gold-400 text-sm">Notifications</TabsTrigger>
        </TabsList>

        {/* ── My Info ─────────────────────────────── */}
        <TabsContent value="shop">
          <div className="glass gold-border rounded-2xl p-5 space-y-4">
            <h3 className="font-display text-base font-bold text-white">Shop Information</h3>
            <Separator className="bg-white/8" />

            <Field label="Your Name">
              <Input value={barberName} onChange={(e) => setBarberName(e.target.value)}
                className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 h-10" />
            </Field>
            <Field label="Shop Name">
              <Input value={shopName} onChange={(e) => setShopName(e.target.value)}
                className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 h-10" />
            </Field>
            <Field label="Address" hint="Shown in confirmation emails and on the website">
              <Input value={shopAddress} onChange={(e) => setShopAddress(e.target.value)}
                className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 h-10" />
            </Field>
            <Field label="Phone">
              <Input value={shopPhone} onChange={(e) => setShopPhone(e.target.value)}
                className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 h-10" />
            </Field>
            <Field label="Email">
              <Input type="email" value={shopEmail} onChange={(e) => setShopEmail(e.target.value)}
                className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 h-10" />
            </Field>
            <Field label="Instagram Handle">
              <Input value={shopInstagram} onChange={(e) => setShopInstagram(e.target.value)}
                placeholder="@yourhandle"
                className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 h-10" />
            </Field>

            <Separator className="bg-white/8" />

            {/* Hours (read-only display) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/50 text-sm font-medium">Business Hours</p>
                <Link href="/admin/availability" className="text-gold-400 text-xs hover:text-gold-300 transition-colors">
                  Edit hours →
                </Link>
              </div>
              <div className="space-y-2">
                {dayOrder.map((dayNum) => {
                  const label = DAYS_OF_WEEK.find((d) => d.value === dayNum)?.label ?? ''
                  const row   = hours.find((h) => h.day_of_week === dayNum)
                  return (
                    <div key={dayNum} className="flex items-center justify-between text-sm">
                      <span className="text-white/45 w-24">{label}</span>
                      {row?.is_available
                        ? <span className="text-white/65">{fmt12h(row.start_time)} – {fmt12h(row.end_time)}</span>
                        : <span className="text-white/20">Closed</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button onClick={saveShopInfo} disabled={saving === 'shop'} className="h-9">
                {saving === 'shop'
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                  : <><Save className="w-4 h-4" />Save Info</>}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Notifications ────────────────────────── */}
        <TabsContent value="notifications">
          <div className="glass gold-border rounded-2xl p-5 space-y-4">
            <h3 className="font-display text-base font-bold text-white">Notification Settings</h3>
            <p className="text-white/40 text-sm">Where to send alerts when someone books with you.</p>
            <Separator className="bg-white/8" />

            {/* Email toggle + address */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal-900/60">
              <div>
                <p className="text-white text-sm font-medium">Email alerts</p>
                <p className="text-white/35 text-xs mt-0.5">Get emailed on every new booking</p>
              </div>
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} className="data-[state=checked]:bg-gold-500" />
            </div>
            {emailEnabled && (
              <Field label="Your notification email" hint="Where booking alerts are sent. Different from the shop contact email above.">
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 h-10"
                />
              </Field>
            )}

            <Separator className="bg-white/8" />

            {/* SMS toggle + phone */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal-900/60">
              <div>
                <p className="text-white text-sm font-medium">SMS alerts</p>
                <p className="text-white/35 text-xs mt-0.5">Get a text message on every new booking</p>
              </div>
              <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} className="data-[state=checked]:bg-gold-500" />
            </div>
            {smsEnabled && (
              <>
                <Field label="Your phone number" hint="Must be in E.164 format, e.g. +12015551234">
                  <Input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="+12015551234"
                    className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 h-10"
                  />
                </Field>
                <div className="p-3.5 rounded-xl bg-charcoal-900/40 border border-white/6">
                  <p className="text-white/50 text-xs leading-relaxed">
                    SMS requires Twilio credentials in your <span className="text-white/80 font-mono">.env.local</span> file:
                    <br />
                    <span className="text-gold-400/70 font-mono">TWILIO_ACCOUNT_SID</span>,{' '}
                    <span className="text-gold-400/70 font-mono">TWILIO_AUTH_TOKEN</span>,{' '}
                    <span className="text-gold-400/70 font-mono">TWILIO_FROM_NUMBER</span>
                    <br />
                    Customers also get an SMS confirmation when they book.
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end pt-1">
              <Button onClick={saveNotifications} disabled={saving === 'notifications'} className="h-9">
                {saving === 'notifications'
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                  : <><Save className="w-4 h-4" />Save Notifications</>}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

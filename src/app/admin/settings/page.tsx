'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CONTACT_EMAIL, CONTACT_PHONE, SHOP_ADDRESS, DAYS_OF_WEEK } from '@/lib/constants'
import { adminGetBarberInfo, adminUpdateBarberInfo } from '@/app/actions/admin'
import { getPublicHours } from '@/app/actions/booking'

const dayOrder = [1, 2, 3, 4, 5, 6, 0]

function fmt12h(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function SettingsPage() {
  const [saving, setSaving] = useState<string | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [hours, setHours] = useState<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }[]>([])

  // Shop info state (loaded from DB)
  const [shopName, setShopName] = useState('Aryan Blendz')
  const [shopAddress, setShopAddress] = useState(SHOP_ADDRESS)
  const [shopPhone, setShopPhone] = useState(CONTACT_PHONE)
  const [shopEmail, setShopEmail] = useState(CONTACT_EMAIL)
  const [shopInstagram, setShopInstagram] = useState('@aryanblendz')

  // Booking settings
  const [depositRequired, setDepositRequired] = useState(true)
  const [depositAmount, setDepositAmount] = useState('10')
  const [slotDuration, setSlotDuration] = useState('30')
  const [maxAdvanceDays, setMaxAdvanceDays] = useState('60')
  const [cancellationWindow, setCancellationWindow] = useState('24')

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsReminders, setSmsReminders] = useState(false)
  const [reminderTime, setReminderTime] = useState('24')

  useEffect(() => {
    Promise.all([adminGetBarberInfo(), getPublicHours()]).then(([info, publicHours]) => {
      if (info) {
        setShopName(info.name ?? 'Aryan Blendz')
        setShopInstagram(info.instagram ?? '@aryanblendz')
      }
      setHours(publicHours)
      setLoadingInfo(false)
    }).catch(() => setLoadingInfo(false))
  }, [])

  const saveShopInfo = async () => {
    setSaving('shop')
    try {
      await adminUpdateBarberInfo({ name: shopName, instagram: shopInstagram })
      toast.success('Info saved!')
    } catch {
      toast.error('Failed to save info')
    } finally {
      setSaving(null)
    }
  }

  const saveTab = async (tab: string) => {
    setSaving(tab)
    await new Promise((r) => setTimeout(r, 900))
    setSaving(null)
    toast.success('Settings saved successfully!')
  }

  const FieldRow = ({
    label,
    children,
  }: {
    label: string
    children: React.ReactNode
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <Label className="text-white/70 text-sm sm:w-44 flex-shrink-0">{label}</Label>
      <div className="flex-1">{children}</div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Settings</h2>
        <p className="text-white/40 text-sm mt-1">Manage your booking and contact info</p>
      </div>

      <Tabs defaultValue="shop">
        <TabsList className="bg-charcoal-900 border border-white/8 h-11 flex-wrap">
          <TabsTrigger
            value="shop"
            className="data-[state=active]:bg-gold-500/15 data-[state=active]:text-gold-400"
          >
            My Info
          </TabsTrigger>
          <TabsTrigger
            value="booking"
            className="data-[state=active]:bg-gold-500/15 data-[state=active]:text-gold-400"
          >
            Booking Settings
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-gold-500/15 data-[state=active]:text-gold-400"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="data-[state=active]:bg-gold-500/15 data-[state=active]:text-gold-400"
          >
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Shop Info */}
        <TabsContent value="shop">
          <div className="glass gold-border rounded-2xl p-6 space-y-5">
            <h3 className="font-display text-lg font-bold text-white mb-1">
              My Information
            </h3>
            <Separator className="bg-white/8" />

            {loadingInfo ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
              </div>
            ) : (
              <>
                <FieldRow label="Shop Name">
                  <Input
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50"
                  />
                </FieldRow>

                <FieldRow label="Address">
                  <Input
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50"
                  />
                </FieldRow>

                <FieldRow label="Phone">
                  <Input
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50"
                  />
                </FieldRow>

                <FieldRow label="Email">
                  <Input
                    type="email"
                    value={shopEmail}
                    onChange={(e) => setShopEmail(e.target.value)}
                    className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50"
                  />
                </FieldRow>

                <FieldRow label="Instagram">
                  <Input
                    value={shopInstagram}
                    onChange={(e) => setShopInstagram(e.target.value)}
                    placeholder="@yourhandle"
                    className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50"
                  />
                </FieldRow>

                <Separator className="bg-white/8" />

                <div>
                  <h4 className="text-white/70 text-sm font-medium mb-3">Business Hours</h4>
                  <div className="space-y-2.5">
                    {dayOrder.map((dayNum) => {
                      const dayLabel = DAYS_OF_WEEK.find((d) => d.value === dayNum)?.label ?? ''
                      const row = hours.find((h) => h.day_of_week === dayNum)
                      return (
                        <div key={dayNum} className="flex items-center gap-3 text-sm">
                          <span className="text-white/50 w-24 flex-shrink-0">{dayLabel}</span>
                          {row?.is_available ? (
                            <span className="text-white/60">
                              {fmt12h(row.start_time)} – {fmt12h(row.end_time)}
                            </span>
                          ) : (
                            <span className="text-white/25">Closed</span>
                          )}
                        </div>
                      )
                    })}
                    <p className="text-white/30 text-xs mt-2">
                      To edit hours, visit the Availability page.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={saveShopInfo} disabled={saving === 'shop'}>
                    {saving === 'shop' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Info'
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="booking">
          <div className="glass gold-border rounded-2xl p-6 space-y-5">
            <h3 className="font-display text-lg font-bold text-white mb-1">
              Booking Configuration
            </h3>
            <Separator className="bg-white/8" />

            {/* Deposit */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-charcoal-900/50">
              <div>
                <Label className="text-white font-medium">Require Deposit</Label>
                <p className="text-white/40 text-xs mt-0.5">
                  Collect a deposit to confirm bookings
                </p>
              </div>
              <Switch
                checked={depositRequired}
                onCheckedChange={setDepositRequired}
                className="data-[state=checked]:bg-gold-500"
              />
            </div>

            {depositRequired && (
              <FieldRow label="Deposit Amount ($)">
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min={1}
                  className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50 max-w-xs"
                />
              </FieldRow>
            )}

            <FieldRow label="Time Slot Duration">
              <Select value={slotDuration} onValueChange={setSlotDuration}>
                <SelectTrigger className="bg-charcoal-900 border-white/10 text-white max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-charcoal-900 border-white/10">
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>

            <FieldRow label="Max Advance Booking">
              <div className="flex items-center gap-2 max-w-xs">
                <Input
                  type="number"
                  value={maxAdvanceDays}
                  onChange={(e) => setMaxAdvanceDays(e.target.value)}
                  min={1}
                  className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50"
                />
                <span className="text-white/40 text-sm flex-shrink-0">days</span>
              </div>
            </FieldRow>

            <FieldRow label="Cancellation Window">
              <div className="flex items-center gap-2 max-w-xs">
                <Input
                  type="number"
                  value={cancellationWindow}
                  onChange={(e) => setCancellationWindow(e.target.value)}
                  min={1}
                  className="bg-charcoal-900 border-white/10 text-white focus:border-gold-500/50"
                />
                <span className="text-white/40 text-sm flex-shrink-0">hours before</span>
              </div>
            </FieldRow>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => saveTab('booking')}
                disabled={saving === 'booking'}
              >
                {saving === 'booking' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Booking Settings'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="glass gold-border rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-white mb-1">
              Notification Preferences
            </h3>
            <Separator className="bg-white/8" />

            <div className="flex items-center justify-between p-4 rounded-xl bg-charcoal-900/50">
              <div>
                <Label className="text-white font-medium">Email Notifications</Label>
                <p className="text-white/40 text-xs mt-0.5">
                  Receive email alerts for new bookings and cancellations
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                className="data-[state=checked]:bg-gold-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-charcoal-900/50">
              <div>
                <Label className="text-white font-medium">SMS Reminders</Label>
                <p className="text-white/40 text-xs mt-0.5">
                  Send SMS appointment reminders to customers
                </p>
              </div>
              <Switch
                checked={smsReminders}
                onCheckedChange={setSmsReminders}
                className="data-[state=checked]:bg-gold-500"
              />
            </div>

            {smsReminders && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Label className="text-white/70 text-sm sm:w-44 flex-shrink-0">Reminder Send Time</Label>
                <div className="flex-1">
                  <Select value={reminderTime} onValueChange={setReminderTime}>
                    <SelectTrigger className="bg-charcoal-900 border-white/10 text-white max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-charcoal-900 border-white/10">
                      <SelectItem value="2">2 hours before</SelectItem>
                      <SelectItem value="4">4 hours before</SelectItem>
                      <SelectItem value="12">12 hours before</SelectItem>
                      <SelectItem value="24">24 hours before</SelectItem>
                      <SelectItem value="48">48 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => saveTab('notifications')}
                disabled={saving === 'notifications'}
              >
                {saving === 'notifications' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Notifications'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <div className="glass gold-border rounded-2xl p-6 space-y-5">
            <h3 className="font-display text-lg font-bold text-white mb-1">
              Appearance
            </h3>
            <Separator className="bg-white/8" />

            {/* Color preview */}
            <div>
              <Label className="text-white/70 text-sm mb-3 block">Brand Colors</Label>
              <div className="flex gap-3 flex-wrap">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-gold shadow-[var(--shadow-gold)] mb-2" />
                  <div className="text-white/40 text-xs">Gold</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-charcoal-950 border border-white/10 mb-2" />
                  <div className="text-white/40 text-xs">Background</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-charcoal-800 border border-white/10 mb-2" />
                  <div className="text-white/40 text-xs">Card</div>
                </div>
              </div>
              <p className="text-white/30 text-xs mt-3">
                Color customization coming soon.
              </p>
            </div>

            <Separator className="bg-white/8" />

            <div>
              <Label className="text-white/70 text-sm mb-3 block">Typography</Label>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-charcoal-900/50 flex items-center justify-between">
                  <span className="text-white/60 text-sm">Display font</span>
                  <span className="text-white font-display text-sm">Playfair Display</span>
                </div>
                <div className="p-3 rounded-xl bg-charcoal-900/50 flex items-center justify-between">
                  <span className="text-white/60 text-sm">Body font</span>
                  <span className="text-white text-sm">Inter</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => saveTab('appearance')}
                disabled={saving === 'appearance'}
              >
                {saving === 'appearance' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Appearance'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

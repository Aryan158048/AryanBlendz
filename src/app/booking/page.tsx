import { getActiveServices } from '@/app/actions/booking'
import BookingClient from './BookingClient'

export default async function BookingPage() {
  const services = await getActiveServices().catch(() => [])

  return <BookingClient services={services} />
}

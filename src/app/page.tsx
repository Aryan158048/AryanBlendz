import Hero from '@/components/sections/Hero'
import ServicesPreview from '@/components/sections/ServicesPreview'
import HowItWorks from '@/components/sections/HowItWorks'
import Testimonials from '@/components/sections/Testimonials'
import AboutSection from '@/components/sections/AboutSection'
import LocationSection from '@/components/sections/LocationSection'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ServicesPreview />
      <HowItWorks />
      <Testimonials />
      <AboutSection />
      <LocationSection />
    </main>
  )
}

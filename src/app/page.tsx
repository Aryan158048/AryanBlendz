import Hero from '@/components/sections/Hero'
import ServicesPreview from '@/components/sections/ServicesPreview'
import AboutSection from '@/components/sections/AboutSection'
import LocationSection from '@/components/sections/LocationSection'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ServicesPreview />
      <AboutSection />
      <LocationSection />
    </main>
  )
}

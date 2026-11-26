import { Layout } from '@/widgets/Layout'
import { Hero } from '@/widgets/hero/ui/Hero'
import { CategoriesCarousel } from '@/widgets/categories-carousel/ui/CategoriesCarousel'
import { PopularProducts } from '@/widgets/popular-products/ui/PopularProducts'
import { MaterialsServices } from '@/widgets/materials-services/MaterialsServices'
import { CompanyInfo } from '@/widgets/company-info/CompanyInfo'
import { FastenersSection } from '@/widgets/fasteners-section/FastenersSection'
import { HomeContacts } from '@/widgets/home-contacts/HomeContacts'
import { HowWeWork } from '@/widgets/how-we-work'
import { ClientLogos } from '@/widgets/client-logos/ui/ClientLogos'
import { LeadForm } from '@/widgets/lead-form/LeadForm'

export function HomePage() {
  return (
    <Layout>
      <Hero />
      <CategoriesCarousel />
      <PopularProducts />
      <MaterialsServices />
      <CompanyInfo />
      <HowWeWork />
      <ClientLogos />
      <FastenersSection />
      <HomeContacts />
      <LeadForm source="Главная" />
    </Layout>
  )
}
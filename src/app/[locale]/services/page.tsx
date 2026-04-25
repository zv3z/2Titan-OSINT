import ServicesHero from '@/components/services/ServicesHero';
import ServicesGrid from '@/components/services/ServicesGrid';
import ProcessSection from '@/components/services/ProcessSection';
import CtaSection from '@/components/home/CtaSection';

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServicesGrid />
      <ProcessSection />
      <CtaSection />
    </>
  );
}

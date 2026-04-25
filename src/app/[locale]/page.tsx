import Hero from '@/components/home/Hero';
import ServicesSection from '@/components/home/ServicesSection';
import ToolsPreview from '@/components/home/ToolsPreview';
import StatsSection from '@/components/home/StatsSection';
import CtaSection from '@/components/home/CtaSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsSection />
      <ServicesSection />
      <ToolsPreview />
      <CtaSection />
    </>
  );
}

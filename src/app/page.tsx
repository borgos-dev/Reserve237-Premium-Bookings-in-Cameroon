import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewHero } from "@/components/homepage/NewHero";
import { SearchFilterSection } from "@/components/homepage/SearchFilterSection";
import { ConditionalCuratedCollections } from "@/components/homepage/ConditionalCuratedCollections";
import { NewBusinessCTA } from "@/components/homepage/NewBusinessCTA";
import { NewFooter } from "@/components/homepage/NewFooter";
import { MobileBottomNav } from "@/components/homepage/MobileBottomNav";
import { ColorSchemeSwitcher } from "@/components/homepage/ColorSchemeSwitcher";

export default function HomePage() {
  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <NewNavbar />
      <ColorSchemeSwitcher />
      <NewHero />
      <SearchFilterSection />
      <ConditionalCuratedCollections />
      <NewBusinessCTA />
      <NewFooter />
      <MobileBottomNav />
    </main>
  );
}

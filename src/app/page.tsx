import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewHero } from "@/components/homepage/NewHero";
import { SearchFilterSection } from "@/components/homepage/SearchFilterSection";
import { ConditionalCuratedCollections } from "@/components/homepage/ConditionalCuratedCollections";
import { NewBusinessCTA } from "@/components/homepage/NewBusinessCTA";
import { NewFooter } from "@/components/homepage/NewFooter";
import { getPublicListings } from "@/actions/listings";

// Cache the homepage for 60 seconds (ISR).
// New listings appear within 1 minute — fast enough for a listing platform.
export const revalidate = 60;

export default async function HomePage() {
  const listings = await getPublicListings();

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <NewNavbar />
      <NewHero />
      <SearchFilterSection listings={listings} />
      <ConditionalCuratedCollections listings={listings} />
      <NewBusinessCTA />
      <NewFooter />
    </main>
  );
}

import type { Metadata } from "next";

// Cache listing pages for 5 minutes — reviews and details don't change every second
export const revalidate = 300;
import { notFound } from "next/navigation";
import { getPublicListingBySlug } from "@/actions/listings";
import { getListingReviews } from "@/actions/reviews";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import { ListingDetailContent } from "@/components/listing/ListingDetailContent";
import { categoryLabels } from "@/lib/categoryColors";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Dynamic SEO metadata per listing ────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getPublicListingBySlug(slug);

  if (!listing) {
    return { title: "Listing Not Found | Reserve237" };
  }

  const catLabel = categoryLabels[listing.mainCategory] ?? listing.mainCategory;
  const title = `${listing.name} — ${catLabel} in ${listing.city} | Reserve237`;

  const description = listing.description
    ? `${listing.description.slice(0, 155)}…`
    : `Book ${listing.name} in ${listing.location}. ${
        listing.priceLabel ? `${listing.priceLabel}. ` : ""
      }Reserve237 — Cameroon's booking platform.`;

  const images = listing.image
    ? [{ url: listing.image, width: 1200, height: 630, alt: listing.name }]
    : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_CM",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: listing.image ? [listing.image] : [],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getPublicListingBySlug(slug);
  if (!listing) notFound();

  const reviews = await getListingReviews(listing.id);

  return (
    <>
      <NewNavbar />
      <ListingDetailContent listing={listing} reviews={reviews} />
      <NewFooter />
    </>
  );
}

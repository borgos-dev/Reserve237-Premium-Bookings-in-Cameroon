import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPublicListingBySlug } from "@/actions/listings";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import { BookingPage } from "@/components/booking/BookingPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookListingPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getPublicListingBySlug(slug);
  if (!listing) notFound();

  // Listings without a numeric price are contact/WhatsApp-only — no online booking flow
  if (listing.priceMin == null) redirect(`/listing/${slug}`);

  const { userId } = await auth();

  // Shape the listing into the format BookingPage expects
  const bookingListing = {
    id: 0, // legacy field, not used by createBooking (uses slug)
    name: listing.name,
    image: listing.image,
    category: listing.subCategory as never,
    location: listing.location,
    city: listing.city as never,
    rating: listing.rating,
    reviews: listing.reviewCount,
    price: listing.priceLabel ?? "Contact for price",
    priceRange: listing.priceRange as never,
    verified: listing.verified,
    tags: [] as never[],
    capacity: listing.capacity ?? undefined,
  };

  return (
    <>
      <NewNavbar />
      <BookingPage
        listing={bookingListing}
        pricePerNight={listing.priceMin}
        mainCategory={listing.mainCategory}
        userId={userId}
      />
      <NewFooter />
    </>
  );
}

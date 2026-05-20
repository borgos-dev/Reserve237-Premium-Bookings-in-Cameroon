"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { allListings } from "@/data/listings";
import { generateSlug } from "@/lib/utils";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import { BookingPage } from "@/components/booking/BookingPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function parsePricePerNight(price: string): number {
  const digits = price.replace(/[^\d]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function BookListingPage({ params }: PageProps) {
  const { slug } = use(params);
  const listing = allListings.find((l) => generateSlug(l.name) === slug);
  if (!listing) notFound();

  const pricePerNight = parsePricePerNight(listing.price);

  return (
    <>
      <NewNavbar />
      <BookingPage listing={listing} pricePerNight={pricePerNight} />
      <NewFooter />
    </>
  );
}

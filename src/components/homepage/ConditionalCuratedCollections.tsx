"use client";

import { useBrowseStore } from "@/stores";
import { CuratedCollections } from "./CuratedCollections";
import type { PublicListing } from "@/types/listing";

interface Props {
  listings: PublicListing[];
}

export function ConditionalCuratedCollections({ listings }: Props) {
  const { browseFilter, searchQuery, cityFilter } = useBrowseStore();
  const isFiltering = browseFilter !== "all" || searchQuery.trim() !== "" || cityFilter !== "all";
  if (isFiltering) return null;
  return <CuratedCollections listings={listings} />;
}

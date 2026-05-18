"use client";

import { useBrowseStore } from "@/stores";
import { CuratedCollections } from "./CuratedCollections";

export function ConditionalCuratedCollections() {
  const { browseFilter, searchQuery } = useBrowseStore();
  const isFiltering = browseFilter !== "all" || searchQuery.trim() !== "";
  if (isFiltering) return null;
  return <CuratedCollections />;
}

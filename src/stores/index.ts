import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicListing } from "@/types/listing";

// ─── Category store (hero search switcher) ────────────────────────────────────

type HeroCategory = "nightlife" | "stays" | "events";

interface CategoryStore {
  selectedCategory: HeroCategory;
  setSelectedCategory: (category: HeroCategory) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  selectedCategory: "nightlife",
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));

// ─── Browse store (search + filter on homepage) ───────────────────────────────

interface BrowseStore {
  browseFilter: string;        // mainCategory value or "all"
  setBrowseFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useBrowseStore = create<BrowseStore>((set) => ({
  browseFilter: "all",
  setBrowseFilter: (browseFilter) => set({ browseFilter }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

// ─── Favorites store ──────────────────────────────────────────────────────────

interface FavoritesStore {
  favorites: PublicListing[];
  toggleFavorite: (listing: PublicListing) => void;
  isFavorite: (id: string) => boolean;
  setFavorites: (listings: PublicListing[]) => void; // batch set (used for DB sync)
  clearAll: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (listing) =>
        set((state) => ({
          favorites: state.favorites.some((f) => f.id === listing.id)
            ? state.favorites.filter((f) => f.id !== listing.id)
            : [...state.favorites, listing],
        })),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      setFavorites: (listings) => set({ favorites: listings }),
      clearAll: () => set({ favorites: [] }),
    }),
    // Bumped storage key to v3 — clears old mock-data favorites (incompatible ids)
    { name: "reserve237-favorites-v3" }
  )
);

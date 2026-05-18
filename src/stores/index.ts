import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Listing, Category as ListingCategory } from "@/data/listings";

type Category = "nightlife" | "stays" | "events";

interface CategoryStore {
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  selectedCategory: "nightlife",
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));

interface FavoritesStore {
  favorites: Listing[];
  toggleFavorite: (listing: Listing) => void;
  isFavorite: (id: number) => boolean;
  clearAll: () => void;
}

interface BrowseStore {
  browseFilter: ListingCategory | "all";
  setBrowseFilter: (filter: ListingCategory | "all") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useBrowseStore = create<BrowseStore>((set) => ({
  browseFilter: "all",
  setBrowseFilter: (browseFilter) => set({ browseFilter }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

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
      clearAll: () => set({ favorites: [] }),
    }),
    { name: "reserve237-favorites-v2" }
  )
);

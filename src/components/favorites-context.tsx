"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type FavoritesContextValue = {
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  removeFavorite: (slug: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const storageKey = "reserve237-pokemon-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      setFavorites(JSON.parse(stored) as string[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isFavorite: (slug) => favorites.includes(slug),
      toggleFavorite: (slug) =>
        setFavorites((current) =>
          current.includes(slug)
            ? current.filter((item) => item !== slug)
            : [...current, slug],
        ),
      removeFavorite: (slug) =>
        setFavorites((current) => current.filter((item) => item !== slug)),
    }),
    [favorites],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return context;
}

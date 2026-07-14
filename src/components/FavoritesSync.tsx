"use client";

// Silently syncs favourites between Supabase DB and the client Zustand store.
//
// Behaviour:
//   Guest users   → favourites live in localStorage only (no change)
//   Logged-in users → on first load: DB favourites are merged into the store
//                     on every toggle: diff is written to DB in the background
//
// This component renders nothing — it just runs the sync logic.

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useFavoritesStore } from "@/stores";
import {
  getUserFavoriteIds,
  addFavoriteDB,
  removeFavoriteDB,
  syncFavoritesToDB,
} from "@/actions/favorites";
import { getListingsByIds } from "@/actions/listings";

export function FavoritesSync() {
  const { user, isLoaded } = useUser();
  const favorites = useFavoritesStore((s) => s.favorites);
  const setFavorites = useFavoritesStore((s) => s.setFavorites);

  // Track the last user we synced so we don't re-run on every render
  const syncedUserRef = useRef<string | null>(null);

  // Flag set during initial DB load to suppress the diff-sync effect
  const loadingRef = useRef(false);

  // Previous favourite IDs — used to compute the diff on each change
  const prevIdsRef = useRef<Set<string>>(new Set(favorites.map((f) => f.id)));

  // ── On login: load DB favourites and merge ──────────────────────────────────

  useEffect(() => {
    if (!isLoaded) return;

    const userId = user?.id ?? null;

    // User logged out — reset tracking, keep localStorage as-is
    if (!userId) {
      syncedUserRef.current = null;
      return;
    }

    // Already synced this user
    if (syncedUserRef.current === userId) return;
    syncedUserRef.current = userId;

    loadingRef.current = true;

    ;(async () => {
      try {
        // 1. Get listing IDs the user has saved in DB
        const dbIds = await getUserFavoriteIds(userId);

        // 2. Get current localStorage favourite IDs
        const localIds = favorites.map((f) => f.id);

        // 3. Any localStorage favourites not yet in DB — push them up
        const localOnlyIds = localIds.filter((id) => !dbIds.includes(id));
        if (localOnlyIds.length > 0) {
          await syncFavoritesToDB(userId, localOnlyIds);
        }

        // 4. Any DB favourites not in localStorage — fetch and add to store
        const missingFromLocal = dbIds.filter((id) => !localIds.includes(id));
        if (missingFromLocal.length > 0) {
          const dbListings = await getListingsByIds(missingFromLocal);
          const merged = [...favorites, ...dbListings];
          prevIdsRef.current = new Set(merged.map((f) => f.id));
          setFavorites(merged);
        } else {
          prevIdsRef.current = new Set(localIds);
        }
      } catch {
        // Silently ignore — DB connection errors (ECONNRESET, etc.) should never
        // surface to the user. Favourites remain in localStorage as fallback.
        if (process.env.NODE_ENV === "development") {
          console.warn("[FavoritesSync] DB sync skipped (connection issue)");
        }
        prevIdsRef.current = new Set(favorites.map((f) => f.id));
      } finally {
        loadingRef.current = false;
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isLoaded]);

  // ── On every toggle: sync diff to DB if logged in ──────────────────────────

  useEffect(() => {
    if (!user || loadingRef.current) return;

    const currentIds = new Set(favorites.map((f) => f.id));
    const prev = prevIdsRef.current;

    const added = [...currentIds].filter((id) => !prev.has(id));
    const removed = [...prev].filter((id) => !currentIds.has(id));

    if (added.length === 0 && removed.length === 0) return;

    // Fire-and-forget — silently ignore all DB errors (ECONNRESET, etc.)
    added.forEach((id) => addFavoriteDB(user.id, id).catch(() => {}));
    removed.forEach((id) => removeFavoriteDB(user.id, id).catch(() => {}));

    prevIdsRef.current = currentIds;
  }, [favorites, user?.id]);

  return null;
}

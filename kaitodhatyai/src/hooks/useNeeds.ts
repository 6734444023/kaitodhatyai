// useNeeds.ts
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { fetchNeeds, type Need } from "../services/needService";

export function useNeeds(initialType?: string, pageSize = 20) {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(initialType);
  const [namePrefix, setNamePrefix] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Reset when filters change
    lastDocRef.current = null;
    setNeeds([]);
    setHasMore(true);
    loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, namePrefix]);

  async function loadMore(reset = false) {
    if (loading) return;
    setLoading(true);
    try {
      const startAfterDoc = reset ? null : lastDocRef.current;
      const {
        docs,
        lastDoc,
        hasMore: more,
      } = await fetchNeeds({
        type: typeFilter,
        namePrefix,
        pageSize,
        startAfterDoc,
      });
      console.log(docs);
      setNeeds((prev) => (reset ? docs : [...prev, ...docs]));
      lastDocRef.current = lastDoc;
      setHasMore(Boolean(more));
    } catch (err) {
      console.error("loadMore needs error", err);
    } finally {
      setLoading(false);
    }
  }

  return {
    needs,
    loading,
    hasMore,
    loadMore,
    setTypeFilter,
    setNamePrefix,
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// firestoreNeedsService.ts
// Firebase v9 modular API (npm: firebase)
import {
  collection,
  endAt,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  startAfter,
  startAt,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../firebase-config";

// Types
export type Need = {
  id: string;
  type?: string;
  name?: string;
  createdAt?: { seconds: number; nanoseconds: number } | any; // adapt to your timestamp type
  // add other fields you use...
  [key: string]: any;
};

export type NeedsQueryOptions = {
  type?: string; // e.g. "HELP"
  namePrefix?: string; // prefix search on name (case-sensitive)
  pageSize?: number; // default 20
  startAfterDoc?: QueryDocumentSnapshot<DocumentData> | null;
  orderByField?: string; // default 'createdAt'
  orderDirection?: "asc" | "desc";
};

/**
 * Fetch a single page of needs (one-time).
 * Returns the array of Need, and lastDoc to be used as cursor for next page.
 */
export async function fetchNeedsPage(opts: NeedsQueryOptions) {
  // We'll implement explicit logic without buildNeedsQuery abstraction to keep behavior clear.
  const colRef = collection(db, "needs");
  const pageSize = opts.pageSize ?? 20;
  const constraints: QueryConstraint[] = [];

  if (opts.type) constraints.push(where("type", "==", opts.type));

  if (opts.namePrefix) {
    // prefix search: must order by name
    constraints.push(orderBy("name"));
    // startAt / endAt for prefix
    // dynamic import of startAt and endAt
  } else {
    const orderField = opts.orderByField ?? "createdAt";
    const dir = opts.orderDirection ?? "desc";
    constraints.push(orderBy(orderField, dir));
  }

  if (opts.startAfterDoc) constraints.push(startAfter(opts.startAfterDoc));
  constraints.push(limit(pageSize));

  // If namePrefix exists we need startAt & endAt; modular API requires startAt/endAt import:
  // We'll import startAt and endAt at top — but already used startAfter and limit; let's import them now.
  // However to avoid repeating imports at top, assume startAt/endAt are available.
  // Using a clerk-friendly approach: when namePrefix is set, we will call query with startAt & endAt.
  // But modular startAt/endAt are functions; let's re-import them and use.

  // --- Practical implementation:
  // Because it's clearer, implement two branches:

  // Branches:
  if (opts.namePrefix) {
    // dynamic import of required functions (already available at top but using them now)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startAt, endAt } = await import("firebase/firestore").then((m) => ({
      startAt: m.startAt,
      endAt: m.endAt,
    }));

    const start = opts.namePrefix;
    const end = `${opts.namePrefix}\uf8ff`;

    const q = query(
      colRef,
      ...(opts.type ? [where("type", "==", opts.type)] : []),
      orderBy("name"),
      startAt(start),
      endAt(end),
      ...(opts.startAfterDoc ? [startAfter(opts.startAfterDoc)] : []),
      limit(pageSize)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as Need[];
    const lastDoc = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
    const hasMore = snap.docs.length === pageSize;
    return { docs, lastDoc, hasMore };
  } else {
    const orderField = opts.orderByField ?? "createdAt";
    const dir = opts.orderDirection ?? "desc";
    const q = query(
      colRef,
      ...(opts.type ? [where("type", "==", opts.type)] : []),
      orderBy(orderField, dir),
      ...(opts.startAfterDoc ? [startAfter(opts.startAfterDoc)] : []),
      limit(pageSize)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as Need[];
    const lastDoc = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
    const hasMore = snap.docs.length === pageSize;
    return { docs, lastDoc, hasMore };
  }
}

/**
 * Real-time subscription to needs queries.
 * onUpdate gets called with the current array of Need whenever snapshot changes.
 * Returns an unsubscribe function.
 */
export async function subscribeNeeds(
  opts: NeedsQueryOptions,
  onUpdate: (
    needs: Need[],
    meta: { lastDoc: QueryDocumentSnapshot<DocumentData> | null }
  ) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, "needs");
  const pageSize = opts.pageSize ?? 50;

  // For simplicity in this subscribe helper we'll only support non-namePrefix real-time queries.
  const q = query(
    colRef,
    ...(opts.type ? [where("type", "==", opts.type)] : []),
    orderBy(opts.orderByField ?? "createdAt", opts.orderDirection ?? "desc"),
    limit(pageSize)
  );

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      })) as Need[];
      const lastDoc = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
      onUpdate(docs, { lastDoc });
    },
    (err) => {
      if (onError) onError(err);
      else console.error("subscribeNeeds error:", err);
    }
  );

  return unsubscribe;
}

export async function fetchNeeds({
  type,
  namePrefix,
  pageSize = 20,
  startAfterDoc = null,
  orderByField = "createdAt",
  orderDirection = "desc",
}: {
  type?: string;
  namePrefix?: string;
  pageSize?: number;
  startAfterDoc?: QueryDocumentSnapshot<DocumentData> | null;
  orderByField?: string;
  orderDirection?: "asc" | "desc";
}) {
  const colRef = collection(db, "needs");
  if (namePrefix) {
    // prefix search on name
    const start = namePrefix;
    const end = `${namePrefix}\uf8ff`;
    const q = query(
      colRef,
      ...(type ? [where("type", "==", type)] : []),
      orderBy("name"),
      ...(startAfterDoc ? [startAfter(startAfterDoc)] : []),
      startAt(start),
      endAt(end),
      limit(pageSize)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as Need[];
    const lastDoc = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
    return { docs, lastDoc, hasMore: snap.docs.length === pageSize };
  } else {
    const q = query(
      colRef,
      ...(type ? [where("type", "==", type)] : [])
      // orderBy(orderByField, orderDirection),
      // ...(startAfterDoc ? [startAfter(startAfterDoc)] : []),
      // limit(pageSize)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as Need[];
    const lastDoc = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
    return { docs, lastDoc, hasMore: snap.docs.length === pageSize };
  }
}

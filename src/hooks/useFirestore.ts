import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    DocumentSnapshot,
    QueryConstraint,
    WhereFilterOp,
    OrderByDirection
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface QueryFilter {
    field: string;
    operator: WhereFilterOp;
    value: unknown;
}

export interface QueryOptions {
    filters?: QueryFilter[];
    orderByField?: string;
    orderDirection?: OrderByDirection;
    pageSize?: number;
    lastDoc?: DocumentSnapshot | null;
}

export interface UseFirestoreReturn<T> {
    data: T[];
    loading: boolean;
    error: Error | null;
    hasMore: boolean;
    lastDoc: DocumentSnapshot | null;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    add: (item: Partial<T>) => Promise<string>;
    update: (id: string, updates: Partial<T>) => Promise<void>;
    remove: (id: string) => Promise<void>;
    getById: (id: string) => Promise<T | null>;
}

export function useFirestore<T extends { id?: string }>(
    collectionName: string,
    options: QueryOptions = {}
): UseFirestoreReturn<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

    const {
        filters = [],
        orderByField = 'created_at',
        orderDirection = 'desc',
        pageSize = 20
    } = options;

    // Use a stringified version of filters for the dependency array to prevent unnecessary re-fetches
    const filtersString = JSON.stringify(filters);

    const buildQuery = useCallback((startAfterDoc?: DocumentSnapshot | null) => {
        const constraints: QueryConstraint[] = [];

        // Add filters
        const activeFilters = JSON.parse(filtersString) as QueryFilter[];
        activeFilters.forEach(filter => {
            constraints.push(where(filter.field, filter.operator, filter.value));
        });

        // Add ordering
        if (orderByField) {
            constraints.push(orderBy(orderByField, orderDirection));
        }

        // Add pagination
        constraints.push(limit(pageSize));

        if (startAfterDoc) {
            constraints.push(startAfter(startAfterDoc));
        }

        return query(collection(db, collectionName), ...constraints);
    }, [collectionName, filtersString, orderByField, orderDirection, pageSize]);

    const fetchData = useCallback(async (append = false, startAfterDoc?: DocumentSnapshot | null) => {
        try {
            setLoading(true);
            setError(null);

            const q = buildQuery(startAfterDoc);
            const snapshot = await getDocs(q);

            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[];

            if (append) {
                setData(prev => [...prev, ...items]);
            } else {
                setData(items);
            }

            setHasMore(snapshot.docs.length === pageSize);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        } catch (err) {
            console.error(`Error fetching ${collectionName}:`, err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [buildQuery, collectionName, pageSize]);

    const refresh = useCallback(async () => {
        setLastDoc(null);
        await fetchData(false);
    }, [fetchData]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loading) return;
        await fetchData(true, lastDoc);
    }, [fetchData, hasMore, loading, lastDoc]);

    const add = useCallback(async (item: Partial<T>): Promise<string> => {
        const docRef = await addDoc(collection(db, collectionName), {
            ...item,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        await refresh();
        return docRef.id;
    }, [collectionName, refresh]);

    const update = useCallback(async (id: string, updates: Partial<T>): Promise<void> => {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
            ...updates,
            updated_at: new Date().toISOString()
        });
        await refresh();
    }, [collectionName, refresh]);

    const remove = useCallback(async (id: string): Promise<void> => {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        await refresh();
    }, [collectionName, refresh]);

    const getById = useCallback(async (id: string): Promise<T | null> => {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
    }, [collectionName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        hasMore,
        lastDoc,
        refresh,
        loadMore,
        add,
        update,
        remove,
        getById
    };
}

// Hook for single document
export function useFirestoreDoc<T>(collectionName: string, docId: string | null) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!docId) {
            setData(null);
            setLoading(false);
            return;
        }

        const fetchDoc = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, collectionName, docId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setData({ id: docSnap.id, ...docSnap.data() } as T);
                } else {
                    setData(null);
                }
            } catch (err) {
                console.error(`Error fetching ${collectionName}/${docId}:`, err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoc();
    }, [collectionName, docId]);

    return { data, loading, error };
}

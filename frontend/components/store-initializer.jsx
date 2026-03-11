'use client';

import { useEffect, useRef } from 'react';
import { useContentTypeStore } from '@/lib/store';

export default function StoreInitializer() {
    const initialized = useRef(false);
    const fetchData = useContentTypeStore(state => state.fetchData);

    useEffect(() => {
        if (!initialized.current) {
            fetchData();
            initialized.current = true;
        }
    }, [fetchData]);

    return null;
}

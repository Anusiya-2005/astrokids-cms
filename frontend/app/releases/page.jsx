'use client';

import React, { useState } from 'react';
import { useContentTypeStore } from '@/lib/store';
import { ReleasesSidebar } from '@/components/releases/sidebar';
import { ReleasesList } from '@/components/releases/list';

export default function ReleasesPage() {
    const hasHydrated = useContentTypeStore(state => state._hasHydrated);
    const [activeTab, setActiveTab] = useState('pending');

    if (!hasHydrated) {
        return (
            <div className="flex-1 h-full w-full bg-[#f6f6f9] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#4945ff] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-full w-full bg-[#f6f6f9]">
            <ReleasesSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <ReleasesList status={activeTab} />
        </div>
    );
}

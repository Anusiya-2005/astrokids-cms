'use client';

import { useContentTypeStore } from '@/lib/store';
import { ContentManagerSidebar } from '@/components/content-manager/sidebar';
import { DataTable } from '@/components/content-manager/data-table';

export default function ContentManagerPage() {
    const hasHydrated = useContentTypeStore(state => state._hasHydrated);

    if (!hasHydrated) {
        return (
            <div className="flex-1 h-full w-full bg-[#f6f6f9] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#4945ff] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-full w-full bg-[#f6f6f9]">
            <ContentManagerSidebar />
            <DataTable />
        </div>
    );
}

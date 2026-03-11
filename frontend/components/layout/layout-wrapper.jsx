'use client';

import { usePathname } from 'next/navigation';
import { MainNavbar } from '@/components/layout/main-navbar';

export function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isPreview = pathname?.startsWith('/preview/');

    if (isPreview) {
        return <div className="min-h-screen bg-white">{children}</div>;
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <MainNavbar />
            <div className="flex-1 flex overflow-hidden">
                {children}
            </div>
        </div>
    );
}

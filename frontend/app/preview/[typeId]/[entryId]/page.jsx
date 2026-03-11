"use client";
import React, { use } from 'react';
import { useContentTypeStore } from '@/lib/store';
import BlogFormatContent, { getPreviewContent } from '@/components/content-type-builder/data-preview';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ExternalPreviewPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { typeId, entryId } = params;

    const { contentTypes, entries, _hasHydrated, fetchData } = useContentTypeStore();

    const [isLoading, setIsLoading] = React.useState(!_hasHydrated);

    React.useEffect(() => {
        if (!_hasHydrated) {
            fetchData().then(() => setIsLoading(false));
        }
    }, [_hasHydrated, fetchData]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 text-[#2DB787] animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading preview...</p>
            </div>
        );
    }

    const selectedType = contentTypes.find(t => t.id === typeId);
    const selectedEntry = entries.find(e => e.id === entryId);

    if (!selectedType || !selectedEntry) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h1>
                    <p className="text-gray-600 mb-6">We couldn&apos;t find the blog post or content type you&apos;re looking for. It might have been deleted or moved.</p>
                    <Link
                        href="/content-type-builder"
                        className="inline-flex items-center justify-center px-6 py-3 bg-[#2DB787] text-white font-bold rounded-xl hover:bg-[#259d73] transition-all shadow-lg shadow-[#2DB787]/20"
                    >
                        <ChevronLeft className="mr-2 w-4 h-4" /> Go Back
                    </Link>
                </div>
            </div>
        );
    }

    const previewContent = getPreviewContent(selectedEntry, selectedType);

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#2DB787]/20">
            {/* Minimal Navigation Overlay */}
            <div className="fixed top-6 left-6 z-50 pointer-events-none print:hidden">
                <Link
                    href="/content-type-builder"
                    className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:text-[#2DB787] hover:border-[#2DB787] transition-all shadow-sm"
                >
                    <ChevronLeft size={16} /> Exit Preview
                </Link>
            </div>

            {/* Main Content Area */}
            <main className="relative">
                <BlogFormatContent content={previewContent} />
            </main>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-gray-100 mt-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm italic">
                        Preview generated from Content Management System
                    </p>
                </div>
            </footer>
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import {
    Database,
    LayoutGrid,
    Image as ImageIcon,
    Rocket,
    Plus,
    ExternalLink,
    Users,
    Zap,
    Clock,
    CheckCircle2,
    FileText,
    Puzzle,
    Globe,
    Key,
    Edit2
} from 'lucide-react';
import Link from 'next/link';
import { useContentTypeStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Helper to format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
}

// Helper to get entry display title
function getEntryTitle(entry, contentType) {
    if (!contentType) return `Entry ${entry.id}`;
    const data = entry.data;
    const titleKeys = ['title', 'name', 'username', 'label', 'subject', 'heading'];
    const foundKey = Object.keys(data).find(key => titleKeys.includes(key.toLowerCase()));

    let title = foundKey ? data[foundKey] : null;

    if (!title) {
        // Fallback: Use the first string field found
        const firstStringField = Object.entries(data).find(([_, val]) => typeof val === 'string');
        title = firstStringField ? firstStringField[1] : `ID: ${entry.id}`;
    }

    if (typeof title === 'string' && title.length > 0) {
        return title.charAt(0).toUpperCase() + title.slice(1);
    }
    return String(title);
}

export default function DashboardPage() {
    const { contentTypes, assets, entries, selectContentType } = useContentTypeStore();
    const mounted = React.useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    if (!mounted) return <div className="flex-1 bg-[#f6f6f9]" />;

    // Stats calculations
    const lastEdited = [...entries].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
    const lastPublished = entries.filter(e => e.status === 'published').sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
    const recentEntries = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    const projectStats = [
        { name: 'Entries', value: entries.length, icon: Database, color: 'text-blue-600' },
        { name: 'Assets', value: assets.length, icon: ImageIcon, color: 'text-green-600' },
        { name: 'Content-Types', value: contentTypes.length, icon: LayoutGrid, color: 'text-purple-600' },
        { name: 'Components', value: 0, icon: Puzzle, color: 'text-orange-600' },
        { name: 'Locales', value: 1, icon: Globe, color: 'text-cyan-600' },
        { name: 'Admins', value: 1, icon: Users, color: 'text-indigo-600' },
        { name: 'Webhooks', value: 0, icon: Zap, color: 'text-amber-600' },
        { name: 'API Tokens', value: 2, icon: Key, color: 'text-pink-600' },
    ];

    const EntryItem = ({ entry, timeLabel = 'Updated' }) => {
        const contentType = contentTypes.find(t => t.id === entry.contentTypeId);
        const displayTime = timeLabel === 'Created' ? entry.createdAt : entry.updatedAt;

        return (
            <div className="p-5 hover:bg-[#f6f6f9] transition-all flex items-center justify-between group border-b border-[#f6f6f9] last:border-0">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-[#f0f0ff] rounded-xl flex items-center justify-center text-[#4945ff] shrink-0 border border-[#e3e3fd]/50 transition-colors group-hover:bg-[#4945ff] group-hover:text-white">
                        <Database size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[15px] font-bold text-[#32324d] truncate transition-colors group-hover:text-[#4945ff]">
                            {getEntryTitle(entry, contentType)}
                        </p>
                        <p className="text-[13px] text-[#8e8ea9] truncate lowercase font-medium">
                            {contentType?.name || 'unknown'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end min-w-[100px]">
                        <span className={cn(
                            "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 min-w-[70px] justify-center",
                            (entry.status || 'draft') === 'published' ? "bg-green-100 text-green-700 border-green-200" :
                                (entry.status || 'draft') === 'changed' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                    "bg-blue-100 text-blue-700 border-blue-200"
                        )}>
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full shadow-sm shrink-0",
                                (entry.status || 'draft') === 'published' ? "bg-green-600" :
                                    (entry.status || 'draft') === 'changed' ? "bg-amber-600" :
                                        "bg-blue-600"
                            )}></span>
                            <span className="truncate">{entry.status || 'draft'}</span>
                        </span>
                        <span suppressHydrationWarning={true} className="text-[10px] text-[#a5a5ba] mt-1 whitespace-nowrap">
                            {timeLabel} {formatTimeAgo(displayTime)}
                        </span>
                    </div>
                    <Link
                        href="/content-manager"
                        onClick={() => selectContentType(entry.contentTypeId)}
                        className="p-2.5 text-[#a5a5ba] hover:text-[#4945ff] hover:bg-white rounded-lg transition-all border border-transparent hover:border-[#dcdce4] shadow-sm hover:shadow-md"
                    >
                        <Edit2 size={16} />
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 bg-[#f6f6f9] overflow-y-auto p-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white p-6 rounded-xl border border-[#dcdce4] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#32324d]">Welcome to AstroKids CMS! 👋</h1>
                        <p className="text-[#666687] mt-2 text-lg">Your central hub for content management and project insights.</p>
                    </div>
                    <Link
                        href="/content-type-builder"
                        className="bg-[#4945ff] hover:bg-[#271fe0] text-white px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg active:scale-95"
                    >
                        <Plus size={18} /> Create Content Type
                    </Link>
                </div>

                <div className="space-y-6">
                    {/* Row 1: Recent Entries & Recently Edited */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 1. Recent Entries */}
                        <div className="bg-white rounded-xl border border-[#dcdce4] shadow-sm overflow-hidden flex flex-col h-[400px]">
                            <div className="p-4 border-b border-[#f6f6f9] flex justify-between items-center bg-[#fcfcfd] shrink-0">
                                <h2 className="text-lg font-bold text-[#32324d] flex items-center gap-3">
                                    <div className="p-1.5 bg-[#f0f0ff] text-[#4945ff] rounded-lg">
                                        <FileText size={18} />
                                    </div>
                                    Recent Entries
                                </h2>
                                <Link href="/content-manager" className="text-[#4945ff] text-xs font-bold hover:underline">View all</Link>
                            </div>
                            <div className="bg-white flex-1 overflow-y-auto custom-scrollbar">
                                {recentEntries.length === 0 ? (
                                    <div className="p-10 text-center bg-white h-full flex flex-col justify-center">
                                        <Database size={32} className="text-[#dcdce4] mx-auto mb-3" />
                                        <p className="text-[#a5a5ba] text-xs">No entries found. Start by creating your first entry.</p>
                                    </div>
                                ) : (
                                    recentEntries.map(entry => <EntryItem key={entry.id} entry={entry} timeLabel="Created" />)
                                )}
                            </div>
                        </div>

                        {/* 2. Recently Edited */}
                        <div className="bg-white rounded-xl border border-[#dcdce4] shadow-sm overflow-hidden flex flex-col h-[400px]">
                            <div className="p-4 border-b border-[#f6f6f9] flex justify-between items-center bg-[#fcfcfd] shrink-0">
                                <h2 className="text-lg font-bold text-[#32324d] flex items-center gap-2">
                                    <Clock size={18} className="text-amber-500" /> Recently Edited
                                </h2>
                            </div>
                            <div className="bg-white flex-1 overflow-y-auto custom-scrollbar">
                                {lastEdited.length === 0 ? (
                                    <div className="p-10 text-center text-[#a5a5ba] bg-white text-xs h-full flex flex-col justify-center">No activity to show.</div>
                                ) : (
                                    lastEdited.map(entry => <EntryItem key={entry.id} entry={entry} timeLabel="Edited" />)
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Project Statistics & Published Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 3. Project Statistics */}
                        <div className="bg-white rounded-xl border border-[#dcdce4] shadow-sm overflow-hidden flex flex-col h-[400px]">
                            <div className="p-5 border-b border-[#f6f6f9] bg-[#fcfcfd] shrink-0">
                                <h2 className="text-lg font-bold text-[#32324d]">Project Statistics</h2>
                            </div>
                            <div className="p-5 grid grid-cols-2 gap-x-4 gap-y-3 flex-1 overflow-y-auto custom-scrollbar">
                                {projectStats.map((stat) => (
                                    <div key={stat.name} className="flex items-center justify-between group hover:bg-[#f6f6f9] px-2 py-2 rounded-lg transition-all cursor-default border border-transparent hover:border-[#f0f0f5]">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("p-1.5 bg-[#f6f6f9] group-hover:bg-white rounded-md transition-colors", stat.color)}>
                                                <stat.icon size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-[#4a4a6a] transition-colors group-hover:text-[#4945ff]">{stat.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-[#32324d] bg-[#f0f0ff] px-2 py-0.5 rounded min-w-[20px] text-center">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-[#fcfcfd] border-t border-[#f6f6f9] shrink-0">
                                <Link
                                    href="/settings"
                                    className="text-xs font-bold text-[#4945ff] hover:text-[#271fe0] flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
                                >
                                    Advanced Settings <ExternalLink size={12} />
                                </Link>
                            </div>
                        </div>

                        {/* 4. Published Content */}
                        <div className="bg-white rounded-xl border border-[#dcdce4] shadow-sm overflow-hidden flex flex-col h-[400px]">
                            <div className="p-4 border-b border-[#f6f6f9] flex justify-between items-center bg-[#fcfcfd] shrink-0">
                                <h2 className="text-lg font-bold text-[#32324d] flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-green-500" /> Published Content
                                </h2>
                            </div>
                            <div className="bg-white flex-1 overflow-y-auto custom-scrollbar">
                                {lastPublished.length === 0 ? (
                                    <div className="p-10 text-center text-[#a5a5ba] bg-white text-xs h-full flex flex-col justify-center">No published content yet.</div>
                                ) : (
                                    lastPublished.map(entry => <EntryItem key={entry.id} entry={entry} timeLabel="Published" />)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import {
    Image as ImageIcon,
    Video,
    FileText,
    Folder,
    Star,
    Clock,
    Trash2,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContentTypeStore } from '@/lib/store';

export function MediaSidebar({ onFilterChange }) {
    const { assets } = useContentTypeStore();
    const [activeFilter, setActiveFilter] = useState('all');

    const imageCount = assets.filter(a => a.type === 'image').length;
    const fileCount = assets.filter(a => a.type === 'file').length;

    const menuItems = [
        { id: 'all', name: 'All assets', icon: ImageIcon, count: assets.length },
        { id: 'images', name: 'Images', icon: ImageIcon, count: imageCount },
        { id: 'videos', name: 'Videos', icon: Video, count: 0 },
        { id: 'files', name: 'Files', icon: FileText, count: fileCount },
    ];

    const collections = [
        { id: 'favorites', name: 'Favorites', icon: Star },
        { id: 'recent', name: 'Recent', icon: Clock },
        { id: 'trash', name: 'Trash', icon: Trash2 },
    ];

    const handleFilterClick = (filterId) => {
        setActiveFilter(filterId);
        if (onFilterChange) {
            onFilterChange(filterId);
        }
    };

    return (
        <div className="w-64 bg-white border-r border-[#dcdce4] h-full flex flex-col shrink-0 font-sans shadow-sm">
            <div className="p-6">
                <h2 className="text-xl font-bold text-[#32324d]">Media Library</h2>
                <p className="text-xs text-[#666687] mt-1">Manage all your assets</p>

                <button
                    onClick={() => alert('Folder creation functionality coming soon!')}
                    className="w-full mt-6 bg-[#f0f0ff] hover:bg-[#4945ff] text-[#4945ff] hover:text-white px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 border border-[#dcdce4]"
                >
                    <Plus size={14} /> New Folder
                </button>
            </div>

            <div className="flex-1 px-3 space-y-8 overflow-y-auto pb-6">
                <div>
                    <h3 className="px-3 text-[10px] font-bold text-[#a5a5ba] uppercase tracking-widest mb-3">Folders</h3>
                    <div className="space-y-1">
                        <button
                            onClick={() => handleFilterClick('all')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-md transition-all",
                                activeFilter === 'all'
                                    ? "text-[#4945ff] bg-[#f0f0ff]"
                                    : "text-[#4a4a6a] hover:bg-[#f6f6f9]"
                            )}
                        >
                            <Folder size={16} />
                            <span>Browse files</span>
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="px-3 text-[10px] font-bold text-[#a5a5ba] uppercase tracking-widest mb-3">Filter by</h3>
                    <div className="space-y-1">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleFilterClick(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-all group",
                                    activeFilter === item.id
                                        ? "text-[#4945ff] bg-[#f0f0ff] font-semibold"
                                        : "text-[#4a4a6a] hover:bg-[#f6f6f9]"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={16} className={cn(
                                        activeFilter === item.id ? "text-[#4945ff]" : "text-[#666687] group-hover:text-[#4945ff]"
                                    )} />
                                    <span>{item.name}</span>
                                </div>
                                <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                                    activeFilter === item.id
                                        ? "bg-[#4945ff] text-white"
                                        : "bg-[#f6f6f9] text-[#666687]"
                                )}>{item.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="px-3 text-[10px] font-bold text-[#a5a5ba] uppercase tracking-widest mb-3">Collections</h3>
                    <div className="space-y-1">
                        {collections.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleFilterClick(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all group",
                                    activeFilter === item.id
                                        ? "text-[#4945ff] bg-[#f0f0ff] font-semibold"
                                        : "text-[#4a4a6a] hover:bg-[#f6f6f9]"
                                )}
                            >
                                <item.icon size={16} className={cn(
                                    activeFilter === item.id ? "text-[#4945ff]" : "text-[#666687] group-hover:text-[#4945ff]"
                                )} />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-[#f6f6f9] bg-[#fcfcfd]">
                <div className="flex items-center gap-3 px-3">
                    <div className="w-8 h-8 rounded bg-[#f0f0ff] flex items-center justify-center text-[#4945ff]">
                        <FileText size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-[#32324d]">Storage used</p>
                        <div className="w-24 h-1 bg-[#dcdce4] rounded-full mt-1 overflow-hidden">
                            <div className="w-1/3 h-full bg-[#4945ff]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

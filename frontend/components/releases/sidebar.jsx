'use client';

import React from 'react';
import { useContentTypeStore } from '@/lib/store';
import { Search, Rocket, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReleasesSidebar({ activeTab, setActiveTab }) {
    const { releases } = useContentTypeStore();

    const pendingCount = releases.filter(r => r.status === 'pending').length;
    const doneCount = releases.filter(r => r.status === 'done').length;

    return (
        <div className="w-64 bg-white border-r border-[#e3e3e3] h-full flex flex-col shadow-sm">
            <div className="p-4 py-6">
                <h2 className="text-xl font-bold text-[#32324d] mb-1">Releases</h2>
                <p className="text-xs text-[#666687]">Bundle and schedule content</p>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all",
                        activeTab === 'pending' ? "bg-[#f0f0ff] text-[#4945ff] font-bold" : "text-[#4a4a6a] hover:bg-[#f6f6f9]"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Clock size={16} />
                        <span>Pending</span>
                    </div>
                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                        activeTab === 'pending' ? "bg-[#4945ff] text-white" : "bg-[#f6f6f9] text-[#666687]"
                    )}>{pendingCount}</span>
                </button>

                <button
                    onClick={() => setActiveTab('done')}
                    className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all",
                        activeTab === 'done' ? "bg-[#f0f0ff] text-[#4945ff] font-bold" : "text-[#4a4a6a] hover:bg-[#f6f6f9]"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} />
                        <span>Done</span>
                    </div>
                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                        activeTab === 'done' ? "bg-[#4945ff] text-white" : "bg-[#f6f6f9] text-[#666687]"
                    )}>{doneCount}</span>
                </button>
            </nav>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import { useContentTypeStore } from '@/lib/store';
import { Search, Settings, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const { contentTypes, selectedTypeId, selectContentType, addContentType, deleteContentType } = useContentTypeStore();
    const [isCreating, setIsCreating] = useState(null);
    const [newTypeName, setNewTypeName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCreate = () => {
        if (!newTypeName.trim() || !isCreating) return;
        const newType = {
            id: Date.now().toString(),
            name: newTypeName,
            kind: isCreating,
            fields: []
        };
        addContentType(newType);
        setNewTypeName('');
        setIsCreating(null);
    };

    const filteredTypes = contentTypes.filter(t =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-64 bg-white border-r border-[#e3e3e3] h-full flex flex-col shadow-sm">
            <div className="p-4 py-6">
                <h2 className="text-xl font-bold text-[#32324d] mb-1">Content Preview</h2>
                <p className="text-xs text-[#666687]">View your saved entries</p>
            </div>

            <div className="px-4 py-2 flex-col flex gap-6 overflow-y-auto">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search size={14} className="text-[#a5a5ba]" />
                    </div>
                    <input
                        placeholder="Search types..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#f6f6f9] border border-[#dcdce4] rounded-md pl-9 pr-3 py-2 text-sm text-[#32324d] focus:border-[#4945ff] focus:ring-1 focus:ring-[#4945ff] transition-all outline-none"
                    />
                </div>

                <div className="space-y-6">
                    {/* Categories (Merged Types) */}
                    <div>
                        <div className="flex items-center justify-between px-1 mb-3">
                            <span className="text-[11px] font-bold text-[#666687] uppercase tracking-wider">Categories ({filteredTypes.length})</span>
                        </div>

                        {isCreating && (
                            <div className="px-1 mb-2">
                                <input
                                    autoFocus
                                    className="w-full text-sm border-[#dcdce4] rounded px-3 py-2 focus:border-[#4945ff] focus:ring-1 focus:ring-[#4945ff] outline-none"
                                    value={newTypeName}
                                    onChange={e => setNewTypeName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                    onBlur={() => !newTypeName && setIsCreating(null)}
                                    placeholder="Category name..."
                                />
                            </div>
                        )}

                        <ul className="space-y-1">
                            {filteredTypes.map(type => (
                                <li key={type.id} className="group relative">
                                    <button
                                        onClick={() => selectContentType(type.id)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-3 relative pr-8",
                                            selectedTypeId === type.id
                                                ? "bg-[#f0f0ff] text-[#4945ff] font-semibold"
                                                : "text-[#4a4a6a] hover:bg-[#f6f6f9]"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full transition-all",
                                            selectedTypeId === type.id ? "bg-[#4945ff] scale-125" : "bg-[#a5a5ba] group-hover:bg-[#666687]"
                                        )} />
                                        <span className="truncate">{type.name}</span>
                                        {selectedTypeId === type.id && (
                                            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#4945ff] rounded-r-full" />
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteContentType(type.id); }}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-[#a5a5ba] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-[#f6f6f9]">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#666687] hover:text-[#32324d] hover:bg-[#f6f6f9] rounded-md transition-colors font-medium">
                    <Settings size={14} />
                    Configure the view
                </button>
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import { useContentTypeStore } from '@/lib/store';
import { Calendar, MoreVertical, Plus, Rocket, X, Clock, Trash2, ChevronRight, FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReleasesList({ status }) {
    const { releases, addRelease, deleteRelease, publishRelease, entries, contentTypes } = useContentTypeStore();
    const [isCreating, setIsCreating] = useState(false);
    const [viewingRelease, setViewingRelease] = useState(null);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newDate, setNewDate] = useState('');

    const filteredReleases = releases.filter(r => r.status === status);

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newName) return;
        addRelease({
            name: newName,
            description: newDesc,
            scheduledAt: newDate || null,
        });
        setNewName('');
        setNewDesc('');
        setNewDate('');
        setIsCreating(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f6f6f9] overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-[#dcdce4] flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-[#32324d] capitalize">{status} Releases</h1>
                    <p className="text-sm text-[#666687]">{filteredReleases.length} releases found</p>
                </div>
                {status === 'pending' && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-[#4945ff] hover:bg-[#271fe0] text-white px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={16} /> New Release
                    </button>
                )}
            </div>

            {/* List */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-4">
                    {filteredReleases.length === 0 ? (
                        <div className="bg-white p-20 rounded-xl border border-dashed border-[#dcdce4] flex flex-col items-center text-center">
                            <Rocket size={48} className="text-[#a5a5ba] mb-4" />
                            <h3 className="text-lg font-bold text-[#32324d]">No {status} releases</h3>
                            <p className="text-[#666687] text-sm mt-1">Start grouping your content entries into releases.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredReleases.map(release => (
                                <div key={release.id} className="bg-white rounded-xl border border-[#dcdce4] p-5 shadow-sm hover:shadow-md transition-all flex flex-col group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-[#f0f0ff] text-[#4945ff] rounded-lg flex items-center justify-center">
                                            <Rocket size={20} />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => deleteRelease(release.id)}
                                                className="p-1.5 text-[#666687] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setViewingRelease(release)}
                                                className="p-1.5 text-[#666687] hover:text-[#4945ff] hover:bg-[#f0f0ff] rounded transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-[#32324d] text-lg mb-1">{release.name}</h3>
                                    <p className="text-sm text-[#666687] line-clamp-2 mb-4 flex-1">
                                        {release.description || "No description provided."}
                                    </p>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f6f6f9]">
                                        <div className="flex items-center gap-2 text-[#666687]">
                                            <Calendar size={14} />
                                            <span className="text-xs">
                                                {release.scheduledAt
                                                    ? new Date(release.scheduledAt).toLocaleDateString()
                                                    : "Manual publish"}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setViewingRelease(release)}
                                            className="text-xs font-bold text-[#4945ff] hover:underline"
                                        >
                                            {release.entries.length} items
                                        </button>
                                    </div>

                                    {status === 'pending' && (
                                        <button
                                            onClick={() => publishRelease(release.id)}
                                            className="w-full mt-4 bg-[#f0f0ff] hover:bg-[#4945ff] text-[#4945ff] hover:text-white py-2 rounded-md text-xs font-bold transition-all"
                                        >
                                            Publish Now
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-[#32324d]/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-sans">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#f6f6f9] flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[#32324d]">Create a release</h3>
                            <button onClick={() => setIsCreating(false)} className="text-[#a5a5ba] hover:text-[#32324d]">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-[#666687] uppercase tracking-wider mb-2">Name</label>
                                <input
                                    autoFocus
                                    className="w-full border border-[#dcdce4] rounded-md px-4 py-2.5 text-sm outline-none focus:border-[#4945ff] transition-all text-[#32324d]"
                                    placeholder="e.g. Black Friday 2024"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#666687] uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    className="w-full border border-[#dcdce4] rounded-md px-4 py-2 text-sm outline-none focus:border-[#4945ff] transition-all min-h-[80px] text-[#32324d]"
                                    placeholder="Optional description..."
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#666687] uppercase tracking-wider mb-2">Scheduled Release (Optional)</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full border border-[#dcdce4] rounded-md px-4 py-2.5 text-sm outline-none focus:border-[#4945ff] transition-all text-[#32324d]"
                                        value={newDate}
                                        onChange={e => setNewDate(e.target.value)}
                                    />
                                </div>
                                <p className="text-[10px] text-[#a5a5ba] mt-1.5 flex items-center gap-1.5 px-1">
                                    <Clock size={10} /> Leave empty to publish manually.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 bg-white border border-[#dcdce4] py-2.5 rounded-md text-sm font-bold text-[#32324d] hover:bg-[#f6f6f9] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#4945ff] py-2.5 rounded-md text-sm font-bold text-white hover:bg-[#271fe0] transition-all shadow-lg active:scale-95"
                                >
                                    Create Release
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Release Modal */}
            {viewingRelease && (
                <div className="fixed inset-0 bg-[#32324d]/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-sans">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#f6f6f9] flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-[#32324d]">{viewingRelease.name}</h3>
                                <p className="text-xs text-[#a5a5ba] mt-1">{viewingRelease.entries.length} items in this release</p>
                            </div>
                            <button onClick={() => setViewingRelease(null)} className="text-[#a5a5ba] hover:text-[#32324d] p-2 hover:bg-[#f6f6f9] rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[500px] overflow-y-auto">
                            {viewingRelease.entries.length === 0 ? (
                                <p className="text-center py-12 text-[#666687] text-sm">No items in this release yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {viewingRelease.entries.map((item, idx) => {
                                        const entry = entries.find(e => e.id === item.entryId);
                                        const type = contentTypes.find(t => t.id === item.contentTypeId);
                                        if (!entry || !type) return null;

                                        return (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-[#f6f6f9] rounded-lg border border-[#dcdce4]">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white border border-[#dcdce4] rounded flex items-center justify-center text-[#4945ff]">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#32324d] text-sm truncate max-w-[200px]">
                                                            {Object.values(entry.data)[0] || entry.id}
                                                        </p>
                                                        <p className="text-[10px] text-[#a5a5ba] uppercase font-bold tracking-wider">{type.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded font-bold uppercase">
                                                        {entry.status}
                                                    </span>
                                                    <ChevronRight size={16} className="text-[#a5a5ba]" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-[#f6f6f9] flex justify-end bg-[#fcfcfd]">
                            <button
                                onClick={() => setViewingRelease(null)}
                                className="px-6 py-2 text-sm font-bold text-[#32324d] hover:bg-[#f6f6f9] rounded-md border border-[#dcdce4] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

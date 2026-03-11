'use client';

import React, { useState, useEffect } from 'react';
import { useContentTypeStore } from '@/lib/store';
import {
    Search,
    Globe,
    Filter,
    Trash,
    Download,
    X,
    Database,
    ArrowUpDown,
    Rocket,
    Edit2,
    MoreHorizontal,
    Settings2,
    Plus,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export function CollectionListView({
    contentType,
    entries,
    onEdit,
    onDelete,
    onBulkDelete,
    onBulkPublish,
    onBulkUnpublish,
    onAddToRelease,
    onCreate
}) {
    const { releases, visibleFieldsConfig, setVisibleFields } = useContentTypeStore();
    const [filterQuery, setFilterQuery] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState([]);
    const [selectedEntries, setSelectedEntries] = useState([]);
    const [showReleaseModalFor, setShowReleaseModalFor] = useState(null);
    const [visibleFieldIds, setVisibleFieldIds] = useState(() => {
        const savedConfig = visibleFieldsConfig[contentType.id];
        if (savedConfig && savedConfig.length > 0) return savedConfig;
        return contentType.fields.map(f => f.id);
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [prevFilters, setPrevFilters] = useState({ query: filterQuery, filters: filters, typeId: contentType.id });

    // Reset pagination when filters change (React render-phase pattern)
    if (prevFilters.query !== filterQuery || prevFilters.filters !== filters || prevFilters.typeId !== contentType.id) {
        setPrevFilters({ query: filterQuery, filters: filters, typeId: contentType.id });
        setCurrentPage(1);
    }

    // Filter Logic
    const filteredEntries = entries.filter(e => {
        if (e.contentTypeId !== contentType.id) return false;

        if (filterQuery && !JSON.stringify(e.data).toLowerCase().includes(filterQuery.toLowerCase())) {
            return false;
        }

        if (filters.length > 0) {
            return filters.every(filter => {
                const entryValue = String(e.data[filter.field] || '').toLowerCase();
                const filterValue = filter.value.toLowerCase();
                switch (filter.operator) {
                    case 'contains': return entryValue.includes(filterValue);
                    case 'equals': return entryValue === filterValue;
                    case 'starts_with': return entryValue.startsWith(filterValue);
                    case 'ends_with': return entryValue.endsWith(filterValue);
                    case 'does_not_contain': return !entryValue.includes(filterValue);
                    case 'is_not': return entryValue !== filterValue;
                    default: return true;
                }
            });
        }
        return true;
    });

    const pageSize = 10;
    const totalPages = Math.ceil(filteredEntries.length / pageSize);

    const paginatedEntries = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const toggleSelectAll = () => {
        if (selectedEntries.length === filteredEntries.length && filteredEntries.length > 0) {
            setSelectedEntries([]);
        } else {
            setSelectedEntries(filteredEntries.map(e => e.id));
        }
    };

    const toggleSelectEntry = (id) => {
        setSelectedEntries(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = () => {
        onBulkDelete(selectedEntries);
        setSelectedEntries([]);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f6f6f9] overflow-hidden font-sans relative">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-[#dcdce4] flex justify-between items-center shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-[#32324d]">{contentType.name}</h1>
                        <span className="bg-[#f0f0ff] text-[#4945ff] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Collection</span>
                    </div>
                    <p className="text-sm text-[#666687]">{filteredEntries.length} entries found</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCreate}
                        className="bg-[#4945ff] hover:bg-[#271fe0] text-white px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={14} /> Create new {contentType.name}
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-8 py-4 border-b border-[#dcdce4] flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a5a5ba]" size={16} />
                        <input
                            placeholder="Search entries..."
                            className="w-full bg-white border border-[#dcdce4] rounded-md pl-10 pr-4 py-2 text-sm focus:border-[#4945ff] outline-none transition-all text-[#32324d]"
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                        />
                    </div>
                    <button className="px-3 py-2 text-sm font-semibold border border-[#dcdce4] rounded-md transition-all flex items-center gap-2 bg-white text-[#32324d] hover:bg-[#f6f6f9]">
                        <Globe size={14} /> English (en)
                    </button>
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={cn(
                            "px-3 py-2 text-sm font-semibold border rounded-md transition-all flex items-center gap-2",
                            showFilter ? "bg-[#f0f0ff] border-[#4945ff] text-[#4945ff]" : "bg-white border-[#dcdce4] text-[#32324d] hover:bg-[#f6f6f9]"
                        )}
                    >
                        <Filter size={14} /> Filter
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    {selectedEntries.length > 0 && (
                        <div className="flex items-center gap-2 mr-4 border-r border-[#dcdce4] pr-4 animate-in fade-in slide-in-from-right duration-200">
                            <span className="text-xs font-bold text-[#666687]">{selectedEntries.length} selected</span>
                            {onBulkPublish && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button
                                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-all"
                                            title="Publish selected"
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className='z-[100000]'>
                                        <DialogHeader>
                                            <DialogTitle>Confirm Publish</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to publish {selectedEntries.length} entries?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className='flex justify-end gap-5'>
                                            <DialogClose asChild>
                                                <button className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95">
                                                    Cancel
                                                </button>
                                            </DialogClose>
                                            <button
                                                onClick={() => {
                                                    onBulkPublish(selectedEntries);
                                                    setSelectedEntries([]);
                                                }}
                                                className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95"
                                            >
                                                Publish
                                            </button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                            {onBulkUnpublish && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button
                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded transition-all"
                                            title="Unpublish selected"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className='z-[100000]'>
                                        <DialogHeader>
                                            <DialogTitle>Confirm Unpublish</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to unpublish {selectedEntries.length} entries?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className='flex justify-end gap-5'>
                                            <DialogClose asChild>
                                                <button className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95">
                                                    Cancel
                                                </button>
                                            </DialogClose>
                                            <button
                                                onClick={() => {
                                                    onBulkUnpublish(selectedEntries);
                                                    setSelectedEntries([]);
                                                }}
                                                className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95"
                                            >
                                                Unpublish
                                            </button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button
                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-all"
                                        title="Delete selected"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className='z-[100000]'>
                                    <DialogHeader>
                                        <DialogTitle>Are you sure?</DialogTitle>
                                        <DialogDescription>
                                            Delete {selectedEntries.length} entries permanently?
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className='flex justify-end gap-5'>
                                        <DialogClose asChild>
                                            <button className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95">
                                                Cancel
                                            </button>
                                        </DialogClose>
                                        <button
                                            onClick={handleBulkDelete}
                                            className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                    <button className="p-2 text-[#666687] hover:bg-[#f6f6f9] rounded transition-all">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilter && (
                <div className="px-8 py-4 bg-[#fcfcfd] border-b border-[#dcdce4] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-wrap gap-3">
                        {filters.map(filter => (
                            <div key={filter.id} className="flex items-center gap-2 bg-white border border-[#4945ff] rounded-md px-3 py-1.5 shadow-sm text-sm">
                                <span className="font-bold text-[#32324d]">{filter.field}</span>
                                <span className="text-[#4945ff] font-medium text-xs uppercase">{filter.operator.replace('_', ' ')}</span>
                                <span className="font-bold text-[#32324d]">{filter.value}</span>
                                <button
                                    onClick={() => setFilters(filters.filter(f => f.id !== filter.id))}
                                    className="ml-2 text-[#666687] hover:text-red-500"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-[#dcdce4] rounded-md px-3 py-2 shadow-sm">
                            <select
                                id="new-filter-field"
                                className="text-sm text-[#32324d] bg-transparent outline-none font-medium"
                            >
                                {contentType.fields?.map(field => (
                                    <option key={field.id} value={field.name}>{field.name}</option>
                                ))}
                            </select>
                            <div className="w-px h-4 bg-[#dcdce4]"></div>
                            <select
                                id="new-filter-operator"
                                className="text-sm text-[#32324d] bg-transparent outline-none font-medium"
                            >
                                <option value="contains">contains</option>
                                <option value="equals">is</option>
                                <option value="starts_with">starts with</option>
                                <option value="ends_with">ends with</option>
                                <option value="does_not_contain">does not contain</option>
                                <option value="is_not">is not</option>
                            </select>
                            <div className="w-px h-4 bg-[#dcdce4]"></div>
                            <input
                                id="new-filter-value"
                                placeholder="Value"
                                className="text-sm text-[#32324d] bg-transparent outline-none w-32"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const field = document.getElementById('new-filter-field').value;
                                        const operator = document.getElementById('new-filter-operator').value;
                                        const value = e.currentTarget.value;
                                        if (field && value) {
                                            setFilters([...filters, { id: Math.random().toString(), field, operator, value }]);
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}
                            />
                        </div>
                        <button
                            onClick={() => {
                                const field = document.getElementById('new-filter-field').value;
                                const operator = document.getElementById('new-filter-operator').value;
                                const valueInput = document.getElementById('new-filter-value');
                                const value = valueInput.value;
                                if (field && value) {
                                    setFilters([...filters, { id: Math.random().toString(), field, operator, value }]);
                                    valueInput.value = '';
                                }
                            }}
                            className="text-xs font-bold text-[#4945ff] hover:bg-[#f0f0ff] px-3 py-2 rounded transition-all"
                        >
                            + Add filter
                        </button>
                        {filters.length > 0 && (
                            <button
                                onClick={() => setFilters([])}
                                className="text-xs font-bold text-[#666687] hover:text-[#32324d] px-3 py-2 transition-all ml-auto"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-auto font-sans">
                <div className="bg-white rounded-xl shadow-sm border border-[#dcdce4] overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f6f6f9] border-b border-[#dcdce4]">
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-[#dcdce4] cursor-pointer"
                                        checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-4 text-[11px] font-bold text-[#666687] uppercase tracking-wider">
                                    <div className="flex items-center gap-2">ID <ArrowUpDown size={12} /></div>
                                </th>
                                <th className="p-4 text-[11px] font-bold text-[#666687] uppercase tracking-wider">
                                    <div className="flex items-center gap-2">Meta Title <ArrowUpDown size={12} /></div>
                                </th>
                                <th className="p-4 text-[11px] font-bold text-[#666687] uppercase tracking-wider">Created At</th>
                                <th className="p-4 text-[11px] font-bold text-[#666687] uppercase tracking-wider">Status</th>
                                <th className="p-4 w-32"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f6f6f9]">

                            {paginatedEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-[#666687]">
                                        <div className="flex flex-col items-center gap-3">
                                            <Database size={40} className="text-[#dcdce4]" />
                                            {filterQuery ? "No entries match your search." : "No entries found for this collection."}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedEntries.map(entry => (
                                    <tr key={entry.id} className={cn(
                                        "hover:bg-[#f0f0ff]/20 transition-colors group",
                                        selectedEntries.includes(entry.id) && "bg-[#f0f0ff]/40"
                                    )}>
                                        <td className="p-4 text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-[#dcdce4] cursor-pointer"
                                                checked={selectedEntries.includes(entry.id)}
                                                onChange={() => toggleSelectEntry(entry.id)}
                                            />
                                        </td>
                                        <td className="p-4 text-sm font-medium text-[#32324d]">
                                            {entry.id}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-[#32324d]">
                                            {String(entry.data['Meta Title'] || entry.data['Title'] || entry.data['name'] || '-')}
                                        </td>
                                        <td className="p-4 text-sm text-[#4a4a6a]">
                                            {new Date(entry.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className={cn(
                                                "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 min-w-[80px] justify-center inline-flex shadow-sm",
                                                (entry.status || 'draft') === 'published' ? "bg-green-50 text-green-700 border-green-200" :
                                                    (entry.status || 'draft') === 'scheduled' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                                        (entry.status || 'draft') === 'changed' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                            "bg-blue-50 text-blue-700 border-blue-200"
                                            )}>
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full shadow-sm shrink-0",
                                                    (entry.status || 'draft') === 'published' ? "bg-green-600" :
                                                        (entry.status || 'draft') === 'scheduled' ? "bg-indigo-600" :
                                                            (entry.status || 'draft') === 'changed' ? "bg-amber-600" :
                                                                "bg-blue-600"
                                                )}></span>
                                                <span className="truncate">{entry.status || 'draft'}</span>
                                            </span>
                                            {entry.status === 'scheduled' && entry.scheduledAt && (
                                                <div className="text-[9px] text-indigo-500 font-bold mt-1.5 flex items-center gap-1 animate-pulse">
                                                    <Clock size={10} />
                                                    {new Date(entry.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                                <button
                                                    onClick={() => setShowReleaseModalFor(entry.id)}
                                                    className="p-2 text-[#666687] hover:text-[#4945ff] hover:bg-[#f0f0ff] rounded transition-colors"
                                                    title="Add to Release"
                                                >
                                                    <Rocket size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(entry)}
                                                    className="p-2 text-[#666687] hover:text-[#4945ff] hover:bg-[#f0f0ff] rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button
                                                            className="p-2 text-[#666687] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash size={14} />
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent className='z-[100000]'>
                                                        <DialogHeader>
                                                            <DialogTitle>Are you sure?</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to delete this entry?
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className='flex justify-end gap-5'>
                                                            <DialogClose asChild>
                                                                <button className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95">
                                                                    Cancel
                                                                </button>
                                                            </DialogClose>
                                                            <button
                                                                onClick={() => onDelete(entry.id)}
                                                                className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                                <button className="p-2 text-[#666687] hover:text-[#32324d] hover:bg-[#f6f6f9] rounded transition-colors">
                                                    <MoreHorizontal size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredEntries.length > 0 && (
                    <div className="flex justify-between items-center mt-4 shrink-0 pb-4">
                        <div className="flex items-center gap-2 text-sm text-[#666687]">
                            {/* Entries per page removed */}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[#666687] mr-4">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white border border-[#dcdce4] rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f6f6f9] text-[#32324d] transition-all"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white border border-[#dcdce4] rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f6f6f9] text-[#32324d] transition-all"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add to Release Modal */}
            {showReleaseModalFor && (
                <div className="fixed inset-0 bg-[#32324d]/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#f6f6f9] flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[#32324d]">Add to Release</h3>
                            <button onClick={() => setShowReleaseModalFor(null)} className="text-[#a5a5ba] hover:text-[#32324d]">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            {releases.filter(r => r.status === 'pending').length === 0 ? (
                                <div className="text-center py-12 px-6">
                                    <div className="w-12 h-12 bg-[#f6f6f9] rounded-full flex items-center justify-center mx-auto mb-4 text-[#a5a5ba]">
                                        <Rocket size={24} />
                                    </div>
                                    <p className="text-[#32324d] font-bold mb-1">No pending releases</p>
                                    <p className="text-xs text-[#666687] mb-6">Create a new release to start grouping updates together.</p>
                                    <Link href="/releases" className="text-xs font-bold text-[#4945ff] hover:underline">Go to Releases →</Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {releases.filter(r => r.status === 'pending').map(release => (
                                        <button
                                            key={release.id}
                                            onClick={() => {
                                                onAddToRelease(release.id, showReleaseModalFor);
                                                setShowReleaseModalFor(null);
                                            }}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-[#f0f0ff] rounded-lg transition-colors border border-transparent hover:border-[#dcdce4] text-left group"
                                        >
                                            <div className="w-10 h-10 bg-[#f0f0ff] group-hover:bg-white text-[#4945ff] rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                                <Rocket size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-[#32324d] text-sm">{release.name}</p>
                                                <p className="text-[10px] text-[#a5a5ba] font-bold uppercase tracking-wider">{release.entries.length} items</p>
                                            </div>
                                            <ChevronRight size={16} className="text-[#dcdce4] group-hover:text-[#4945ff] transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

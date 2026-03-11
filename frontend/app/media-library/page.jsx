'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
    Image as ImageIcon,
    Upload,
    Search,
    Filter,
    Grid,
    List,
    MoreVertical,
    Trash2,
    X,
    File,
    Check,
    Plus,
    Star,
    Download
} from 'lucide-react';
import { useContentTypeStore } from '@/lib/store';
import { cn } from '@/lib/utils';

import { MediaSidebar } from '@/components/media-library/sidebar';

export default function MediaLibraryPage() {
    const { assets, addAsset, deleteAsset, toggleDeleted, toggleFavorite } = useContentTypeStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedAsset, setSelectedAsset] = useState(null);
    const fileInputRef = useRef(null);

    const filteredAssets = assets.filter(asset => {
        // Filter by search query
        if (!asset.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Filter by type
        if (activeFilter === 'images' && asset.type !== 'image') return false;
        if (activeFilter === 'files' && asset.type !== 'file') return false;
        if (activeFilter === 'videos') return false; // No videos yet

        // Collections filters
        if (activeFilter === 'favorites' && !asset.favorite) return false;
        if (activeFilter === 'trash' && !asset.deleted) return false;
        if (activeFilter === 'recent') {
            // Show recent assets (last 10 days)
            const tenDaysAgo = new Date();
            tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
            const assetDate = new Date(asset.createdAt);
            if (assetDate < tenDaysAgo) return false;
        }

        // Don't show deleted assets in normal views
        if (activeFilter !== 'trash' && asset.deleted) return false;

        return true;
    });

    const handleFileUpload = (files) => {
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                addAsset({
                    name: file.name,
                    url: reader.result,
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    size: file.size,
                    mime: file.type
                });
            };
            reader.readAsDataURL(file);
        });
        setIsUploadModalOpen(false);
    };

    const handleUrlUpload = () => {
        if (!urlInput) return;
        addAsset({
            name: urlInput.split('/').pop() || 'image-from-url',
            url: urlInput,
            type: 'image', // Assume image for now
            size: 0,
            mime: 'image/jpeg'
        });
        setUrlInput('');
        setIsUploadModalOpen(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="flex h-full w-full bg-[#f6f6f9]">
            <MediaSidebar onFilterChange={setActiveFilter} />
            <div className="flex-1 flex flex-col h-full overflow-hidden font-sans">
                {/* Header */}
                <div className="bg-white px-8 py-6 border-b border-[#dcdce4] flex justify-between items-center shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-[#32324d]">Media Library</h1>
                        <p className="text-sm text-[#666687]">{assets.length} assets found</p>
                    </div>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-[#4945ff] hover:bg-[#271fe0] text-white px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={16} /> Add new assets
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-8 py-4 border-b border-[#dcdce4] flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4 flex-1 max-w-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a5a5ba]" size={16} />
                            <input
                                type="text"
                                placeholder="Search for an asset..."
                                className="w-full bg-white border border-[#dcdce4] rounded-md pl-10 pr-4 py-2 text-sm outline-none focus:border-[#4945ff] transition-all text-[#32324d]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#32324d] bg-white border border-[#dcdce4] rounded-md hover:bg-[#f6f6f9] transition-all">
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <div className="flex items-center bg-[#f0f0ff] rounded-md p-1 ml-4 border border-[#dcdce4]">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-1.5 rounded transition-all",
                                viewMode === 'grid' ? "bg-white text-[#4945ff] shadow-sm" : "text-[#666687] hover:text-[#4945ff]"
                            )}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-1.5 rounded transition-all",
                                viewMode === 'list' ? "bg-white text-[#4945ff] shadow-sm" : "text-[#666687] hover:text-[#4945ff]"
                            )}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {filteredAssets.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-white border border-[#dcdce4] rounded-2xl flex items-center justify-center text-[#a5a5ba] mb-6 shadow-sm">
                                <ImageIcon size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-[#32324d]">No assets found</h3>
                            <p className="text-[#666687] mt-2 max-w-xs">
                                {searchQuery ? "Your search didn't return any results." : "Upload your first assets to start using them in your content types."}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="mt-6 text-[#4945ff] font-bold text-sm hover:underline flex items-center gap-2"
                                >
                                    <Upload size={16} /> Upload assets
                                </button>
                            )}
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                                {filteredAssets.map(asset => (
                                    <div
                                        key={asset.id}
                                        className="group relative bg-white border border-[#dcdce4] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
                                        onClick={() => setSelectedAsset(asset)}
                                    >
                                        <div className="aspect-square bg-[#f6f6f9] flex items-center justify-center overflow-hidden relative border-b border-[#f0f0f5]">
                                            {asset.type === 'image' ? (
                                                <Image src={asset.url} alt={asset.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <File size={32} className="text-[#a5a5ba]" />
                                            )}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => toggleFavorite(asset.id)}
                                                    className={cn(
                                                        "p-1.5 bg-white rounded shadow-md transition-colors border",
                                                        asset.favorite ? "text-amber-500 border-amber-100 hover:bg-amber-50" : "text-[#666687] border-[#f0f0f5] hover:bg-[#f6f6f9]"
                                                    )}
                                                    title={asset.favorite ? "Remove from favorites" : "Add to favorites"}
                                                >
                                                    <Star size={12} fill={asset.favorite ? "currentColor" : "none"} />
                                                </button>
                                                <button
                                                    onClick={() => toggleDeleted(asset.id)}
                                                    className="p-1.5 bg-white text-red-600 rounded shadow-md hover:bg-red-50 border border-red-100 transition-colors"
                                                    title="Move to trash"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-xs font-bold text-[#32324d] truncate" title={asset.name}>
                                                {asset.name}
                                            </p>
                                            <p className="text-[10px] text-[#8e8ea9] mt-1 uppercase font-bold tracking-tight">
                                                {asset.mime.split('/')[1] || asset.type} • {formatBytes(asset.size)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border border-[#dcdce4] rounded-lg overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f6f6f9] border-b border-[#dcdce4]">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-bold text-[#666687] uppercase tracking-wider">Preview</th>
                                            <th className="px-6 py-3 text-xs font-bold text-[#666687] uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-xs font-bold text-[#666687] uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-xs font-bold text-[#666687] uppercase tracking-wider">Size</th>
                                            <th className="px-6 py-3 text-xs font-bold text-[#666687] uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-xs font-bold text-[#666687] uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f0f0f5]">
                                        {filteredAssets.map(asset => (
                                            <tr
                                                key={asset.id}
                                                className="hover:bg-[#f6f6f9] transition-colors group cursor-pointer"
                                                onClick={() => setSelectedAsset(asset)}
                                            >
                                                <td className="px-6 py-3">
                                                    <div className="w-10 h-10 rounded border border-[#dcdce4] overflow-hidden bg-[#f6f6f9] flex items-center justify-center relative shrink-0">
                                                        {asset.type === 'image' ? (
                                                            <Image src={asset.url} alt={asset.name} fill unoptimized className="object-cover" />
                                                        ) : (
                                                            <File size={16} className="text-[#a5a5ba]" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <p className="text-sm font-semibold text-[#32324d]">{asset.name}</p>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="text-xs text-[#666687] bg-[#f0f0ff] px-2 py-0.5 rounded border border-[#dcdce4] font-medium uppercase">{asset.mime.split('/')[1]}</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="text-xs text-[#666687]">{formatBytes(asset.size)}</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="text-xs text-[#666687]">{new Date(asset.createdAt).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => toggleFavorite(asset.id)}
                                                            className={cn(
                                                                "p-1.5 transition-colors",
                                                                asset.favorite ? "text-amber-500" : "text-[#a5a5ba] hover:text-amber-500"
                                                            )}
                                                        >
                                                            <Star size={16} fill={asset.favorite ? "currentColor" : "none"} />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleDeleted(asset.id)}
                                                            className="p-1.5 text-[#a5a5ba] hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>

                {/* Upload Modal */}
                {isUploadModalOpen && (
                    <div className="fixed inset-0 bg-[#32324d]/60 backdrop-blur-sm flex items-center justify-center z-110 p-4 font-sans">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-[#f6f6f9] flex justify-between items-center bg-[#fcfcfd]">
                                <h3 className="text-xl font-bold text-[#32324d]">Add new assets</h3>
                                <button onClick={() => setIsUploadModalOpen(false)} className="text-[#a5a5ba] hover:text-[#32324d] p-1.5 hover:bg-[#f6f6f9] rounded-full transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8">
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer",
                                        isDragging
                                            ? "border-[#4945ff] bg-[#f0f0ff]"
                                            : "border-[#dcdce4] hover:border-[#4945ff] bg-[#f6f6f9]"
                                    )}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                    />
                                    <div className="w-16 h-16 bg-white border border-[#dcdce4] rounded-full flex items-center justify-center text-[#4945ff] mb-4 shadow-sm">
                                        <Upload size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-[#32324d] mb-1">Click to upload or drag and drop</h4>
                                    <p className="text-xs text-[#666687]">PNG, JPG, GIF up to 10MB</p>
                                </div>

                                <div className="mt-8 flex gap-4">
                                    <div className="flex-1 p-4 bg-[#f0f0ff] border border-[#dcdce4] rounded-lg">
                                        <h5 className="text-xs font-bold text-[#4945ff] uppercase tracking-widest mb-2">From URL</h5>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="https://..."
                                                className="flex-1 bg-white border border-[#dcdce4] rounded px-3 py-1.5 text-sm outline-none focus:border-[#4945ff]"
                                                value={urlInput}
                                                onChange={(e) => setUrlInput(e.target.value)}
                                            />
                                            <button
                                                onClick={handleUrlUpload}
                                                className="bg-[#4945ff] text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-[#271fe0] transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-[#f6f6f9] flex justify-end gap-3 bg-[#fcfcfd]">
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-[#32324d] hover:bg-[#f6f6f9] rounded-md border border-[#dcdce4] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95"
                                >
                                    Finish
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

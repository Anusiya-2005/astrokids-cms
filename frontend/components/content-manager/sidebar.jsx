'use client';

import React, { useState } from 'react';
import { useContentTypeStore } from '@/lib/store';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";


export function ContentManagerSidebar() {
    const {
        contentTypes,
        selectedTypeId,
        selectContentType,
        addContentType,
        updateContentType,
        deleteContentType
    } = useContentTypeStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');

    const filteredCategories = contentTypes.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            addContentType({
                name: newCategoryName.trim(),
                kind: 'collection',
                fields: [
                    { id: 'f-' + Date.now(), name: 'title', type: 'text', required: true }
                ]
            });
            setNewCategoryName('');
            setIsAddingCategory(false);
        }
    };

    const handleEditCategory = (id) => {
        const category = contentTypes.find(c => c.id === id);
        if (category) {
            setEditingCategoryId(id);
            setEditingCategoryName(category.name);
        }
    };

    const handleSaveEdit = (id) => {
        if (editingCategoryName.trim()) {
            updateContentType(id, { name: editingCategoryName.trim() });
            setEditingCategoryId(null);
            setEditingCategoryName('');
        }
    };

    const handleDeleteCategory = (id) => {
        deleteContentType(id);
    };

    return (
        <div className="w-64 bg-white border-r border-[#e3e3e3] h-full flex flex-col shadow-sm">
            <div className="p-4 py-6">
                <h2 className="text-xl font-bold text-[#32324d] mb-1">Content Manager</h2>
                <p className="text-xs text-[#666687]">Manage your entries</p>
            </div>

            <div className="px-4 py-2 flex-col flex gap-6 overflow-y-auto">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search size={14} className="text-[#a5a5ba]" />
                    </div>
                    <input
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#f6f6f9] border border-[#dcdce4] rounded-md pl-9 pr-3 py-2 text-sm text-[#32324d] focus:border-[#4945ff] focus:ring-1 focus:ring-[#4945ff] transition-all outline-none"
                    />
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between px-1 mb-3">
                            <span className="text-[11px] font-bold text-[#666687] uppercase tracking-wider">Categories</span>
                            <button
                                onClick={() => setIsAddingCategory(true)}
                                className="p-1 hover:bg-[#f6f6f9] rounded transition-colors"
                                title="Add new category"
                            >
                                <Plus size={16} className="text-[#4945ff]" />
                            </button>
                        </div>

                        {isAddingCategory && (
                            <div className="mb-3 space-y-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddCategory();
                                        }
                                    }}
                                    placeholder="Category name..."
                                    className="w-full bg-[#f6f6f9] border border-[#4945ff] rounded px-3 py-2 text-sm focus:outline-none"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddCategory}
                                        className="flex-1 px-3 py-1.5 bg-[#4945ff] text-white rounded text-xs font-semibold hover:bg-[#3d3a7f] transition-colors"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingCategory(false);
                                            setNewCategoryName('');
                                        }}
                                        className="flex-1 px-3 py-1.5 bg-[#e3e3e3] text-[#666687] rounded text-xs font-semibold hover:bg-[#d3d3d3] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <ul className="space-y-1">
                            {filteredCategories.map(category => (
                                <li key={category.id}>
                                    {editingCategoryId === category.id ? (
                                        <div className="px-3 py-2 flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={editingCategoryName}
                                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                                className="flex-1 bg-[#f6f6f9] border border-[#4945ff] rounded px-2 py-1 text-sm focus:outline-none"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSaveEdit(category.id)}
                                                className="px-2 py-1 bg-[#4945ff] text-white rounded text-xs hover:bg-[#3d3a7f] transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingCategoryId(null);
                                                    setEditingCategoryName('');
                                                }}
                                                className="px-2 py-1 bg-[#e3e3e3] text-[#666687] rounded text-xs hover:bg-[#d3d3d3] transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => selectContentType(category.id)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-md text-sm transition-all group relative cursor-pointer flex items-center justify-between gap-2",
                                                selectedTypeId === category.id
                                                    ? "bg-[#f0f0ff] text-[#4945ff] font-semibold"
                                                    : "text-[#4a4a6a] hover:bg-[#f6f6f9]"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full transition-all shrink-0",
                                                    selectedTypeId === category.id ? "bg-[#4945ff] scale-125" : "bg-[#a5a5ba] group-hover:bg-[#666687]"
                                                )} />
                                                <span className="truncate">{category.name}</span>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditCategory(category.id);
                                                    }}
                                                    className="p-1.5 hover:bg-[#e3e3e3] rounded-md transition-colors text-[#4945ff]"
                                                    title="Rename category"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-1.5 hover:bg-[#ffe3e3] rounded-md transition-colors text-[#d02c2c]"
                                                            title="Delete category"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent className='z-[100000]'>
                                                        <DialogHeader>
                                                            <DialogTitle>Are you sure?</DialogTitle>
                                                            <DialogDescription>
                                                                Remove category &quot;{category.name}&quot; and all its configuration?
                                                                This action cannot be undone.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className='flex justify-end gap-5'>
                                                            <DialogClose asChild>
                                                                <button className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95">
                                                                    Cancel
                                                                </button>
                                                            </DialogClose>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteCategory(category.id);
                                                                }}
                                                                className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>

                                            {selectedTypeId === category.id && (
                                                <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#4945ff] rounded-r-full" />
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {filteredCategories.length === 0 && !isAddingCategory && (
                            <p className="text-xs text-[#a5a5ba] px-2 py-3">No categories found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

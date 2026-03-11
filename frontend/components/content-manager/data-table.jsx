'use client';

import React, { useState } from 'react';
import { useContentTypeStore } from '@/lib/store';
import { CollectionListView } from './collection-list-view';
import { EntryEditorView } from './entry-editor-view';
import { Package } from 'lucide-react';

export function DataTable() {
    const {
        contentTypes,
        selectedTypeId,
        entries,
        deleteEntry,
        addEntry,
        updateEntry,
        addEntryToRelease,
        deleteEntries,
        bulkPublishEntries,
        bulkUnpublishEntries
    } = useContentTypeStore();

    const [isCreating, setIsCreating] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);

    // Derived selectedType
    const selectedType = contentTypes.find(t => t.id === selectedTypeId);

    // Detect if we are in a Single Type
    const isSingleType = selectedType?.kind === 'single';

    // Actions
    const handleCreate = () => {
        setIsCreating(true);
        setEditingEntry(null);
    };

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setIsCreating(false);
    };

    const handleSave = (data) => {
        const singleTypeEntry = isSingleType ? entries.find(e => e.contentTypeId === selectedTypeId) : null;

        if (editingEntry) {
            updateEntry(editingEntry.id, data);
            setEditingEntry(null);
            setIsCreating(false);
        } else if (isSingleType && singleTypeEntry) {
            updateEntry(singleTypeEntry.id, data);
        } else if (isSingleType && !singleTypeEntry && selectedType) {
            addEntry({
                contentTypeId: selectedType.id,
                data
            });
        } else if (selectedType) {
            addEntry({
                contentTypeId: selectedType.id,
                data
            });
            setIsCreating(false);
        }
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingEntry(null);
    };

    const handleDelete = (id) => {
        deleteEntry(id);
        if (editingEntry?.id === id) {
            setEditingEntry(null);
        }
    };

    const handleBulkDelete = (ids) => {
        deleteEntries(ids);
    };

    const handleAddToRelease = (releaseId, entryId) => {
        if (selectedType) {
            addEntryToRelease(releaseId, entryId, selectedType.id);
        }
    };

    if (!selectedType) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center h-full bg-[#f6f6f9] text-[#666687]">
                <div className="w-16 h-16 bg-white border border-[#dcdce4] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Package size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#32324d]">No content type selected</h3>
                <p className="max-w-xs mt-2 text-sm">Select a content type from the sidebar to manage its entries.</p>
            </div>
        );
    }

    // Single Type or Edit/Create Mode
    if (isSingleType) {
        const entry = entries.find(e => e.contentTypeId === selectedTypeId);
        return (
            <EntryEditorView
                key={`single-${selectedTypeId}`}
                contentType={selectedType}
                entry={entry || null}
                isSingleType={true}
                onSave={handleSave}
                onCancel={() => { }} // Single types don't "cancel" back to list
                onDelete={undefined} // Single types usually aren't deleted in this view, maybe cleared?
            />
        );
    }

    if (isCreating || editingEntry) {
        return (
            <EntryEditorView
                key={editingEntry ? `edit-${editingEntry.id}` : `create-${selectedType.id}`}
                contentType={selectedType}
                entry={editingEntry}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
            />
        );
    }

    // List View
    return (
        <CollectionListView
            key={`list-${selectedType.id}`}
            contentType={selectedType}
            entries={entries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
            onBulkPublish={bulkPublishEntries}
            onBulkUnpublish={bulkUnpublishEntries}
            onAddToRelease={handleAddToRelease}
            onCreate={handleCreate}
        />
    );
}

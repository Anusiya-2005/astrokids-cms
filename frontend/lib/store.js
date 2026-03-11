import { create } from 'zustand';

export const useContentTypeStore = create((set, get) => ({
    contentTypes: [],
    entries: [],
    releases: [],
    assets: [],
    selectedTypeId: null,
    visibleFieldsConfig: {},
    _hasHydrated: false,
    setHasHydrated: (state) => set({ _hasHydrated: state }),

    fetchData: async () => {
        try {
            // Trigger cron processing to ensure scheduled items are updated before fetching
            await fetch('/api/cron/process-scheduled').catch(err => console.error('Cron trigger failed:', err));

            const [typesRes, entriesRes, assetsRes, releasesRes] = await Promise.all([
                fetch('/api/content-types'),
                fetch('/api/entries'),
                fetch('/api/assets'),
                fetch('/api/releases')
            ]);

            const contentTypes = await typesRes.json();
            const entries = await entriesRes.json();
            const assetsArr = await assetsRes.json();
            const releasesArr = await releasesRes.json();

            // Check if any response returned an error
            if (contentTypes?.error || entries?.error || assetsArr?.error || releasesArr?.error) {
                console.error('Database Error:', contentTypes?.error || entries?.error || assetsArr?.error || releasesArr?.error);
                // Even on error, we mark as hydrated so the app doesn't hang on the loader
                set({ _hasHydrated: true });
                return;
            }

            // Defensive check: Ensure we have arrays before mapping
            const mappedTypes = Array.isArray(contentTypes) ? contentTypes.map(t => ({ ...t, id: t._id })) : [];
            const mappedEntries = Array.isArray(entries) ? entries.map(e => ({ ...e, id: e._id })) : [];
            const mappedAssets = Array.isArray(assetsArr) ? assetsArr.map(a => ({ ...a, id: a._id })) : [];
            const mappedReleases = Array.isArray(releasesArr) ? releasesArr.map(r => ({ ...r, id: r._id })) : [];

            set({
                contentTypes: mappedTypes,
                entries: mappedEntries,
                assets: mappedAssets,
                releases: mappedReleases,
                selectedTypeId: mappedTypes[0]?.id || null,
                _hasHydrated: true
            });
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    },

    // ASSET ACTIONS
    addAsset: async (asset) => {
        try {
            const res = await fetch('/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(asset)
            });
            const newAsset = await res.json();
            if (!newAsset || newAsset?.error) {
                console.error('Failed to add asset:', newAsset?.error || 'Unknown error');
                return;
            }
            set((state) => ({
                assets: [...state.assets, { ...newAsset, id: newAsset._id }]
            }));
        } catch (error) {
            console.error('Failed to add asset:', error);
        }
    },
    deleteAsset: async (id) => {
        try {
            await fetch(`/api/assets/${id}`, { method: 'DELETE' });
            set((state) => ({
                assets: state.assets.filter(a => a.id !== id)
            }));
        } catch (error) {
            console.error('Failed to delete asset:', error);
        }
    },
    toggleFavorite: async (id) => {
        const asset = get().assets.find(a => a.id === id);
        if (!asset) return;
        try {
            const res = await fetch(`/api/assets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorite: !asset.favorite })
            });
            const updated = await res.json();
            set((state) => ({
                assets: state.assets.map(a => a.id === id ? { ...a, ...updated, id: updated._id } : a)
            }));
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    },
    toggleDeleted: async (id) => {
        const asset = get().assets.find(a => a.id === id);
        if (!asset) return;
        try {
            const res = await fetch(`/api/assets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deleted: !asset.deleted })
            });
            const updated = await res.json();
            set((state) => ({
                assets: state.assets.map(a => a.id === id ? { ...a, ...updated, id: updated._id } : a)
            }));
        } catch (error) {
            console.error('Failed to toggle deleted:', error);
        }
    },

    // CONTENT TYPE ACTIONS
    addContentType: async (contentType) => {
        try {
            const res = await fetch('/api/content-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contentType)
            });
            const newType = await res.json();
            if (!newType || newType?.error) {
                console.error('Failed to add content type:', newType?.error || 'Unknown error');
                return;
            }
            const mappedType = { ...newType, id: newType._id };
            set((state) => ({
                contentTypes: [...state.contentTypes, mappedType],
                selectedTypeId: mappedType.id
            }));
        } catch (error) {
            console.error('Failed to add content type:', error);
        }
    },

    updateContentType: async (id, updates) => {
        try {
            const res = await fetch(`/api/content-types/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const updated = await res.json();
            if (!updated || updated?.error) {
                console.error('Failed to update content type:', updated?.error || 'Unknown error');
                return;
            }
            set((state) => ({
                contentTypes: state.contentTypes.map((t) => (t.id === id ? { ...t, ...updates, id: updated._id } : t)),
            }));
        } catch (error) {
            console.error('Failed to update content type:', error);
        }
    },

    deleteContentType: async (id) => {
        try {
            await fetch(`/api/content-types/${id}`, { method: 'DELETE' });
            set((state) => ({
                contentTypes: state.contentTypes.filter((t) => t.id !== id),
                selectedTypeId: state.selectedTypeId === id ? null : state.selectedTypeId,
            }));
        } catch (error) {
            console.error('Failed to delete content type:', error);
        }
    },

    selectContentType: (id) => set({ selectedTypeId: id }),

    addField: async (typeId, field) => {
        const type = get().contentTypes.find(t => t.id === typeId);
        if (!type) return;
        const fieldWithId = {
            id: field.id || `f-${Date.now()}`,
            ...field
        };
        const updatedFields = [...(type.fields || []), fieldWithId];
        await get().updateContentType(typeId, { fields: updatedFields });
    },

    addFieldAt: async (typeId, field, afterFieldId) => {
        const type = get().contentTypes.find(t => t.id === typeId);
        if (!type) return;
        const currentFields = type.fields || [];
        const index = currentFields.findIndex(f => f.id === afterFieldId);
        const newFields = [...currentFields];
        if (index === -1) newFields.push(field);
        else newFields.splice(index + 1, 0, field);
        await get().updateContentType(typeId, { fields: newFields });
    },

    removeField: async (typeId, fieldId) => {
        const type = get().contentTypes.find(t => t.id === typeId);
        if (!type) return;
        const updatedFields = (type.fields || []).filter(f => f.id !== fieldId);
        await get().updateContentType(typeId, { fields: updatedFields });
    },

    updateField: async (typeId, fieldId, updates) => {
        const type = get().contentTypes.find(t => t.id === typeId);
        if (!type) return;
        const updatedFields = (type.fields || []).map(f => f.id === fieldId ? { ...f, ...updates } : f);
        await get().updateContentType(typeId, { fields: updatedFields });
    },

    setVisibleFields: (contentTypeId, fieldIds) =>
        set((state) => ({
            visibleFieldsConfig: {
                ...state.visibleFieldsConfig,
                [contentTypeId]: fieldIds
            }
        })),

    // ENTRY ACTIONS
    addEntry: async (entry) => {
        try {
            const res = await fetch('/api/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentTypeId: entry.contentTypeId,
                    data: entry.data,
                    status: 'draft'
                })
            });
            const newEntry = await res.json();
            if (!newEntry || newEntry?.error) {
                console.error('Failed to add entry:', newEntry?.error || 'Unknown error');
                return;
            }
            set((state) => ({
                entries: [...state.entries, { ...newEntry, id: newEntry._id }]
            }));
        } catch (error) {
            console.error('Failed to add entry:', error);
        }
    },

    updateEntry: async (id, data, status = 'changed', scheduledAt = null) => {
        try {
            const res = await fetch(`/api/entries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data, status, scheduledAt })
            });
            const updated = await res.json();
            if (!updated || updated?.error) {
                console.error('Failed to update entry:', updated?.error || 'Unknown error');
                return;
            }
            set((state) => ({
                entries: state.entries.map(e => e.id === id ? { ...e, ...updated, id: updated._id } : e)
            }));
        } catch (error) {
            console.error('Failed to update entry:', error);
        }
    },

    deleteEntry: async (id) => {
        try {
            await fetch(`/api/entries/${id}`, { method: 'DELETE' });
            set((state) => ({
                entries: state.entries.filter(e => e.id !== id)
            }));
        } catch (error) {
            console.error('Failed to delete entry:', error);
        }
    },

    deleteEntries: async (ids) => {
        try {
            await Promise.all(ids.map(id => fetch(`/api/entries/${id}`, { method: 'DELETE' })));
            set((state) => ({
                entries: state.entries.filter(e => !ids.includes(e.id))
            }));
        } catch (error) {
            console.error('Failed to delete entries:', error);
        }
    },

    publishEntry: async (id) => {
        const entry = get().entries.find(e => e.id === id);
        if (!entry) return;
        await get().updateEntry(id, entry.data, 'published');
    },

    unpublishEntry: async (id) => {
        const entry = get().entries.find(e => e.id === id);
        if (!entry) return;
        await get().updateEntry(id, entry.data, 'draft');
    },

    bulkPublishEntries: async (ids) => {
        try {
            await Promise.all(ids.map(id => {
                const entry = get().entries.find(e => e.id === id);
                return get().updateEntry(id, entry.data, 'published');
            }));
        } catch (error) {
            console.error('Failed to bulk publish:', error);
        }
    },

    bulkUnpublishEntries: async (ids) => {
        try {
            await Promise.all(ids.map(id => {
                const entry = get().entries.find(e => e.id === id);
                return get().updateEntry(id, entry.data, 'draft');
            }));
        } catch (error) {
            console.error('Failed to bulk unpublish:', error);
        }
    },

    // RELEASE ACTIONS
    addRelease: async (release) => {
        try {
            const res = await fetch('/api/releases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...release,
                    status: 'pending',
                    entries: []
                })
            });
            const newRelease = await res.json();
            if (!newRelease || newRelease?.error) {
                console.error('Failed to add release:', newRelease?.error || 'Unknown error');
                return;
            }
            set((state) => ({
                releases: [...state.releases, { ...newRelease, id: newRelease._id }]
            }));
        } catch (error) {
            console.error('Failed to add release:', error);
        }
    },
    deleteRelease: async (id) => {
        try {
            await fetch(`/api/releases/${id}`, { method: 'DELETE' });
            set((state) => ({
                releases: state.releases.filter(r => r.id !== id)
            }));
        } catch (error) {
            console.error('Failed to delete release:', error);
        }
    },
    addEntryToRelease: async (releaseId, entryId, contentTypeId) => {
        const release = get().releases.find(r => r.id === releaseId);
        if (!release) return;

        try {
            const otherEntries = release.entries.filter(e => e.entryId !== entryId);
            const res = await fetch(`/api/releases/${releaseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entries: [...otherEntries, { entryId, contentTypeId }]
                })
            });
            const updated = await res.json();

            // Also need to update other releases to remove this entry if it was there
            const updatedReleases = await Promise.all(get().releases.map(async r => {
                if (r.id === releaseId) return { ...updated, id: updated._id };
                if (r.entries.some(e => e.entryId === entryId)) {
                    const filteredEntries = r.entries.filter(e => e.entryId !== entryId);
                    const rRes = await fetch(`/api/releases/${r.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ entries: filteredEntries })
                    });
                    const rUpdated = await rRes.json();
                    return { ...rUpdated, id: rUpdated._id };
                }
                return r;
            }));

            set({ releases: updatedReleases });
        } catch (error) {
            console.error('Failed to add entry to release:', error);
        }
    },
    publishRelease: async (id) => {
        const release = get().releases.find(r => r.id === id);
        if (!release) return;

        try {
            const entryIds = release.entries.map(e => e.entryId);
            const res = await fetch(`/api/releases/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'done' })
            });
            const updatedRelease = await res.json();

            // Bulk publish entries in this release
            await get().bulkPublishEntries(entryIds);

            set((state) => ({
                releases: state.releases.map(r => r.id === id ? { ...r, ...updatedRelease, id: updatedRelease._id } : r)
            }));
        } catch (error) {
            console.error('Failed to publish release:', error);
        }
    },
    addEntryToNewRelease: async (name, entryId, contentTypeId, scheduledAt) => {
        try {
            const res = await fetch('/api/releases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    scheduledAt,
                    status: 'pending',
                    entries: [{ entryId, contentTypeId }]
                })
            });
            const newRelease = await res.json();

            // Remove entry from other releases
            const updatedReleasesData = await Promise.all(get().releases.map(async r => {
                if (r.entries.some(e => e.entryId === entryId)) {
                    const filteredEntries = r.entries.filter(e => e.entryId !== entryId);
                    const rRes = await fetch(`/api/releases/${r.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ entries: filteredEntries })
                    });
                    const rUpdated = await rRes.json();
                    return { ...rUpdated, id: rUpdated._id };
                }
                return r;
            }));

            set({
                releases: [...updatedReleasesData, { ...newRelease, id: newRelease._id }]
            });
        } catch (error) {
            console.error('Failed to add entry to new release:', error);
        }
    },
}));

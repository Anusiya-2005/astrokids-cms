'use client';

import React, { useState } from 'react';
import { useContentTypeStore } from '@/lib/store';
import { Trash, Type, List, ToggleLeft, Calendar, Image as ImageIcon, Link, Hash, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon mapping
const iconMap = {
    text: Type,
    'rich-text': List,
    number: Hash,
    date: Calendar,
    boolean: ToggleLeft,
    media: ImageIcon,
    relation: Link,
};

export function FieldList() {
    const { contentTypes, selectedTypeId, addField, removeField } = useContentTypeStore();
    const selectedType = contentTypes.find(t => t.id === selectedTypeId);

    const [isAdding, setIsAdding] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldType, setNewFieldType] = useState('text');

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate persistence delay
        setTimeout(() => {
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        }, 500);
    };

    if (!selectedType) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f6f6f9] text-[#666687]">
                <div className="p-8 bg-white rounded-lg shadow-sm border border-[#dcdce4] flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#f0f0ff] rounded-full flex items-center justify-center text-[#4945ff]">
                        <List size={32} />
                    </div>
                    <p className="font-medium text-lg">Select a content type to edit</p>
                    <p className="text-sm">Or create a new one from the sidebar</p>
                </div>
            </div>
        );
    }

    const handleAddField = () => {
        if (!newFieldName) return;
        addField(selectedType.id, {
            name: newFieldName,
            type: newFieldType,
            required: false
        });
        setNewFieldName('');
        setIsAdding(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f6f6f9] overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-[#dcdce4] flex justify-between items-center shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-[#32324d]">{selectedType.name}</h1>
                        <span className="px-2 py-0.5 bg-[#f0f0ff] text-[#4945ff] text-[10px] font-bold uppercase rounded border border-[#4945ff]/20 tracking-wider">
                            ID: {selectedType.id}
                        </span>
                    </div>
                    <p className="text-sm text-[#666687]">{selectedType.fields.length} fields defined</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-[#4945ff] hover:bg-[#271fe0] text-white px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                    >
                        + Add another field
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-sm cursor-pointer border",
                            saveSuccess
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-white hover:bg-[#f6f6f9] text-[#32324d] border-[#dcdce4]"
                        )}
                    >
                        {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-4 pb-20">
                    {selectedType.fields.length === 0 ? (
                        <div className="text-center py-24 bg-white border-2 border-dashed border-[#dcdce4] rounded-xl flex flex-col items-center gap-4">
                            <div className="p-4 bg-[#f6f6f9] rounded-full text-[#a5a5ba]">
                                <Type size={40} />
                            </div>
                            <div>
                                <h3 className="text-[#32324d] font-bold">No fields yet</h3>
                                <p className="text-[#666687] text-sm max-w-xs mx-auto mt-1">
                                    Start by adding a field to your content type to define its structure.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="mt-2 text-[#4945ff] font-bold text-sm hover:underline cursor-pointer"
                            >
                                Add your first field
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-[#dcdce4] overflow-hidden">
                            <div className="grid grid-cols-1 divide-y divide-[#f6f6f9]">
                                {selectedType.fields.map(field => {
                                    const Icon = iconMap[field.type] || Type;
                                    return (
                                        <div key={field.id} className="group flex items-center justify-between p-4 hover:bg-[#f0f0ff]/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#f6f6f9] text-[#666687] rounded-lg flex items-center justify-center group-hover:bg-[#f0f0ff] group-hover:text-[#4945ff] transition-colors border border-[#dcdce4]">
                                                    <Icon size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#32324d] text-sm">{field.name}</p>
                                                    <p className="text-xs text-[#a5a5ba] capitalize font-medium">{field.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button className="p-2 text-[#666687] hover:text-[#4945ff] hover:bg-white rounded border border-transparent hover:border-[#dcdce4] transition-all cursor-pointer">
                                                    <Settings size={16} />
                                                </button>
                                                <button
                                                    onClick={() => removeField(selectedType.id, field.id)}
                                                    className="p-2 text-[#666687] hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition-all cursor-pointer"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Adding Field */}
            {isAdding && (
                <div className="fixed inset-0 bg-[#32324d]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#f6f6f9] flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[#32324d]">Add new field</h3>
                            <button onClick={() => setIsAdding(false)} className="text-[#a5a5ba] hover:text-[#32324d]">
                                <Trash size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-[#666687] uppercase tracking-wider mb-2">Name</label>
                                <input
                                    className="w-full border border-[#dcdce4] rounded-md px-4 py-2.5 text-sm text-[#32324d] focus:border-[#4945ff] focus:ring-1 focus:ring-[#4945ff] outline-none transition-all placeholder:text-[#a5a5ba]"
                                    value={newFieldName}
                                    onChange={e => setNewFieldName(e.target.value)}
                                    autoFocus
                                    placeholder="e.g. title, description, price"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#666687] uppercase tracking-wider mb-2">Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['text', 'rich-text', 'number', 'date', 'boolean', 'media'].map((type) => {
                                        const Icon = iconMap[type];
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => setNewFieldType(type)}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer",
                                                    newFieldType === type
                                                        ? "border-[#4945ff] bg-[#f0f0ff] text-[#4945ff] shadow-sm"
                                                        : "border-[#dcdce4] hover:bg-[#f6f6f9] text-[#4a4a6a]"
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-1.5 rounded transition-colors",
                                                    newFieldType === type ? "bg-[#4945ff] text-white" : "bg-[#f6f6f9] text-[#666687]"
                                                )}>
                                                    <Icon size={14} />
                                                </div>
                                                <span className="text-xs font-bold capitalize">{type.replace('-', ' ')}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[#f6f6f9]">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-sm font-bold text-[#32324d] hover:bg-[#f6f6f9] rounded-md border border-[#dcdce4] transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddField}
                                    className="px-6 py-2 text-sm font-bold bg-[#4945ff] text-white rounded-md hover:bg-[#271fe0] transition-colors shadow-sm cursor-pointer"
                                >
                                    Finish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

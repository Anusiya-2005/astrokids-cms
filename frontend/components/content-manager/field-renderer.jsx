import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { UploadCloud, Trash, Image as ImageIconLU } from 'lucide-react';
import { RichTextEditor } from './rich-text-editor';

export function FieldRenderer({ field, value, onChange, onAssetModalOpen, onEditorFocus }) {
    // Dynamic Field Rendering Logic
    switch (field.type) {
        case 'media':
            return (
                <div className="space-y-3">
                    {value ? (
                        <div className="relative group rounded-lg overflow-hidden border border-[#dcdce4] aspect-video max-w-sm">
                            <Image
                                src={value}
                                alt="Preview"
                                fill
                                unoptimized
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-[#32324d]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onAssetModalOpen(field.name)}
                                    className="p-2 bg-white text-[#32324d] rounded-full hover:bg-white/90"
                                >
                                    <UploadCloud size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onChange(null)}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => onAssetModalOpen(field.name)}
                            className="w-full py-12 border-2 border-dashed border-[#dcdce4] rounded-xl flex flex-col items-center justify-center gap-3 bg-[#fcfcfd] hover:bg-[#f0f0ff] hover:border-[#4945ff] transition-all cursor-pointer group"
                        >
                            <div className="p-4 bg-[#f6f6f9] text-[#a5a5ba] rounded-full group-hover:bg-[#4945ff] group-hover:text-white transition-all">
                                <ImageIconLU size={24} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-[#32324d]">Click to upload an image</p>
                                <p className="text-xs text-[#666687] mt-1">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                    )}
                </div>
            );

        case 'boolean':
            return (
                <div className="flex items-center gap-3 bg-[#f6f6f9] p-1 rounded-lg w-fit border border-[#dcdce4]">
                    <button
                        type="button"
                        onClick={() => onChange(false)}
                        className={cn(
                            "px-6 py-1.5 rounded-md text-xs font-bold uppercase transition-all",
                            value === false || !value
                                ? "bg-white text-[#4945ff] shadow-sm"
                                : "text-[#666687] hover:text-[#32324d]"
                        )}
                    >
                        False
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange(true)}
                        className={cn(
                            "px-6 py-1.5 rounded-md text-xs font-bold uppercase transition-all",
                            value === true
                                ? "bg-white text-[#4945ff] shadow-sm"
                                : "text-[#666687] hover:text-[#32324d]"
                        )}
                    >
                        True
                    </button>
                </div>
            );

        case 'rich-text':
        case 'para':
        case 'summary':
            return (
                <RichTextEditor
                    value={value || ''}
                    onChange={onChange}
                    onFocus={onEditorFocus}
                    placeholder={field.type === 'para' ? 'Enter paragraph content...' : field.type === 'summary' ? 'Enter summary content...' : 'Write something amazing...'}
                    className={field.type === 'rich-text' ? 'min-h-[250px]' : 'min-h-[150px]'}
                />
            );

        case 'cta':
            return (
                <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-[#dcdce4] shadow-sm">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#666687] uppercase">Button Text</label>
                        <input
                            type="text"
                            className="w-full border border-[#dcdce4] rounded px-3 py-2 text-[13px] outline-none focus:border-[#4945ff]"
                            placeholder="e.g. Learn More"
                            value={value?.text || ''}
                            onChange={e => onChange({ ...value, text: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#666687] uppercase">Link URL</label>
                        <input
                            type="text"
                            className="w-full border border-[#dcdce4] rounded px-3 py-2 text-[13px] outline-none focus:border-[#4945ff]"
                            placeholder="https://..."
                            value={value?.url || ''}
                            onChange={e => onChange({ ...value, url: e.target.value })}
                        />
                    </div>
                </div>
            );

        case 'faq':
            return (
                <div className="space-y-3 bg-white p-3 rounded-lg border border-[#dcdce4] shadow-sm">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#666687] uppercase">Question</label>
                        <input
                            type="text"
                            className="w-full border border-[#dcdce4] rounded px-3 py-2 text-[13px] outline-none focus:border-[#4945ff]"
                            placeholder="What is...?"
                            value={value?.question || ''}
                            onChange={e => onChange({ ...value, question: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#666687] uppercase">Answer</label>
                        <textarea
                            rows={3}
                            className="w-full border border-[#dcdce4] rounded px-3 py-2 text-[13px] outline-none focus:border-[#4945ff] resize-none"
                            placeholder="Provide the answer..."
                            value={value?.answer || ''}
                            onChange={e => onChange({ ...value, answer: e.target.value })}
                        />
                    </div>
                </div>
            );

        case 'points':
        case 'points-points':
        case 'numbered-list':
        case 'checklist':
            return (
                <div className="space-y-2">
                    <textarea
                        rows={5}
                        className="w-full border border-[#dcdce4] rounded-md px-3 py-2 text-[13px] font-mono focus:border-[#4945ff] outline-none text-[#32324d] bg-white transition-all shadow-sm"
                        placeholder={`Start each item on a new line...`}
                        value={value || ''}
                        onChange={e => onChange(e.target.value)}
                    />
                    <p className="text-[10px] text-[#666687] italic">Tip: Use one line per list item.</p>
                </div>
            );

        case 'points-points-with-image':
            return (
                <div className="space-y-3 bg-white p-3 rounded-lg border border-[#dcdce4] shadow-sm">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-bold text-[#666687] uppercase">Points Content</label>
                            <textarea
                                rows={4}
                                className="w-full border border-[#dcdce4] rounded px-3 py-2 text-[13px] font-mono outline-none focus:border-[#4945ff]"
                                placeholder="Item 1&#10;Item 2..."
                                value={value?.text || ''}
                                onChange={e => onChange({ ...value, text: e.target.value })}
                            />
                        </div>
                        <div className="w-40 space-y-2">
                            <label className="text-[10px] font-bold text-[#666687] uppercase">Section Image</label>
                            {value?.image ? (
                                <div className="relative group aspect-square rounded border border-[#dcdce4] overflow-hidden">
                                    <Image src={value.image} alt="Section detail" fill unoptimized className="object-cover" />
                                    <button
                                        onClick={() => onChange({ ...value, image: null })}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash size={14} className="text-white" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => onAssetModalOpen(field.name)}
                                    className="w-full aspect-square border-2 border-dashed border-[#dcdce4] rounded flex items-center justify-center text-[#a5a5ba] hover:border-[#4945ff] hover:text-[#4945ff]"
                                >
                                    <ImageIconLU size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );

        case 'table':
            return (
                <div className="space-y-2">
                    <textarea
                        rows={6}
                        className="w-full border border-[#dcdce4] rounded-md px-3 py-2 text-[13px] font-mono focus:border-[#4945ff] outline-none text-[#32324d] bg-white transition-all shadow-sm"
                        placeholder="| Header 1 | Header 2 |"
                        value={value || ''}
                        onChange={e => onChange(e.target.value)}
                    />
                    <p className="text-[10px] text-[#666687] italic">Tip: Use Markdown table format.</p>
                </div>
            );

        case 'title':
        case 'subtitle':
        case 'subtitle1':
            return (
                <RichTextEditor
                    value={value || ''}
                    onChange={onChange}
                    onFocus={onEditorFocus}
                    placeholder={`Enter ${field.name}...`}
                    className={cn(
                        "min-h-0 py-2",
                        field.type === 'title' && "text-2xl font-bold",
                        field.type === 'subtitle' && "text-xl font-bold",
                        field.type === 'subtitle1' && "text-lg font-bold"
                    )}
                />
            );

        default:
            return (
                <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    className="w-full border border-[#dcdce4] rounded-md px-3 py-2 text-[13px] focus:border-[#4945ff] outline-none text-[#32324d] bg-white transition-all shadow-sm"
                    placeholder={`Enter value for ${field.name}...`}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                />
            );
    }
}

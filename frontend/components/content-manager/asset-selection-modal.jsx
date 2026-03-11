import React from 'react';
import Image from 'next/image';
import { useContentTypeStore } from '@/lib/store';
import { X, ImageIcon as ImageIconLU, Check, Upload } from 'lucide-react';

export function AssetSelectionModal({ isOpen, onClose, onSelect }) {
    const { assets, addAsset } = useContentTypeStore();
    const fileInputRef = React.useRef(null);

    const handleFileUpload = (files) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const newAsset = {
                name: file.name,
                url: reader.result,
                type: file.type.startsWith('image/') ? 'image' : 'file',
                size: file.size,
                mime: file.type
            };
            addAsset(newAsset);
            onSelect(newAsset.url);
        };
        reader.readAsDataURL(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#32324d]/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-[#f6f6f9] flex justify-between items-center bg-[#fcfcfd]">
                    <h3 className="text-xl font-bold text-[#32324d]">Select Asset</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files)}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold text-[#4945ff] bg-[#f0f0ff] hover:bg-[#e0e0ff] px-3 py-1.5 rounded flex items-center gap-2 transition-all"
                        >
                            <Upload size={14} /> Upload new
                        </button>
                        <button onClick={onClose} className="text-[#a5a5ba] hover:text-[#32324d] p-1.5 hover:bg-[#f6f6f9] rounded-full transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#f6f6f9]">
                    {assets.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <div className="w-16 h-16 bg-white border border-[#dcdce4] rounded-2xl flex items-center justify-center text-[#a5a5ba] mb-6 shadow-sm">
                                <ImageIconLU size={32} />
                            </div>
                            <p className="text-[#32324d] font-bold">No assets found</p>
                            <p className="text-xs text-[#666687] mt-2 mb-6">Upload an asset to the Media Library first or use a mock.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-[#4945ff] font-bold text-sm hover:underline flex items-center gap-2"
                                >
                                    <Upload size={16} /> Upload from device
                                </button>
                                <button
                                    onClick={() => onSelect(`https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=600&h=600&fit=crop`)}
                                    className="text-[#4945ff] font-bold text-sm hover:underline flex items-center gap-2"
                                >
                                    <Check size={16} /> Use a mock image
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                            {assets.map(asset => (
                                <div
                                    key={asset.id}
                                    onClick={() => onSelect(asset.url)}
                                    className="group relative bg-white border border-[#dcdce4] rounded-lg overflow-hidden shadow-sm hover:border-[#4945ff] hover:shadow-md transition-all cursor-pointer aspect-square"
                                >
                                    <Image src={asset.url} alt={asset.name} fill unoptimized className="object-cover" />
                                    <div className="absolute inset-0 bg-[#4945ff]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[#f6f6f9] flex justify-end gap-3 bg-[#fcfcfd]">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-[#32324d] hover:bg-[#f6f6f9] rounded-md border border-[#dcdce4] transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

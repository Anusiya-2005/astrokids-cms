'use client';

import React, { useState } from 'react';
import {
    User,
    Lock,
    Globe,
    Bell,
    Database,
    Shield,
    Cpu,
    Code,
    Mail,
    Check,
    RefreshCw,
    Languages,
    Key,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
    {
        id: 'admin',
        name: 'Administration Panel',
        items: [
            { id: 'roles', name: 'Roles & Permissions', icon: Shield },
            { id: 'users', name: 'Users', icon: Users },
            { id: 'webhooks', name: 'Webhooks', icon: Code },
            { id: 'tokens', name: 'API Tokens', icon: Key },
        ]
    },
    {
        id: 'global',
        name: 'Global Settings',
        items: [
            { id: 'general', name: 'General', icon: Database },
            { id: 'i18n', name: 'Internationalization', icon: Languages },
            { id: 'email', name: 'Email Settings', icon: Mail },
        ]
    }
];

export default function SettingsPage() {
    const [selectedItem, setSelectedItem] = useState('general');

    return (
        <div className="flex-1 bg-[#f6f6f9] flex h-full overflow-hidden font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-[#dcdce4] flex flex-col h-full shrink-0 shadow-sm">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-[#32324d]">Settings</h2>
                </div>
                <div className="flex-1 overflow-y-auto px-3 space-y-6 pb-6">
                    {categories.map((cat) => (
                        <div key={cat.id}>
                            <h3 className="px-3 text-[10px] font-bold text-[#a5a5ba] uppercase tracking-widest mb-3">{cat.name}</h3>
                            <div className="space-y-1">
                                {cat.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedItem(item.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all group",
                                            selectedItem === item.id
                                                ? "bg-[#f0f0ff] text-[#4945ff] font-bold"
                                                : "text-[#4a4a6a] hover:bg-[#f6f6f9]"
                                        )}
                                    >
                                        <item.icon size={16} className={cn(selectedItem === item.id ? "text-[#4945ff]" : "text-[#666687] group-hover:text-[#4945ff]")} />
                                        <span>{item.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="bg-white px-8 py-6 border-b border-[#dcdce4] flex justify-between items-center shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-[#32324d] capitalize">{selectedItem.replace('-', ' ')}</h1>
                        <p className="text-sm text-[#666687]">Configure your application {selectedItem} settings.</p>
                    </div>
                    <button className="bg-[#4945ff] hover:bg-[#271fe0] text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95">
                        Save changes
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl bg-white rounded-xl border border-[#dcdce4] shadow-sm p-8">
                        <section className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#666687] uppercase tracking-wider">Server Environment</label>
                                    <input
                                        type="text"
                                        disabled
                                        value="Production"
                                        className="w-full bg-[#f6f6f9] border border-[#dcdce4] rounded-md px-4 py-2.5 text-sm text-[#32324d] opacity-70"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#666687] uppercase tracking-wider">AstroKids Version</label>
                                    <input
                                        type="text"
                                        disabled
                                        value="v1.4.2"
                                        className="w-full bg-[#f6f6f9] border border-[#dcdce4] rounded-md px-4 py-2.5 text-sm text-[#32324d] opacity-70"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#666687] uppercase tracking-wider">Admin Language</label>
                                    <select className="w-full bg-white border border-[#dcdce4] rounded-md px-4 py-2.5 text-sm text-[#32324d] outline-none focus:border-[#4945ff]">
                                        <option>English (en)</option>
                                        <option>French (fr)</option>
                                        <option>Spanish (es)</option>
                                        <option>German (de)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#666687] uppercase tracking-wider">Default Locale</label>
                                    <select className="w-full bg-white border border-[#dcdce4] rounded-md px-4 py-2.5 text-sm text-[#32324d] outline-none focus:border-[#4945ff]">
                                        <option>en-US</option>
                                        <option>fr-FR</option>
                                        <option>es-ES</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-[#f0f0f5]">
                                <h3 className="font-bold text-[#32324d] mb-4">Security Settings</h3>
                                <div className="flex items-center justify-between p-4 bg-[#f0f0ff]/30 rounded-lg border border-[#f0f0ff]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white rounded shadow-sm">
                                            <Lock size={20} className="text-[#4945ff]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#32324d]">Force HTTPS</p>
                                            <p className="text-xs text-[#a5a5ba]">Redirect all HTTP traffic to HTTPS</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-[#4945ff] focus:outline-none">
                                        <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-[#f0f0f5]">
                                <h3 className="font-bold text-[#32324d] mb-4">API Configuration</h3>
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-4">
                                    <Bell size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-800 leading-relaxed">
                                        Changing API configurations might require a server restart. Please make sure to save your data before proceeding.
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

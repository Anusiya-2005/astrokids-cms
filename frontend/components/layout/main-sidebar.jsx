'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Database, Palette, Settings, Image as ImageIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Content Manager', icon: Database, href: '/content-manager' },
    { name: 'Preview', icon: LayoutGrid, href: '/content-type-builder' },
    { name: 'Media Library', icon: ImageIcon, href: '/media-library' },
];

export function MainSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-16 h-screen bg-[#212134] text-white flex flex-col items-center py-4 border-r border-[#32324d] z-50">
            <div className="mb-8 p-2 bg-[#4945ff] rounded-lg">
                <Database size={24} className="text-white" />
            </div>

            <nav className="flex-1 flex flex-col items-center gap-4 w-full px-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "p-3 rounded-lg transition-all duration-200 group relative",
                                isActive ? "bg-[#4945ff] text-white shadow-lg" : "text-[#a5a5ba] hover:bg-[#32324d] hover:text-white"
                            )}
                            title={item.name}
                        >
                            <item.icon size={20} />
                            <div className="absolute left-16 bg-[#212134] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#32324d] shadow-xl">
                                {item.name}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto flex flex-col items-center gap-4 w-full px-2">
                <button className="p-3 rounded-lg text-[#a5a5ba] hover:bg-[#32324d] hover:text-white transition-all">
                    <Settings size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4945ff] to-[#7b79ff] flex items-center justify-center text-[10px] font-bold">
                    AD
                </div>
            </div>
        </div>
    );
}

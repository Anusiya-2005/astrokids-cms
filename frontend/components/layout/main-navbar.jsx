'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Database, Image as ImageIcon, Search, Bell, Settings, Rocket, Home, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Content Manager', icon: Database, href: '/content-manager' },
    { name: 'Preview', icon: LayoutGrid, href: '/content-type-builder' },
    { name: 'Releases', icon: Rocket, href: '/releases' },
    { name: 'Media Library', icon: ImageIcon, href: '/media-library' },
];

export function MainNavbar() {
    const pathname = usePathname();

    return (
        <header className="h-16 w-full bg-[#212134] text-white flex items-center px-6 border-b border-[#32324d] z-[100] shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-3 mr-12">
                <div className="p-1.5 bg-[#4945ff] rounded-md shadow-lg shadow-[#4945ff]/20">
                    <Database size={20} className="text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight hidden md:block">AstroKids CMS</span>
            </div>

            {/* Main Navigation */}
            <nav className="flex items-center gap-1 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2.5 whitespace-nowrap text-sm font-medium",
                                isActive
                                    ? "bg-[#4945ff] text-white shadow-md"
                                    : "text-[#a5a5ba] hover:bg-[#32324d] hover:text-white"
                            )}
                        >
                            <item.icon size={18} className={cn(isActive ? "text-white" : "text-[#a5a5ba]")} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3 ml-6 border-l border-[#32324d] pl-6">
                <button className="p-2 rounded-full text-[#a5a5ba] hover:bg-[#32324d] hover:text-white transition-all">
                    <Search size={18} />
                </button>
                <button className="p-2 rounded-full text-[#a5a5ba] hover:bg-[#32324d] hover:text-white transition-all relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#212134]"></span>
                </button>
                <Link href="/settings" className="p-2 rounded-full text-[#a5a5ba] hover:bg-[#32324d] hover:text-white transition-all mr-2">
                    <Settings size={18} />
                </Link>

                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4945ff] to-[#7b79ff] flex items-center justify-center text-[10px] font-bold shadow-md ring-2 ring-transparent group-hover:ring-[#4945ff]/50 transition-all">
                        AD
                    </div>
                </div>
            </div>
        </header>
    );
}

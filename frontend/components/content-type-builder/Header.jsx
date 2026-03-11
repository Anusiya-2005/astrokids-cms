"use client";
import React from 'react';

const Header = () => {
    return (
        <header className="w-full bg-white border-b border-[#e5e7eb] py-4 px-6 flex justify-between items-center">
            <div className="text-2xl font-bold text-[#2DB787]">Blog<span className="text-black">CMS</span></div>
            <nav className="hidden md:flex gap-6">
                {["Home", "Blog", "Resources", "Contact"].map(item => (
                    <a key={item} href="#" className="text-[#6F6C90] hover:text-[#2DB787] font-medium transition-colors">{item}</a>
                ))}
            </nav>
            <button className="bg-[#2DB787] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#25916b] transition-colors shadow-sm">
                Subscribe
            </button>
        </header>
    );
};

export default Header;

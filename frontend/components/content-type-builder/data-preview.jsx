"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useContentTypeStore } from '@/lib/store';
import { Layout, ChevronLeft, ArrowRight, Monitor, Eye, Image as ImageIcon, Maximize, X, Check, BarChart3, AlertTriangle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- BLOG RENDERER COMPONENT (User Logic) ---
const BlogFormatContent = ({ content, className }) => {
    const getImageUrl = (img) => {
        if (!img) return "";
        if (img.startsWith('http') || img.startsWith('data:image')) return img;
        return `https://drive.usercontent.google.com/download?id=${img.trim()}`;
    };

    const formatParagraphContent = (text, index) => {
        if (!text || typeof text !== 'string') return null;

        // Detect if the text contains HTML tags
        const hasHtml = /<[a-z][\s\S]*>/i.test(text);

        if (hasHtml) {
            return (
                <div
                    key={index}
                    className="text-[#6F6C90] text-[16px] md:text-[18px] leading-relaxed mb-6 prose-preview"
                    dangerouslySetInnerHTML={{ __html: text.replace("<a herf=", "<a href=") }}
                />
            );
        }

        let processedText = text.replace("<a herf=", "<a href=");
        // Simple manual parsing for non-HTML strings that might have used <b> or <a> tags manually
        let link = processedText.match(/<a href="([^"]+)">([^<]+)<\/a>/);
        let bold = processedText.match(/<b>(.*?)<\/b>/);

        if (link) {
            return (
                <p key={index} className="text-[#6F6C90] text-[16px] md:text-[18px] leading-relaxed mb-4">
                    {processedText.split(link[0])[0]}
                    <Link href={link[1]} className="text-[#2DB787] hover:underline">
                        {link[2]}
                    </Link>
                    {processedText.split(link[0])[1]}
                </p>
            );
        } else if (bold) {
            return (
                <p key={index} className="text-[#6F6C90] text-[16px] md:text-[18px] leading-relaxed mb-4">
                    {processedText.split(bold[0])[0]}
                    <strong className="font-bold">{bold[1]}</strong>
                    {processedText.split(bold[0])[1]}
                </p>
            );
        } else {
            return (
                <p key={index} className="text-[#6F6C90] text-[16px] md:text-[18px] leading-relaxed mb-4">
                    {processedText}
                </p>
            );
        }
    };

    return (
        <div className={cn("w-full bg-white", className)}>
            <div className="px-5 mt-12 max-w-7xl mx-auto pb-20">
                <div className="w-full md:px-10">
                    {(content || []).map((block, index) => {
                        switch (block.type) {
                            case "title":
                                return (
                                    <h1 key={index} className="text-3xl md:text-4xl font-bold text-[#02030B] mb-6 leading-[1.2] text-center capitalize">
                                        <span className="text-[#2DB787]">{block.content?.split(" ")[0]}</span>{" "}
                                        {block.content?.split(" ").slice(1).join(" ")}
                                    </h1>
                                );
                            case "subtitle":
                                return <h2 key={index} className="text-2xl font-semibold text-[#2DB787] mt-8 mb-4 leading-[1.2] italic">{block.content}</h2>;
                            case "subtitle1":
                                return <h2 key={index} className="text-xl font-semibold mt-8 mb-4 leading-[1.2]">{block.content}</h2>;
                            case "para":
                                return formatParagraphContent(block.content, index);
                            case "cta":
                                return (
                                    <div className="bg-[#2DB787] w-[90%] rounded-xl mx-auto p-2 md:p-4" key={index}>
                                        <p className="text-white text-center mt-2 text-[16px] md:text-[18px]">{block?.content}</p>
                                        <p className="text-white text-center mt-2 text-[16px] md:text-[18px]">
                                            <Link href={block?.link || '#'}>
                                                <div className="text-white font-bold text-center underline cursor-pointer">{block?.buttonText}</div>
                                            </Link>{" "}
                                            - {block?.content2}
                                        </p>
                                    </div>
                                );
                            case "image":
                                return (
                                    <div key={index} className="my-6">
                                        <div className="w-[80%] mx-auto aspect-video relative rounded-xl overflow-hidden bg-gray-50">
                                            <Image
                                                src={getImageUrl(block.image)}
                                                alt={block.content || 'image'}
                                                fill
                                                className="object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        </div>
                                        <p className="text-xl text-[#2DB787] mt-2 italic text-center">{block?.content}</p>
                                    </div>
                                );
                            case "numbered-list":
                                return (
                                    <ol key={index} className="pl-6 mb-6 space-y-4 text-[#6F6C90] list-decimal">
                                        {(block.items || []).map((item, i) => (
                                            <li key={i} className="text-[16px] md:text-[18px]"><span className="text-black">{item}</span></li>
                                        ))}
                                    </ol>
                                );
                            case "summary":
                                return (
                                    <div key={index} className="my-8 p-6 md:p-8 bg-[#F8F9FA] border-l-8 border-[#2DB787] rounded-r-2xl shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-[#2DB787]/10 flex items-center justify-center text-[#2DB787]">
                                                <Check size={20} />
                                            </div>
                                            <h3 className="text-xl font-bold text-[#02030B]">Key Highlights</h3>
                                        </div>
                                        <div
                                            className="text-[#6F6C90] text-[16px] md:text-[18px] leading-relaxed prose-preview"
                                            dangerouslySetInnerHTML={{ __html: block.content }}
                                        />
                                    </div>
                                );
                            case "faq":
                                return (
                                    <div key={index} className="my-6">
                                        <h3 className="text-xl font-semibold text-[#2DB787] mb-4">Frequently Asked Questions</h3>
                                        <ul className="space-y-4 text-[#6F6C90]">
                                            {(block.items || []).map((item, i) => (
                                                <li key={i} className="text-[16px] md:text-[18px]">
                                                    <span className="font-semibold text-[#02030B]">{item.question}</span>
                                                    <p className="mt-1">{item.answer}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            case "meta-description":
                                return (
                                    <div key={index} className="max-w-4xl mx-auto mb-12 -mt-4 px-4">
                                        <p className="text-lg md:text-xl text-[#6F6C90] text-center italic leading-relaxed font-medium">
                                            {block.content}
                                        </p>
                                        <div className="w-24 h-1 bg-[#2DB787]/30 mx-auto mt-6 rounded-full"></div>
                                    </div>
                                );
                            case "checklist":
                                return (
                                    <ul key={index} className="pl-6 mb-6 space-y-4 text-[#6F6C90] list-none">
                                        {(block.items || []).map((item, i) => (
                                            <li key={i} className="flex items-start text-[16px] md:text-[18px]"><span className="text-[#2DB787] mr-2">✔</span>{item}</li>
                                        ))}
                                    </ul>
                                );
                            case "highlight-list":
                                return (
                                    <div key={index} className="my-6">
                                        {(block.items || []).map((item, i) => (
                                            <div key={i} className="mb-4">
                                                <h4 className="text-lg font-semibold">{item.title}</h4>
                                                <p className="text-[#6F6C90] text-[16px] md:text-[18px] mt-1">{item.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            case "points":
                                return (
                                    <ul key={index} className="pl-6 mb-6 space-y-4 text-[#6F6C90]">
                                        {(block.points || []).map((point, i) => (
                                            <li key={i} className="text-[16px] md:text-[18px]">
                                                <span className="font-semibold text-[#2DB787]">{point.title}:</span>{" "}
                                                {point.content}
                                            </li>
                                        ))}
                                    </ul>
                                );
                            case "points-points":
                                return (
                                    <div key={index} className="my-8">
                                        {(block.content || []).map((item, idx) => (
                                            <div key={idx} className="mb-6 relative">
                                                <h3 className="text-xl font-semibold text-[#02030B] mb-2 leading-[1.2]">{item.title}</h3>
                                                <p className="text-[#6F6C90] indent-10 text-justify leading-relaxed mb-3 text-[16px] md:text-[18px]">{item.content}</p>
                                                <h4 className="text-lg font-medium text-[#2DB787] mt-4 mb-2 italic">{item.subtitle}</h4>
                                                <ul className="list-disc pl-6 space-y-2 text-[#6F6C90]">
                                                    {(item.points || []).map((point, i) => (
                                                        <li key={i} className="text-[16px] md:text-[18px]">{point}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                );
                            case "points-points-with-image":
                                return (
                                    <div key={index} className="my-8">
                                        {(block.content || []).map((item, idx) => (
                                            <div key={idx} className="mb-6 relative">
                                                <h3 className="text-xl font-semibold text-[#02030B] mb-2 leading-[1.2]">{item.title}</h3>
                                                {item.image !== "none" && (
                                                    <div className="w-[60%] mx-auto mt-2 aspect-video relative mb-4 rounded-xl overflow-hidden shadow-md">
                                                        <Image
                                                            src={getImageUrl(item.image)}
                                                            alt={item.title || 'image'}
                                                            fill
                                                            className="object-cover transition-transform duration-300 hover:scale-105"
                                                        />
                                                    </div>
                                                )}
                                                <p className="text-[#6F6C90] indent-10 text-justify leading-relaxed mb-3 text-[16px] md:text-[18px]">{item.content}</p>
                                                <h4 className="text-lg font-medium text-[#2DB787] mt-4 mb-2 italic">{item.subtitle}</h4>
                                                <ul className="list-disc pl-6 space-y-2 text-[#6F6C90]">
                                                    {(item.points || []).map((point, i) => (
                                                        <li key={i}><p className="text-[16px] md:text-[18px] leading-relaxed">{point}</p></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                );
                            case "table":
                                return (
                                    <div key={index} className="my-8 overflow-x-auto">
                                        <table className="w-full border-collapse border border-[#2DB787] shadow-md">
                                            <thead>
                                                <tr className="bg-[#F7F7F7]">
                                                    {(block.headers || []).map((header, i) => (
                                                        <th key={i} className="border border-[#2DB787] p-3 text-[#02030B] font-semibold text-[16px] md:text-[18px]">{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(block.rows || []).map((row, rowIndex) => (
                                                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#F7F7F7]"}>
                                                        {(row || []).map((cell, cellIndex) => (
                                                            <td key={cellIndex} className="border border-[#2DB787] p-3 text-[#6F6C90] text-[16px] md:text-[18px]">{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            default:
                                if (typeof block === 'string') return formatParagraphContent(block, index);
                                return null;
                        }
                    })}
                </div>
            </div>
        </div>
    );
};

// --- GET PREVIEW CONTENT HELPER ---
export const getPreviewContent = (entry, selectedType) => {
    if (!entry || !entry.data || !selectedType) return [];

    const blocks = [];
    const technicalExclude = ["Meta Title", "Meta Description", "Slug"];
    const processedFields = new Set();

    // Pass 1: Process based on defined Field Order (Preserves intended layout)
    selectedType.fields.forEach(field => {
        const name = field.name;
        const value = entry.data[name];

        if (technicalExclude.includes(name)) return;
        processedFields.add(name);

        // Skip truly empty or missing values
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
            return;
        }

        addBlockFromField(blocks, field, value);
    });

    // Pass 2: Safety Catch-All (Finds any fields that exist in data but not in type definition)
    Object.entries(entry.data).forEach(([key, value]) => {
        if (processedFields.has(key) || technicalExclude.includes(key)) return;

        // Skip empty values
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
            return;
        }

        // Try to guess a block type based on the key or just use fallback
        const guessedType = key.toLowerCase().includes('image') ? 'image' : 'para';
        addBlockFromField(blocks, { name: key, type: guessedType }, value);
    });

    // Pass 4: Position Meta Description specifically after the first image (User Request)
    const metaDescriptionValue = entry.data["Meta Description"];
    const hasMetaDescBlock = blocks.some(b => b.type === 'meta-description');

    if (metaDescriptionValue && !hasMetaDescBlock && String(metaDescriptionValue).trim() !== '') {
        const firstImgIdx = blocks.findIndex(b => b.type === 'image');
        const metaBlock = { type: 'meta-description', content: String(metaDescriptionValue) };

        if (firstImgIdx !== -1) {
            // Insert right after the first image found
            blocks.splice(firstImgIdx + 1, 0, metaBlock);
        } else {
            // Fallback: If no image, put it after the primary title
            const firstTitleIdx = blocks.findIndex(b => b.type === 'title');
            blocks.splice(firstTitleIdx !== -1 ? firstTitleIdx + 1 : 0, 0, metaBlock);
        }
    }

    // Pass 5: Ensure only one main title (H1) is present
    let titleShown = false;
    return blocks.filter(block => {
        if (block.type === 'title') {
            if (titleShown) return false;
            titleShown = true;
        }
        return true;
    });
};

// Helper function to map data to block format
function addBlockFromField(blocks, field, value) {
    const nameLower = field.name.toLowerCase();
    const type = field.type;

    // 1. Array of blocks (Advanced Editor Data)
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0].type) {
        value.forEach(b => blocks.push(b));
        return;
    }

    // 2. Map standard Types with robust String -> Array parsing
    switch (type) {
        case 'title':
        case 'heading':
            blocks.push({ type: 'title', content: String(value) });
            break;
        case 'subtitle':
            blocks.push({ type: 'subtitle', content: String(value) });
            break;
        case 'subtitle1':
            blocks.push({ type: 'subtitle1', content: String(value) });
            break;
        case 'media':
        case 'image':
            blocks.push({
                type: 'image',
                image: value,
                content: (nameLower === 'image' || nameLower === 'cover' || nameLower === 'meta title') ? '' : field.name
            });
            break;
        case 'para':
        case 'text':
        case 'textarea':
        case 'rich-text':
        case 'email':
            if (nameLower === 'title' || nameLower === 'meta title') {
                blocks.push({ type: 'title', content: String(value) });
            } else if (typeof value === 'string' && (value.includes('<') || value.includes('<b>') || value.includes('<a>'))) {
                // Keep HTML as is for formatParagraphContent to handle dangerouslySetInnerHTML
                blocks.push({ type: 'para', content: value });
            } else if (typeof value === 'string') {
                // Split by double newline for spacing
                value.split('\n\n').forEach(p => { if (p.trim()) blocks.push({ type: 'para', content: p }); });
            } else {
                blocks.push({ type: 'para', content: String(value) });
            }
            break;
        case 'cta':
            blocks.push({
                type: 'cta',
                content: value.content || value.text || '',
                buttonText: value.buttonText || value.text || 'Learn More',
                link: value.link || value.url || '#',
                content2: value.content2 || ''
            });
            break;
        case 'points': {
            // Parse newline separated "Title: Content" or just "Content"
            const lines = typeof value === 'string' ? value.split('\n').filter(l => l.trim()) : [];
            const parsedPoints = lines.map(line => {
                const parts = line.split(':');
                if (parts.length > 1) {
                    return { title: parts[0].trim(), content: parts.slice(1).join(':').trim() };
                }
                return { title: '', content: line.trim() };
            });
            blocks.push({ type: 'points', points: parsedPoints });
            break;
        }
        case 'points-points': {
            if (typeof value === 'string') {
                const lines = value.split('\n').filter(l => l.trim());
                blocks.push({
                    type: 'points-points',
                    content: [{ title: field.name, content: '', subtitle: '', points: lines }]
                });
            } else if (Array.isArray(value)) {
                blocks.push({ type: 'points-points', content: value });
            }
            break;
        }
        case 'points-points-with-image': {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const lines = (value.text || '').split('\n').filter(l => l.trim());
                blocks.push({
                    type: 'points-points-with-image',
                    content: [{
                        title: field.name,
                        content: '',
                        subtitle: '',
                        image: value.image || 'none',
                        points: lines
                    }]
                });
            } else if (Array.isArray(value)) {
                blocks.push({ type: 'points-points-with-image', content: value });
            }
            break;
        }
        case 'numbered-list':
        case 'checklist': {
            const lines = typeof value === 'string' ? value.split('\n').filter(l => l.trim()) : [];
            blocks.push({ type: type, items: lines });
            break;
        }
        case 'faq':
            // field-renderer saves as a single object {question, answer}
            if (value && (value.question || value.answer)) {
                blocks.push({ type: 'faq', items: [{ question: value.question || '', answer: value.answer || '' }] });
            } else if (Array.isArray(value)) {
                blocks.push({ type: 'faq', items: value });
            }
            break;
        case 'table': {
            // Parse Markdown Table from textarea
            if (typeof value === 'string' && value.includes('|')) {
                const lines = value.split('\n').filter(l => l.trim() && !l.includes('---'));
                if (lines.length > 0) {
                    const headers = lines[0].split('|').filter(s => s.trim()).map(s => s.trim());
                    const rows = lines.slice(1).map(line =>
                        line.split('|').filter(s => s.trim()).map(s => s.trim())
                    );
                    blocks.push({ type: 'table', headers, rows });
                }
            } else if (value && typeof value === 'object') {
                blocks.push({ type: 'table', headers: value.headers || [], rows: value.rows || [] });
            }
            break;
        }
        case 'summary':
            blocks.push({ type: 'summary', content: String(value) });
            break;
        default:
            if (typeof value !== 'object') {
                blocks.push({ type: 'para', content: String(value) });
            }
    }
}


// --- MAIN WRAPPER COMPONENT ---
export function DataPreview() {
    const { contentTypes, selectedTypeId, entries } = useContentTypeStore();
    const [selectedEntryId, setSelectedEntryId] = useState(null);
    const [viewMode, setViewMode] = useState('desktop');

    const selectedType = contentTypes.find(t => t.id === selectedTypeId);
    const typeEntries = entries.filter(e => e.contentTypeId === selectedTypeId);
    const selectedEntry = typeEntries.find(e => e.id === selectedEntryId);

    const [prevTypeId, setPrevTypeId] = useState(selectedTypeId);

    if (prevTypeId !== selectedTypeId) {
        setPrevTypeId(selectedTypeId);
        setSelectedEntryId(null);
        setViewMode('desktop');
    }

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && viewMode === 'fullscreen') {
                setViewMode('desktop');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewMode]);

    if (!selectedType) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f6f6f9] text-[#666687]">
                <div className="p-8 bg-white rounded-lg shadow-sm border border-[#dcdce4] flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#f0f0ff] rounded-full flex items-center justify-center text-[#4945ff]">
                        <Eye size={32} />
                    </div>
                    <p className="font-medium text-lg text-[#32324d]">Select content to preview</p>
                </div>
            </div>
        );
    }

    if (!selectedEntryId) {
        return (
            <div className="flex-1 flex flex-col h-full bg-[#f6f6f9] font-sans">
                <div className="bg-white px-8 py-6 border-b border-[#dcdce4] flex justify-between items-center shadow-sm z-10 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-[#32324d]">{selectedType.name}</h1>
                        <p className="text-sm text-[#666687]">{typeEntries.length} entries found</p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    {typeEntries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-[#a5a5ba] border-2 border-dashed border-[#dcdce4] rounded-xl bg-white">
                            <Layout size={48} className="mb-4 opacity-50" />
                            <p>No content created yet for {selectedType.name}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {typeEntries.map(entry => {
                                const titleField = selectedType.fields.find(f => ['title', 'name', 'heading'].includes(f.name?.toLowerCase()));
                                const title = titleField ? String(entry.data[titleField.name] || 'Untitled') : `Entry ${entry.id}`;
                                const coverField = selectedType.fields.find(f => f.type === 'media' || ['cover', 'image'].includes(f.name?.toLowerCase()));
                                const cover = coverField ? entry.data[coverField.name] : null;

                                return (
                                    <button
                                        key={entry.id}
                                        onClick={() => setSelectedEntryId(entry.id)}
                                        className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#dcdce4] overflow-hidden group text-left flex flex-col h-[280px]"
                                    >
                                        <div className="h-40 bg-[#f0f0ff] w-full relative overflow-hidden">
                                            {cover ? (
                                                <Image src={cover} alt={title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#dcdce4]">
                                                    <ImageIcon size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-bold text-[#32324d] text-lg mb-2 line-clamp-2 group-hover:text-[#4945ff] transition-colors">{title}</h3>
                                            <div className="mt-auto flex items-center justify-between text-xs text-[#a5a5ba]">
                                                <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1 text-[#4945ff] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Details <ArrowRight size={12} />
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex-col font-sans transition-all duration-300",
            viewMode === 'fullscreen' ? "fixed inset-0 z-[100] bg-white h-screen w-screen overflow-hidden" : "flex-1 flex h-full bg-[#f0f0f4] overflow-hidden"
        )}>
            {/* Toolbar */}
            {viewMode !== 'fullscreen' && (
                <div className="bg-white px-4 py-3 border-b border-[#dcdce4] flex justify-between items-center shrink-0 shadow-sm z-10 transition-all">
                    <button
                        onClick={() => setSelectedEntryId(null)}
                        className="flex items-center gap-2 text-xs font-bold text-[#666687] hover:text-[#4945ff] hover:bg-[#f0f0ff] px-3 py-1.5 rounded transition-all"
                    >
                        <ChevronLeft size={14} /> Back to list
                    </button>
                    <div className="flex items-center gap-2 bg-[#f6f6f9] p-1 rounded-lg border border-[#dcdce4]">
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={cn("p-1.5 rounded-md transition-all", viewMode === 'desktop' ? "bg-white text-[#4945ff] shadow-sm" : "text-[#a5a5ba] hover:text-[#32324d]")}
                            title="Desktop View"
                        >
                            <Monitor size={16} />
                        </button>
                        <Link
                            href={`/preview/${selectedTypeId}/${selectedEntryId}`}
                            target="_blank"
                            className="p-1.5 rounded-md transition-all text-[#a5a5ba] hover:text-[#32324d] hover:bg-white/50"
                            title="Open in new page"
                        >
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="w-20" />
                </div>
            )}

            {/* EXIT Fullscreen Button */}
            {viewMode === 'fullscreen' && (
                <button
                    onClick={() => setViewMode('desktop')}
                    className="fixed top-4 right-4 z-[110] p-2 bg-black/10 hover:bg-black/20 text-black/60 rounded-full backdrop-blur-sm transition-all shadow-sm group"
                >
                    <X size={24} className="group-hover:scale-110 transition-transform" />
                </button>
            )}

            {/* Content Rendering Zone */}
            <div className={cn(
                "flex-1 w-full overflow-hidden flex flex-col items-center",
                viewMode === 'fullscreen' ? "bg-white" : "p-8 bg-[#e3e3e8]"
            )}>
                <div className={cn(
                    "bg-white transition-all duration-500 flex flex-col relative shrink-0 overflow-hidden",
                    viewMode === 'desktop' ? "w-full max-w-6xl rounded-lg border border-[#dcdce4] shadow-2xl h-full" : "w-full min-h-full"
                )}>
                    <BlogFormatContent
                        content={getPreviewContent(selectedEntry, selectedType)}
                        className="h-full overflow-y-auto"
                    />
                </div>
            </div>
        </div>
    );
}

export default BlogFormatContent;

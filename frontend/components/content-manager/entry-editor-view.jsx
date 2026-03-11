'use client';

import React, { useState, useEffect } from 'react';
import { useContentTypeStore } from '@/lib/store';
import {
    ArrowLeft,
    Check,
    ChevronRight,
    Trash,
    Database,
    Globe,
    X,
    Plus,
    Edit2,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Bold,
    Italic,
    List,
    ListOrdered,
    CheckSquare,
    Link as LinkIcon,
    Quote,
    Code,
    Table as TableIcon,
    Calendar,
    Clock,
    ChevronDown,
    Search,
    TrendingUp,
    Award,
    ShieldCheck,
    Layout,
    MessageSquare,
    Type,
    Target,
    LineChart,
    AlertCircle,
    Info,
    ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentScorer } from '@/lib/content-scorer';
import { getPreviewContent } from '@/components/content-type-builder/data-preview';
import { AssetSelectionModal } from './asset-selection-modal';
import { FieldRenderer } from './field-renderer';
import { SchedulePublishModal } from './schedule-publish-modal';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";

export function EntryEditorView({
    contentType,
    entry,
    isSingleType,
    onSave,
    onCancel,
    onDelete
}) {
    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [activeTab, setActiveTab] = useState('basic');
    const [showAssetModalFor, setShowAssetModalFor] = useState(null);
    const [addingAfterFieldId, setAddingAfterFieldId] = useState(null);
    const [newFieldType, setNewFieldType] = useState('text');
    const { addField, addFieldAt, removeField, updateField, addEntryToNewRelease, updateEntry } = useContentTypeStore();

    // Field Editing State
    const [editingFieldId, setEditingFieldId] = useState(null);
    const [editFieldData, setEditFieldData] = useState({ name: '', type: 'text' });

    // Active TipTap Editor instance for Global Toolbar
    const [activeEditor, setActiveEditor] = useState(null);

    // Schedule Modal State
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');

    // Common Alert Dialog State
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        description: ''
    });

    const [selectedType, setSelectedType] = useState('');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showFieldsDropdown, setShowFieldsDropdown] = useState(false);

    // Ranking Score Modal State
    const [showRankingModal, setShowRankingModal] = useState(false);
    const [rankingData, setRankingData] = useState(null);

    // Initialize form data and load persistent domain
    useEffect(() => {
        if (entry) {
            // Priority 1: Current entry's saved domain
            // Priority 2: Last used domain from localStorage
            // Priority 3: Empty string
            const savedDomain = typeof window !== 'undefined' ? localStorage.getItem('astro_live_domain') || '' : '';
            const domain = entry.data?.LiveDomain || savedDomain;
            setFormData({ ...entry.data, LiveDomain: domain });
        } else {
            const savedDomain = typeof window !== 'undefined' ? localStorage.getItem('astro_live_domain') || '' : '';
            setFormData({ LiveDomain: savedDomain });
        }
    }, [entry]);

    // Persist domain when it changes
    const handleDomainChange = (val) => {
        setFormData({ ...formData, LiveDomain: val });
        if (typeof window !== 'undefined') {
            localStorage.setItem('astro_live_domain', val);
        }
    };

    const handleSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        // 1. Check if mandatory configuration exists
        const mandatoryFieldNames = ["Meta Title", "Slug"];
        const missingMandatoryFields = mandatoryFieldNames.filter(name =>
            !contentType.fields.some(f => f.name === name)
        );

        if (missingMandatoryFields.length > 0) {
            setAlertConfig({
                isOpen: true,
                title: 'Configuration Error',
                description: `Mandatory SEO fields are missing. Please add them in Basic Info: ${missingMandatoryFields.join(', ')}`
            });
            if (activeTab !== 'basic') setActiveTab('basic');
            return;
        }

        // 2. Map all errors
        const errors = {};
        contentType.fields.forEach(f => {
            const isMissing = f.required && (!formData[f.name] || (typeof formData[f.name] === 'string' && formData[f.name].trim() === ''));
            if (isMissing) errors[f.name] = true;
        });

        setFormErrors(errors);

        // 3. Separate Alerts for Basic Info and Blog Sections
        const basicFieldNames = ["Meta Title", "Meta Description", "Slug", "Image"];
        const basicErrors = contentType.fields.filter(f => basicFieldNames.includes(f.name) && errors[f.name]);
        const blogErrors = contentType.fields.filter(f => !basicFieldNames.includes(f.name) && errors[f.name]);

        if (basicErrors.length > 0) {
            setAlertConfig({
                isOpen: true,
                title: 'Basic Info Missing',
                description: `Please fill in the following required Metadata: ${basicErrors.map(f => f.name).join(', ')}`
            });
            if (activeTab !== 'basic') setActiveTab('basic');
            return;
        }

        if (blogErrors.length > 0) {
            setAlertConfig({
                isOpen: true,
                title: 'Blog Content Missing',
                description: `Please fill in the following required sections: ${blogErrors.map(f => f.name).join(', ')}`
            });
            if (activeTab !== 'blog') setActiveTab('blog');
            return;
        }

        setFormErrors({});
        onSave(formData);
    };

    const handleAssetSelect = (url) => {
        if (showAssetModalFor) {
            const field = contentType.fields.find(f => f.name === showAssetModalFor);

            if (field?.type === 'points-points-with-image') {
                const currentVal = formData[showAssetModalFor] || {};
                setFormData({ ...formData, [showAssetModalFor]: { ...currentVal, image: url } });
            } else {
                setFormData({ ...formData, [showAssetModalFor]: url });
            }

            setShowAssetModalFor(null);
        }
    };

    const handleSchedule = (date, time) => {
        if (entry) {
            const scheduledAt = `${date}T${time}:00Z`;

            // 1. Update the entry status directly to 'scheduled'
            updateEntry(entry.id, formData, 'scheduled', scheduledAt);

            // 2. Also keep the Release creation as a record/batch if existing logic requires it
            addEntryToNewRelease(
                `Automatic Publish: ${entry.id.slice(0, 8)}`,
                entry.id,
                contentType.id,
                scheduledAt
            );

            setAlertConfig({
                isOpen: true,
                title: 'Post Scheduled!',
                description: `This blog post will be automatically published on ${date} at ${time}.`
            });
        }
        setShowScheduleModal(false);
    };

    const calculateRankingScore = () => {
        const focusKeyword = formData["Focus Keyword"] || formData["Meta Title"] || "";

        if (!focusKeyword) {
            setAlertConfig({
                isOpen: true,
                title: 'Ranking Feasibility',
                description: 'Please add and fill a "Focus Keyword" or "Meta Title" field in Basic Info to calculate ranking feasibility.'
            });
            if (activeTab !== 'basic') setActiveTab('basic');
            return;
        }

        const blocks = getPreviewContent({ data: formData }, contentType);
        const scorer = new ContentScorer(blocks, focusKeyword);
        const result = scorer.calculate();
        const rules = result.rules;

        const criteriaIcons = {
            keywordUsage: <Target size={18} />,
            keywordPosition: <TrendingUp size={18} />,
            paragraphStructure: <Layout size={18} />,
            transitionWords: <ArrowUpRight size={18} />,
            sentenceLength: <Type size={18} />,
            activeVoice: <MessageSquare size={18} />,
            topicRelevance: <Award size={18} />,
            seoElements: <ShieldCheck size={18} />
        };

        const mappedCriteria = Object.entries(rules).map(([key, rule]) => ({
            title: rule.label,
            icon: criteriaIcons[key] || <Info size={18} />,
            marks: rule.score,
            max: rule.max,
            feedback: rule.score >= (rule.max * 0.8) ? "Strong performance." : rule.score >= (rule.max * 0.5) ? "Good effort." : "Needs attention.",
            details: rule.value || `${rule.score}/${rule.max}`,
            tab: 'blog'
        }));

        setRankingData({
            score: result.totalScore,
            category: result.category,
            categoryLabel: result.categoryLabel,
            keyword: focusKeyword,
            criteria: mappedCriteria,
            stats: {
                totalWords: scorer.analysis.totalWordCount,
                totalSentences: scorer.analysis.totalSentenceCount,
                density: rules.keywordUsage.value,
                passive: rules.activeVoice.value
            }
        });
        setShowRankingModal(true);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f6f6f9] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="bg-white px-8 py-4 border-b border-[#dcdce4] flex justify-between items-center shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    {!isSingleType && (
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-[#f6f6f9] rounded-lg text-[#666687] transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <div className="flex items-center gap-2 text-[10px] text-[#a5a5ba] font-bold uppercase tracking-widest leading-none mb-1">
                            <span>Content Manager</span>
                            <ChevronRight size={10} />
                            <span>{contentType.name}</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#32324d] leading-none">
                            {isSingleType
                                ? contentType.name
                                : entry
                                    ? `Edit Entry: ${entry.id.slice(0, 8)}`
                                    : 'Create New Blog'}
                        </h3>
                        <div className="flex items-center gap-6 mt-4">
                            <button
                                onClick={() => setActiveTab('basic')}
                                className={cn(
                                    "px-1 py-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all",
                                    activeTab === 'basic'
                                        ? "border-[#4945ff] text-[#4945ff]"
                                        : "border-transparent text-[#666687] hover:text-[#32324d]"
                                )}
                            >
                                Basic Info
                            </button>
                            <button
                                onClick={() => setActiveTab('blog')}
                                className={cn(
                                    "px-1 py-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all",
                                    activeTab === 'blog'
                                        ? "border-[#4945ff] text-[#4945ff]"
                                        : "border-transparent text-[#666687] hover:text-[#32324d]"
                                )}
                            >
                                Blog Sections
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={cn(
                                    "px-1 py-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all",
                                    activeTab === 'settings'
                                        ? "border-[#4945ff] text-[#4945ff]"
                                        : "border-transparent text-[#666687] hover:text-[#32324d]"
                                )}
                            >
                                Advanced Settings
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    {!isSingleType && (
                        <button
                            onClick={onCancel}
                            className="px-5 py-2 text-sm font-bold text-[#32324d] bg-white border border-[#dcdce4] rounded-md hover:bg-[#f6f6f9] transition-all"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="px-4 py-2 text-sm font-bold text-[#4945ff] bg-[#f0f0ff] border border-[#d2d2ff] rounded-md hover:bg-[#e1e1ff] transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Calendar size={16} /> Schedule to publish
                    </button>
                    <button
                        onClick={calculateRankingScore}
                        className="px-4 py-2 text-sm font-bold text-[#4945ff] bg-[#f0f0ff] border border-[#d2d2ff] rounded-md hover:bg-[#e1e1ff] transition-all flex items-center gap-2 shadow-sm active:scale-95 group"
                    >
                        <TrendingUp size={16} className="group-hover:scale-110 transition-transform" /> Ranking Feasibility
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 text-sm font-bold bg-[#4945ff] text-white rounded-md hover:bg-[#271fe0] transition-all flex items-center gap-2 shadow-sm active:scale-95"
                    >
                        <Check size={16} /> Save
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area (Full Width) */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                    {activeTab === 'basic' ? (
                        <div className="max-w-4xl mx-auto space-y-6 py-8">
                            {/* Classification & Metadata Section (Section 1) */}
                            <div className="bg-white rounded-xl shadow-sm border border-[#dcdce4] flex flex-col overflow-visible">
                                <div className="p-6">
                                    <h4 className="text-xs font-bold text-[#32324d] uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Database size={14} className="text-[#4945ff]" /> 1. Classification & Metadata
                                    </h4>
                                    <div className="flex flex-col gap-8">
                                        {/* Type Selector Dashboard */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-bold text-[#666687] uppercase tracking-wider mb-2 block">Content Classification</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                                                        className="w-full px-4 py-3 text-sm font-medium text-[#32324d] bg-white border border-[#dcdce4] rounded-lg hover:border-[#4945ff] flex items-center justify-between gap-3 shadow-sm transition-all focus:ring-2 focus:ring-[#4945ff]/20 outline-none group"
                                                    >
                                                        <div className="flex flex-col items-start">
                                                            <span className="text-[9px] font-bold text-[#a5a5ba] uppercase tracking-wider leading-none mb-1 group-hover:text-[#4945ff] transition-colors">Type</span>
                                                            <span className="leading-none">{selectedType || "Not Selected"}</span>
                                                        </div>
                                                        <ChevronDown size={14} className={cn("text-[#666687] transition-transform duration-200", showTypeDropdown && "rotate-180")} />
                                                    </button>
                                                    {showTypeDropdown && (
                                                        <>
                                                            <div className="fixed inset-0 z-30" onClick={() => setShowTypeDropdown(false)} />
                                                            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#dcdce4] rounded-lg shadow-xl z-40 py-2 animate-in fade-in zoom-in-95 duration-100">
                                                                {["Parenting Tips", "Astrology Basics", "Ayurveda", "Wellness", "Success Story"].map((cat) => (
                                                                    <button
                                                                        key={cat}
                                                                        type="button"
                                                                        onClick={() => { setSelectedType(cat); setShowTypeDropdown(false); }}
                                                                        className="w-full px-4 py-2 text-left text-sm text-[#32324d] hover:bg-[#f0f0ff] hover:text-[#4945ff] transition-colors"
                                                                    >
                                                                        {cat}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-bold text-[#666687] uppercase tracking-wider mb-2 block">Quick Add Fields</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { name: "Meta Title", type: "text" },
                                                        { name: "Meta Description", type: "text" },
                                                        { name: "Focus Keyword", type: "text" },
                                                        { name: "Image", type: "media" },
                                                        { name: "Slug", type: "text" }
                                                    ].map((f) => {
                                                        const exists = contentType.fields.some(field => field.name === f.name);
                                                        return (
                                                            <button
                                                                key={f.name}
                                                                type="button"
                                                                disabled={exists}
                                                                onClick={() => {
                                                                    if (!exists) {
                                                                        addField(contentType.id, {
                                                                            id: `f-${f.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
                                                                            name: f.name,
                                                                            type: f.type,
                                                                            required: f.name === "Meta Title" || f.name === "Slug"
                                                                        });
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "px-4 py-2 text-xs font-bold rounded-full border transition-all flex items-center gap-2",
                                                                    exists
                                                                        ? "bg-[#f6f6f9] text-[#a5a5ba] border-[#dcdce4] cursor-default"
                                                                        : "bg-white text-[#4945ff] border-[#dcdce4] hover:border-[#4945ff] hover:bg-[#f0f0ff] shadow-sm active:scale-95"
                                                                )}
                                                            >
                                                                {exists ? <Check size={12} /> : <Plus size={12} />}
                                                                {f.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metadata Fields Grid */}
                                        {contentType.fields.some(f => ["Meta Title", "Meta Description", "Focus Keyword", "Image", "Slug"].includes(f.name)) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#f6f6f9]">
                                                {contentType.fields
                                                    .filter(f => ["Meta Title", "Meta Description", "Focus Keyword", "Image", "Slug"].includes(f.name))
                                                    .map(field => (
                                                        <div
                                                            key={field.id}
                                                            className={cn(
                                                                "space-y-3 p-3 rounded-xl border shadow-sm transition-all group/meta relative animate-in fade-in zoom-in-95 duration-200",
                                                                formErrors[field.name]
                                                                    ? "bg-red-50 border-red-300 hover:border-red-400"
                                                                    : "bg-[#fcfcfd] border-[#dcdce4] hover:border-[#4945ff]"
                                                            )}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#4945ff]" />
                                                                    <label className="text-[10px] font-bold text-[#32324d] uppercase tracking-wider">
                                                                        {field.name} {field.required && <span className="text-red-500">*</span>}
                                                                    </label>
                                                                    <span className="text-[8px] px-1.5 py-0.5 bg-[#f0f0ff] text-[#4945ff] rounded-md font-bold uppercase border border-[#d2d2ff]">{field.type}</span>
                                                                </div>
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            className="p-2 text-[#a5a5ba] hover:text-red-500 transition-colors"
                                                                            title={`Remove ${field.name}`}
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className='z-50'>
                                                                        <DialogHeader>
                                                                            <DialogTitle>Are you sure?</DialogTitle>
                                                                            <DialogDescription>
                                                                                Remove field &quot;{field.name}&quot; from this category?
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <div className='flex justify-end gap-5'>
                                                                            <DialogClose asChild>
                                                                                <button className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95">
                                                                                    Cancel
                                                                                </button>
                                                                            </DialogClose>
                                                                            <button
                                                                                onClick={() => removeField(contentType.id, field.id)}
                                                                                className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95"
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </div>
                                                            <FieldRenderer
                                                                field={field}
                                                                value={formData[field.name]}
                                                                onChange={(val) => setFormData({ ...formData, [field.name]: val })}
                                                                onAssetModalOpen={setShowAssetModalFor}
                                                                onEditorFocus={setActiveEditor}
                                                            />
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'blog' ? (
                        <div className="max-w-4xl mx-auto space-y-6 pb-8">
                            {/* Main Content Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-[#dcdce4] flex flex-col relative">
                                <div className="sticky top-0 z-30 bg-white border-b border-[#dcdce4] rounded-t-xl shadow-sm">
                                    <div className="p-5">
                                        <h4 className="text-xs font-bold text-[#32324d] uppercase tracking-widest flex items-center gap-2">
                                            <Edit2 size={14} className="text-[#4945ff]" /> 2. Blog Content Sections
                                        </h4>
                                    </div>
                                    {/* Global Formatting Toolbar */}
                                    <div className="bg-[#fcfcfd] border-t border-[#f6f6f9] px-4 py-2 flex items-center gap-1 flex-wrap">
                                        {[
                                            { icon: <Heading1 size={14} />, label: 'Heading 1', pre: '# ', post: '' },
                                            { icon: <Heading2 size={14} />, label: 'Heading 2', pre: '## ', post: '' },
                                            { icon: <Heading3 size={14} />, label: 'Heading 3', pre: '### ', post: '' },
                                            { icon: <Heading4 size={14} />, label: 'Heading 4', pre: '#### ', post: '' },
                                            { icon: <Heading5 size={14} />, label: 'Heading 5', pre: '##### ', post: '' },
                                            { icon: <Heading6 size={14} />, label: 'Heading 6', pre: '###### ', post: '' },
                                            { separator: true },
                                            { icon: <Bold size={14} />, label: 'Bold', pre: '**', post: '**' },
                                            { icon: <Italic size={14} />, label: 'Italic', pre: '*', post: '*' },
                                            { separator: true },
                                            { icon: <List size={14} />, label: 'Bullet List', pre: '- ', post: '' },
                                            { icon: <ListOrdered size={14} />, label: 'Numbered List', pre: '1. ', post: '' },
                                            { icon: <Check size={14} />, label: 'Tick List', pre: '- [ ] ', post: '' },
                                            { separator: true },
                                            { icon: <LinkIcon size={14} />, label: 'Link', pre: '[', post: '](url)' },
                                            { icon: <Quote size={14} />, label: 'Quote', pre: '> ', post: '' },
                                            { icon: <Code size={14} />, label: 'Code', pre: '`', post: '`' },
                                            { icon: <TableIcon size={14} />, label: 'Table', pre: '\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n', post: '' }
                                        ].map((tool, i) => (
                                            tool.separator ? (
                                                <div key={i} className="w-px h-4 bg-[#dcdce4] mx-1" />
                                            ) : (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={(e) => {
                                                        e.preventDefault();

                                                        // 1. TipTap Editor Logic - Only apply if the editor is actually focused
                                                        if (activeEditor && !activeEditor.isDestroyed && activeEditor.isFocused) {
                                                            switch (tool.label) {
                                                                case 'Heading 1': activeEditor.chain().focus().toggleHeading({ level: 1 }).run(); break;
                                                                case 'Heading 2': activeEditor.chain().focus().toggleHeading({ level: 2 }).run(); break;
                                                                case 'Heading 3': activeEditor.chain().focus().toggleHeading({ level: 3 }).run(); break;
                                                                case 'Heading 4': activeEditor.chain().focus().toggleHeading({ level: 4 }).run(); break;
                                                                case 'Heading 5': activeEditor.chain().focus().toggleHeading({ level: 5 }).run(); break;
                                                                case 'Heading 6': activeEditor.chain().focus().toggleHeading({ level: 6 }).run(); break;
                                                                case 'Bold': activeEditor.chain().focus().toggleBold().run(); break;
                                                                case 'Italic': activeEditor.chain().focus().toggleItalic().run(); break;
                                                                case 'Bullet List': activeEditor.chain().focus().toggleBulletList().run(); break;
                                                                case 'Numbered List': activeEditor.chain().focus().toggleOrderedList().run(); break;
                                                                case 'Tick List': activeEditor.chain().focus().toggleTaskList().run(); break;
                                                                case 'Link':
                                                                    const previousUrl = activeEditor.getAttributes('link').href;
                                                                    const url = window.prompt('URL', previousUrl);
                                                                    if (url === null) return;
                                                                    if (url === '') {
                                                                        activeEditor.chain().focus().extendMarkRange('link').unsetLink().run();
                                                                        return;
                                                                    }
                                                                    activeEditor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                                                                    break;
                                                                case 'Quote': activeEditor.chain().focus().toggleBlockquote().run(); break;
                                                                case 'Code': activeEditor.chain().focus().toggleCodeBlock().run(); break;
                                                                case 'Table': activeEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); break;
                                                            }
                                                            return;
                                                        }

                                                        // 2. Fallback Standard Input Logic (for Title, Para, etc.)
                                                        const activeEl = document.activeElement;
                                                        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                                                            const start = activeEl.selectionStart || 0;
                                                            const end = activeEl.selectionEnd || 0;
                                                            const text = activeEl.value;
                                                            const pre = tool.pre || '';
                                                            const post = tool.post || '';

                                                            const newText = text.substring(0, start) + pre + text.substring(start, end) + post + text.substring(end);

                                                            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                                                            const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

                                                            if (activeEl.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
                                                                nativeTextAreaValueSetter.call(activeEl, newText);
                                                            } else if (activeEl.tagName === 'INPUT' && nativeInputValueSetter) {
                                                                nativeInputValueSetter.call(activeEl, newText);
                                                            } else {
                                                                activeEl.value = newText;
                                                            }

                                                            activeEl.dispatchEvent(new Event('input', { bubbles: true }));

                                                            // Restore focus and selection
                                                            setTimeout(() => {
                                                                activeEl.focus();
                                                                activeEl.setSelectionRange(start + pre.length, end + pre.length);
                                                            }, 0);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "p-1.5 text-[#666687] hover:text-[#4945ff] hover:bg-[#f0f0ff] rounded transition-colors",
                                                        activeEditor && tool.label === 'Bold' && activeEditor.isActive('bold') && "bg-[#f0f0ff] text-[#4945ff]",
                                                        activeEditor && tool.label === 'Italic' && activeEditor.isActive('italic') && "bg-[#f0f0ff] text-[#4945ff]",
                                                        activeEditor && tool.label?.startsWith('Heading') && activeEditor.isActive('heading', { level: parseInt(tool.label.split(' ')[1]) }) && "bg-[#f0f0ff] text-[#4945ff]",
                                                        activeEditor && tool.label === 'Bullet List' && activeEditor.isActive('bulletList') && "bg-[#f0f0ff] text-[#4945ff]",
                                                        activeEditor && tool.label === 'Numbered List' && activeEditor.isActive('orderedList') && "bg-[#f0f0ff] text-[#4945ff]",
                                                        activeEditor && tool.label === 'Tick List' && activeEditor.isActive('taskList') && "bg-[#f0f0ff] text-[#4945ff]"
                                                    )}
                                                    title={tool.label}
                                                >
                                                    {tool.icon}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </div>
                                <div className="p-8 space-y-8">
                                    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                                        {contentType.fields
                                            .filter(f => !["Meta Title", "Meta Description", "Focus Keyword", "Image", "Slug"].includes(f.name))
                                            .map(field => (
                                                <React.Fragment key={field.id}>
                                                    <div
                                                        className={cn(
                                                            "space-y-3 p-3 rounded-xl border shadow-sm transition-all group relative",
                                                            formErrors[field.name] ? "bg-red-50 border-red-200" : "bg-[#fcfcfd] border-[#dcdce4] hover:border-[#4945ff]"
                                                        )}
                                                    >
                                                        {editingFieldId === field.id ? (
                                                            <div className="bg-[#f0f0ff] p-4 rounded-lg border border-[#4945ff] space-y-3 relative z-10">
                                                                <h4 className="text-xs font-bold text-[#4945ff] uppercase tracking-wider">Edit Field</h4>
                                                                <div className="flex flex-col gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-[#666687] uppercase">Type</label>
                                                                        <select
                                                                            value={editFieldData.type}
                                                                            onChange={(e) => setEditFieldData({ ...editFieldData, type: e.target.value })}
                                                                            className="w-full px-2 py-1.5 text-xs border border-[#dcdce4] rounded focus:border-[#4945ff] outline-none bg-white"
                                                                        >
                                                                            <option value="text">Text</option>
                                                                            <option value="rich-text">Rich Text</option>
                                                                            <option value="title">Title Section</option>
                                                                            <option value="subtitle">Subtitle</option>
                                                                            <option value="subtitle1">Subtitle Level 2</option>
                                                                            <option value="para">Paragraph</option>
                                                                            <option value="points">Points List</option>
                                                                            <option value="points-points">Nested Points</option>
                                                                            <option value="points-points-with-image">Nested Points + Image</option>
                                                                            <option value="numbered-list">Numbered List</option>
                                                                            <option value="checklist">Checklist</option>
                                                                            <option value="faq">FAQ Section</option>
                                                                            <option value="table">Data Table</option>
                                                                            <option value="cta">Call to Action</option>
                                                                            <option value="summary">Summary Box</option>
                                                                            <option value="number">Number</option>
                                                                            <option value="date">Date</option>
                                                                            <option value="boolean">Boolean</option>
                                                                            <option value="media">Media/Images</option>
                                                                            <option value="email">Email</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 pt-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            updateField(contentType.id, field.id, {
                                                                                name: field.name,
                                                                                type: editFieldData.type
                                                                            });
                                                                            setEditingFieldId(null);
                                                                        }}
                                                                        className="px-3 py-1.5 text-xs font-bold bg-[#4945ff] text-white rounded hover:bg-[#271fe0] transition-colors"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingFieldId(null)}
                                                                        className="px-3 py-1.5 text-xs font-bold bg-white border border-[#dcdce4] text-[#32324d] rounded hover:bg-[#f6f6f9] transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex justify-between items-end mb-2">
                                                                    <label className="block text-[10px] font-bold text-[#666687] uppercase tracking-wider">
                                                                        {field.name} {field.required && <span className="text-red-500">*</span>}
                                                                    </label>
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setAddingAfterFieldId(field.id);
                                                                                setTimeout(() => {
                                                                                    const input = document.getElementById('new-field-name-input');
                                                                                    if (input) input.focus();
                                                                                }, 100);
                                                                            }}
                                                                            className="p-1 text-[#666687] hover:text-[#4945ff] hover:bg-[#f0f0ff] rounded transition-colors"
                                                                            title="Add New Field"
                                                                        >
                                                                            <Plus size={12} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setEditingFieldId(field.id);
                                                                                setEditFieldData({ name: field.name, type: field.type });
                                                                            }}
                                                                            className="p-1 text-[#666687] hover:text-[#4945ff] hover:bg-[#f0f0ff] rounded transition-colors"
                                                                            title="Edit Field"
                                                                        >
                                                                            <Edit2 size={12} />
                                                                        </button>
                                                                        <Dialog>
                                                                            <DialogTrigger asChild>
                                                                                <button
                                                                                    type="button"
                                                                                    className="p-2 text-[#a5a5ba] hover:text-red-500 transition-colors"
                                                                                    title="Delete Field"
                                                                                >
                                                                                    <X size={16} />
                                                                                </button>
                                                                            </DialogTrigger>
                                                                            <DialogContent className='z-50'>
                                                                                <DialogHeader>
                                                                                    <DialogTitle>Are you sure?</DialogTitle>
                                                                                    <DialogDescription>
                                                                                        Remove field &quot;{field.name}&quot; from this category?
                                                                                    </DialogDescription>
                                                                                </DialogHeader>
                                                                                <div className='flex justify-end gap-5'>
                                                                                    <DialogClose asChild>
                                                                                        <button className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95">
                                                                                            Cancel
                                                                                        </button>
                                                                                    </DialogClose>
                                                                                    <button
                                                                                        onClick={() => removeField(contentType.id, field.id)}
                                                                                        className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95"
                                                                                    >
                                                                                        Remove
                                                                                    </button>
                                                                                </div>
                                                                            </DialogContent>
                                                                        </Dialog>
                                                                    </div>
                                                                </div>

                                                                <FieldRenderer
                                                                    field={field}
                                                                    value={formData[field.name]}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, [field.name]: value }))}
                                                                    onAssetModalOpen={() => setShowAssetModalFor(field.name)}
                                                                    onEditorFocus={(editor) => setActiveEditor(editor)}
                                                                />
                                                            </>
                                                        )}
                                                    </div>

                                                    {addingAfterFieldId === field.id && (
                                                        <div className="bg-[#f0f0ff] border border-[#4945ff] rounded-lg p-4 animate-in fade-in slide-in-from-top-2 relative z-10 mb-4 mt-2">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Plus size={16} className="text-[#4945ff]" />
                                                                <span className="text-sm font-bold text-[#32324d]">Add New Field to {contentType.name}</span>
                                                            </div>
                                                            <div className="flex gap-4 items-end">
                                                                <div className="flex-1 space-y-1">
                                                                    <label className="text-[10px] font-bold text-[#666687] uppercase">Select Layout/Type</label>
                                                                    <select
                                                                        autoFocus
                                                                        value={newFieldType}
                                                                        onChange={(e) => setNewFieldType(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                const fieldsOfType = contentType.fields.filter(f => f.type === newFieldType);
                                                                                const autoName = `${newFieldType}${fieldsOfType.length > 0 ? ` ${fieldsOfType.length + 1}` : ''}`;
                                                                                const fieldId = 'f-' + Date.now();
                                                                                addFieldAt(contentType.id, {
                                                                                    id: fieldId,
                                                                                    name: autoName,
                                                                                    type: newFieldType,
                                                                                    required: false
                                                                                }, field.id);
                                                                                setAddingAfterFieldId(null);
                                                                            }
                                                                        }}
                                                                        className="w-full px-3 py-2 text-sm border border-[#dcdce4] rounded focus:border-[#4945ff] outline-none bg-white"
                                                                    >
                                                                        <option value="title">Title Section</option>
                                                                        <option value="subtitle">Subtitle</option>
                                                                        <option value="subtitle1">Subtitle 1</option>
                                                                        <option value="para">Para</option>
                                                                        <option value="points">Points</option>
                                                                        <option value="points-points">Points-Points</option>
                                                                        <option value="points-points-with-image">Points-Points-with-image</option>
                                                                        <option value="numbered-list">Numbered List</option>
                                                                        <option value="checklist">Checklist</option>
                                                                        <option value="faq">FAQ</option>
                                                                        <option value="table">Table</option>
                                                                        <option value="cta">CTA</option>
                                                                        <option value="summary">Summary</option>
                                                                        <option value="media">Image/Media</option>
                                                                        <option value="rich-text">Custom Rich Text</option>
                                                                        <option value="text">Simple Text</option>
                                                                        <option value="number">Number</option>
                                                                        <option value="date">Date</option>
                                                                        <option value="boolean">Boolean</option>
                                                                        <option value="email">Email</option>
                                                                    </select>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const nameMap = {
                                                                                'title': 'Title', 'subtitle': 'Subtitle', 'subtitle1': 'Subtitle 1',
                                                                                'para': 'Para', 'points': 'Points', 'points-points': 'Points-Points',
                                                                                'points-points-with-image': 'Points-Points-with-image',
                                                                                'numbered-list': 'Numbered List', 'checklist': 'Checklist',
                                                                                'faq': 'FAQ', 'table': 'Table', 'cta': 'CTA', 'summary': 'Summary',
                                                                                'media': 'Media', 'rich-text': 'Rich Text', 'text': 'Text',
                                                                                'number': 'Number', 'date': 'Date', 'boolean': 'Boolean', 'email': 'Email'
                                                                            };
                                                                            const baseName = nameMap[newFieldType] || newFieldType;
                                                                            const fieldsWithSameName = contentType.fields.filter(f => f.name.startsWith(baseName));
                                                                            const autoName = fieldsWithSameName.length > 0 ? `${baseName} ${fieldsWithSameName.length + 1}` : baseName;

                                                                            const fieldId = 'f-' + Date.now();
                                                                            addFieldAt(contentType.id, {
                                                                                id: fieldId,
                                                                                name: autoName,
                                                                                type: newFieldType,
                                                                                required: false
                                                                            }, field.id);
                                                                            setAddingAfterFieldId(null);
                                                                        }}
                                                                        className="px-6 py-2 text-sm font-bold bg-[#4945ff] text-white rounded hover:bg-[#271fe0] transition-colors"
                                                                    >
                                                                        Add Section
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setAddingAfterFieldId(null)}
                                                                        className="px-4 py-2 text-sm font-bold bg-white border border-[#dcdce4] text-[#32324d] rounded hover:bg-[#f6f6f9] transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                    </form>

                                    {/* Dynamic Field Creation */}
                                    <div className="pt-6 border-t border-[#f6f6f9] mt-4">
                                        {addingAfterFieldId === 'last' ? (
                                            <div className="bg-[#f0f0ff] border border-[#4945ff] rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Plus size={16} className="text-[#4945ff]" />
                                                    <span className="text-sm font-bold text-[#32324d]">Add New Field to {contentType.name}</span>
                                                </div>
                                                <div className="flex gap-4 items-end">
                                                    <div className="flex-1 space-y-1">
                                                        <label className="text-[10px] font-bold text-[#666687] uppercase">Select Layout/Type</label>
                                                        <select
                                                            autoFocus
                                                            value={newFieldType}
                                                            onChange={(e) => setNewFieldType(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const fieldsOfType = contentType.fields.filter(f => f.type === newFieldType);
                                                                    const autoName = `${newFieldType}${fieldsOfType.length > 0 ? ` ${fieldsOfType.length + 1}` : ''}`;
                                                                    const fieldId = 'f-' + Date.now();
                                                                    addField(contentType.id, {
                                                                        id: fieldId,
                                                                        name: autoName,
                                                                        type: newFieldType,
                                                                        required: false
                                                                    });
                                                                    setAddingAfterFieldId(null);
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 text-sm border border-[#dcdce4] rounded focus:border-[#4945ff] outline-none bg-white"
                                                        >
                                                            <option value="title">Title Section</option>
                                                            <option value="subtitle">Subtitle</option>
                                                            <option value="subtitle1">Subtitle 1</option>
                                                            <option value="para">Para</option>
                                                            <option value="points">Points</option>
                                                            <option value="points-points">Points-Points</option>
                                                            <option value="points-points-with-image">Points-Points-with-image</option>
                                                            <option value="numbered-list">Numbered List</option>
                                                            <option value="checklist">Checklist</option>
                                                            <option value="faq">FAQ</option>
                                                            <option value="table">Table</option>
                                                            <option value="cta">CTA</option>
                                                            <option value="summary">Summary</option>
                                                            <option value="media">Image/Media</option>
                                                            <option value="rich-text">Custom Rich Text</option>
                                                            <option value="text">Simple Text</option>
                                                            <option value="number">Number</option>
                                                            <option value="date">Date</option>
                                                            <option value="boolean">Boolean</option>
                                                            <option value="email">Email</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const nameMap = {
                                                                    'title': 'Title', 'subtitle': 'Subtitle', 'subtitle1': 'Subtitle 1',
                                                                    'para': 'Para', 'points': 'Points', 'points-points': 'Points-Points',
                                                                    'points-points-with-image': 'Points-Points-with-image',
                                                                    'numbered-list': 'Numbered List', 'checklist': 'Checklist',
                                                                    'faq': 'FAQ', 'table': 'Table', 'cta': 'CTA', 'summary': 'Summary',
                                                                    'media': 'Media', 'rich-text': 'Rich Text', 'text': 'Text',
                                                                    'number': 'Number', 'date': 'Date', 'boolean': 'Boolean', 'email': 'Email'
                                                                };
                                                                const baseName = nameMap[newFieldType] || newFieldType;
                                                                const fieldsWithSameName = contentType.fields.filter(f => f.name.startsWith(baseName));
                                                                const autoName = fieldsWithSameName.length > 0 ? `${baseName} ${fieldsWithSameName.length + 1}` : baseName;

                                                                const fieldId = 'f-' + Date.now();
                                                                addField(contentType.id, {
                                                                    id: fieldId,
                                                                    name: autoName,
                                                                    type: newFieldType,
                                                                    required: false
                                                                });
                                                                setAddingAfterFieldId(null);
                                                            }}
                                                            className="px-6 py-2 text-sm font-bold bg-[#4945ff] text-white rounded hover:bg-[#271fe0] transition-colors"
                                                        >
                                                            Add Section
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setAddingAfterFieldId(null)}
                                                            className="px-4 py-2 text-sm font-bold bg-white border border-[#dcdce4] text-[#32324d] rounded hover:bg-[#f6f6f9] transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddingAfterFieldId('last');
                                                    setTimeout(() => {
                                                        const input = document.getElementById('new-field-name-input');
                                                        if (input) input.focus();
                                                    }, 100);
                                                }}
                                                className="flex items-center gap-2 text-sm font-bold text-[#4945ff] hover:bg-[#f0f0ff] px-4 py-3 rounded-lg border border-dashed border-[#dcdce4] hover:border-[#4945ff] w-full justify-center transition-all"
                                            >
                                                <Plus size={16} /> Add another field to this content type
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-[#dcdce4] p-8 space-y-8">
                            <h3 className="text-lg font-bold text-[#32324d] border-b border-[#f6f6f9] pb-4">Entry Configuration</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#666687] uppercase">Created At</label>
                                    <div className="text-sm text-[#32324d] p-3 bg-[#f6f6f9] rounded-md border border-[#dcdce4] font-mono">
                                        {entry ? new Date(entry.createdAt).toLocaleString() : 'Will be set on save'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#666687] uppercase">Updated At</label>
                                    <div className="text-sm text-[#32324d] p-3 bg-[#f6f6f9] rounded-md border border-[#dcdce4] font-mono">
                                        {entry ? new Date(entry.updatedAt).toLocaleString() : 'Will be set on save'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#666687] uppercase">Published At</label>
                                    <div className="text-sm text-[#32324d] p-3 bg-[#f6f6f9] rounded-md border border-[#dcdce4] font-mono">
                                        {entry ? new Date().toLocaleString() : 'Not published'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#666687] uppercase">Created By</label>
                                    <div className="text-sm text-[#32324d] p-3 bg-[#f6f6f9] rounded-md border border-[#dcdce4]">
                                        {'Admin User'}
                                    </div>
                                </div>
                            </div>

                            {/* Simplified URL Indexing Section */}
                            <div className="pt-6 border-t border-[#f6f6f9]">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                                    <h4 className="text-sm font-bold text-[#32324d]">Google URL Index Check</h4>
                                </div>
                                <div className="p-6 bg-linear-to-br from-white to-[#f8faff] border border-[#dcdce4] rounded-2xl shadow-sm">
                                    <div className="flex flex-col lg:flex-row gap-6 items-end justify-between">
                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="space-y-1">
                                                <h5 className="text-sm font-bold text-[#32324d]">Check Live URL Status</h5>
                                                <p className="text-[11px] text-[#666687]">
                                                    Enter your live domain and confirm your slug to check indexing status.
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <div className="flex-1 flex items-center gap-3 p-3 bg-white border border-[#dcdce4] rounded-xl shadow-inner focus-within:border-[#4945ff] transition-all">
                                                        <Globe size={14} className="text-[#a5a5ba]" />
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. astrokids.com"
                                                            value={formData["LiveDomain"] || ""}
                                                            onChange={(e) => handleDomainChange(e.target.value)}
                                                            className="bg-transparent border-none p-0 text-xs font-bold text-[#32324d] focus:ring-0 w-full placeholder:text-[#dcdce4]"
                                                        />
                                                    </div>
                                                    <div className="sm:w-1/3 flex items-center gap-3 p-3 bg-white border border-[#dcdce4] rounded-xl shadow-inner focus-within:border-[#4945ff] transition-all">
                                                        <LinkIcon size={14} className="text-[#a5a5ba]" />
                                                        <input
                                                            type="text"
                                                            placeholder="slug"
                                                            value={formData["Slug"] || ""}
                                                            onChange={(e) => setFormData({ ...formData, Slug: e.target.value })}
                                                            className="bg-transparent border-none p-0 text-xs font-bold text-[#32324d] focus:ring-0 w-full placeholder:text-[#dcdce4]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Live URL Preview - Now Clickable */}
                                                {formData["LiveDomain"] && formData["Slug"] && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const cleanDomain = formData["LiveDomain"].trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
                                                            const cleanSlug = formData["Slug"].trim().replace(/^\/+/, '');
                                                            const fullUrl = `${cleanDomain}/${cleanSlug}`;
                                                            // site: prefix makes it an exact indexing check for just this URL
                                                            const searchUrl = `https://www.google.com/search?q=site:${encodeURIComponent(fullUrl)}`;
                                                            window.open(searchUrl, '_blank');
                                                        }}
                                                        className="w-full px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between group hover:bg-emerald-100/50 transition-all cursor-pointer text-left"
                                                        title="Click to search this URL on Google"
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                            <span className="text-[10px] font-medium text-emerald-700 truncate italic">
                                                                https://{formData["LiveDomain"].replace(/^https?:\/\//, '').replace(/\/+$/, '')}/{formData["Slug"].replace(/^\/+/, '')}
                                                            </span>
                                                        </div>
                                                        <ArrowUpRight size={12} className="text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const title = formData["Meta Title"] || "";
                                                    if (!title) {
                                                        setAlertConfig({ isOpen: true, title: 'Meta Title Missing', description: 'Please add a Meta Title in Basic Info to check indexing.' });
                                                        return;
                                                    }

                                                    const domain = formData["LiveDomain"] ? formData["LiveDomain"].trim().replace(/^https?:\/\//, '').replace(/\/+$/, '') : "";
                                                    // Use site: filter if domain is present to ensure results are ONLY for this blog
                                                    const query = domain
                                                        ? `site:${domain} intitle:"${title}"`
                                                        : `intitle:"${title}"`;

                                                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                                                    window.open(searchUrl, '_blank');
                                                }}
                                                className="px-5 py-3 text-xs font-bold text-[#32324d] bg-white border border-[#dcdce4] rounded-xl hover:bg-[#f8faff] transition-all flex items-center gap-2 shadow-sm active:scale-95"
                                            >
                                                <Type size={14} className="text-emerald-500" /> Title Check
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const rawDomain = formData["LiveDomain"] || "";
                                                    const rawSlug = formData["Slug"] || "";

                                                    if (!rawDomain) {
                                                        setAlertConfig({ isOpen: true, title: 'Domain Missing', description: 'Please enter your live site domain.' });
                                                        return;
                                                    }
                                                    if (!rawSlug) {
                                                        setAlertConfig({ isOpen: true, title: 'Slug Missing', description: 'Please add a slug in Basic Info first.' });
                                                        return;
                                                    }

                                                    const cleanDomain = rawDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
                                                    const cleanSlug = rawSlug.trim().replace(/^\/+/, '');
                                                    const fullUrl = `${cleanDomain}/${cleanSlug}`;

                                                    // Use site: specifically to check if this exact URL is in Google's index
                                                    const searchUrl = `https://www.google.com/search?q=site:${encodeURIComponent(fullUrl)}`;
                                                    window.open(searchUrl, '_blank');
                                                }}
                                                className="px-5 py-3 text-xs font-bold text-white bg-[#4945ff] rounded-xl hover:bg-[#271fe0] transition-all flex items-center gap-2 shadow-lg active:scale-95"
                                            >
                                                <LinkIcon size={14} /> URL Search
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <h3 className="text-lg font-bold text-[#32324d] border-b border-[#f6f6f9] pb-4">Entry Configuration</h3>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[#4945ff] rounded-full" />
                                        <h4 className="text-sm font-bold text-[#32324d]">SEO & Content Summary</h4>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
                                            setAlertConfig({ isOpen: true, title: 'Success', description: 'Raw JSON data copied to clipboard.' });
                                        }}
                                        className="px-3 py-1.5 text-[10px] font-bold text-[#4945ff] bg-[#f0f0ff] rounded-md hover:bg-[#e1e1ff] transition-all flex items-center gap-1.5"
                                    >
                                        <Database size={12} /> Copy Raw JSON
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(formData).map(([key, value]) => {
                                        // Skip empty values or very large content blocks for simple summary
                                        if (!value || (typeof value === 'string' && value.length > 200)) return null;
                                        if (typeof value === 'object' && !Array.isArray(value)) return null;

                                        return (
                                            <div key={key} className="p-4 bg-[#fcfcfd] border border-[#dcdce4] rounded-xl flex flex-col gap-1.5 hover:border-[#4945ff] hover:shadow-sm transition-all group">
                                                <span className="text-[10px] font-black text-[#a5a5ba] uppercase tracking-wider group-hover:text-[#4945ff] transition-colors">{key}</span>
                                                <div className="text-xs text-[#32324d] font-medium wrap-break-word leading-relaxed">
                                                    {Array.isArray(value) ? `${value.length} items selected` : String(value)}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Large Content Blocks Placeholder */}
                                    <div className="md:col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                            <Info size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-amber-900">Long Content detected</p>
                                            <p className="text-[10px] text-amber-700">Detailed blog sections and descriptions are hidden from this summary for better readability. Switch to &apos;Blog Sections&apos; to edit them.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {entry && onDelete && (
                                <div className="pt-10 border-t border-red-100">
                                    <h4 className="text-sm font-bold text-red-600 mb-4">Danger Zone</h4>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button
                                                type="button"
                                                className="w-full max-w-xs py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-md border border-red-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Trash size={14} /> Delete Entry
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className='z-50'>
                                            <DialogHeader>
                                                <DialogTitle>Are you sure?</DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to delete this entry permanently?
                                                    This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className='flex justify-end gap-5'>
                                                <DialogClose asChild>
                                                    <button className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95">
                                                        Cancel
                                                    </button>
                                                </DialogClose>
                                                <button
                                                    onClick={() => onDelete(entry.id)}
                                                    className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Asset Modal */}
            <AssetSelectionModal
                isOpen={!!showAssetModalFor}
                onClose={() => setShowAssetModalFor(null)}
                onSelect={handleAssetSelect}
            />
            {/* Schedule Modal */}
            <SchedulePublishModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSchedule={handleSchedule}
            />

            {/* Common Alert Dialog */}
            <Dialog open={alertConfig.isOpen} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className='z-50'>
                    <DialogHeader>
                        <DialogTitle>{alertConfig.title}</DialogTitle>
                        <DialogDescription>
                            {alertConfig.description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className='flex justify-end'>
                        <button
                            onClick={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-[#4945ff] hover:bg-[#271fe0] rounded-md transition-all shadow-lg active:scale-95"
                        >
                            OK
                        </button>
                    </div>

                </DialogContent>
            </Dialog>

            <Dialog open={showRankingModal} onOpenChange={setShowRankingModal}>
                <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl z-50 outline-none flex flex-col max-h-[94vh]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>SEO Audit Results</DialogTitle>
                        <DialogDescription>Detailed breakdown of content ranking feasibility and SEO performance.</DialogDescription>
                    </DialogHeader>

                    {/* Add a close button specifically for better UX if top clipping occurs */}
                    <button
                        onClick={() => setShowRankingModal(false)}
                        className="absolute right-4 top-4 z-50 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all md:hidden"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
                        {/* Left Side: Overview */}
                        <div className={cn(
                            "w-full md:w-1/3 p-6 md:p-10 flex flex-col justify-between text-white transition-all duration-500 overflow-y-auto custom-scrollbar shrink-0",
                            rankingData?.category === 'GREEN' && "bg-linear-to-br from-emerald-500 to-teal-600",
                            rankingData?.category === 'ORANGE' && "bg-linear-to-br from-amber-400 to-orange-500",
                            rankingData?.category === 'RED' && "bg-linear-to-br from-rose-500 to-red-600"
                        )}>
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                        <TrendingUp size={28} />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">SEO Audit</h2>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-7xl font-black tracking-tighter leading-none">
                                        {rankingData?.score.toFixed(0)}
                                        <span className="text-3xl font-normal opacity-60 ml-1">/100</span>
                                    </div>
                                    <p className="text-xl font-black tracking-widest opacity-90">{rankingData?.categoryLabel || rankingData?.category}</p>
                                </div>

                                <div className="pt-4 space-y-4">
                                    <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2">Focus Keyword</p>
                                        <p className="font-bold text-lg leading-tight italic break-words">&quot;{rankingData?.keyword}&quot;</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 mt-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                        <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Words</p>
                                        <p className="text-xl font-black">{rankingData?.stats.totalWords}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                        <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Density</p>
                                        <p className="text-xl font-black">{rankingData?.stats.density}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRankingModal(false)}
                                    className="w-full py-4 bg-white text-[#32324d] rounded-2xl font-black text-sm shadow-xl hover:shadow-white/20 hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-widest"
                                >
                                    Done
                                </button>
                            </div>
                        </div>

                        {/* Right Side: Detailed Breakdown */}
                        <div className="flex-1 overflow-y-auto bg-[#f6f6f9] p-6 md:p-10 custom-scrollbar">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-black text-[#32324d] tracking-tight">Performance Breakdown</h3>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Real-time Data</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {rankingData?.criteria.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setShowRankingModal(false);
                                            setActiveTab(item.tab);
                                        }}
                                        className="bg-white rounded-xl p-5 border border-[#dcdce4] shadow-sm hover:border-[#4945ff] hover:shadow-md transition-all group cursor-pointer active:scale-[0.98]"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#f0f0ff] text-[#4945ff] rounded-lg group-hover:bg-[#4945ff] group-hover:text-white transition-colors">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#32324d] leading-none mb-1">{item.title}</h4>
                                                    <p className="text-xs text-[#666687]">{item.feedback}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-[#32324d]">{item.marks}</span>
                                                <span className="text-[10px] text-[#a5a5ba] ml-1">/ {item.max}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-1.5 w-full bg-[#f0f0ff] rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        (item.marks / item.max) > 0.8 ? "bg-emerald-500" : (item.marks / item.max) > 0.5 ? "bg-amber-500" : "bg-rose-500"
                                                    )}
                                                    style={{ width: `${(item.marks / item.max) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <p className="text-[#a5a5ba] font-medium uppercase tracking-wider">{item.details}</p>
                                                <p className={cn(
                                                    "font-bold uppercase tracking-wider",
                                                    (item.marks / item.max) > 0.8 ? "text-emerald-500" : (item.marks / item.max) > 0.5 ? "text-amber-500" : "text-rose-500"
                                                )}>
                                                    {((item.marks / item.max) * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-[#dcdce4] flex items-center justify-between text-[#666687] text-[10px] font-medium uppercase tracking-widest">
                                <p>Report: {new Date().toLocaleDateString()}</p>
                                <div className="flex items-center gap-1 text-[#4945ff]">
                                    <Info size={12} /> Optimization Engine
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

//




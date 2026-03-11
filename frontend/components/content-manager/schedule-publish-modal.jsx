'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Check } from 'lucide-react';

export function SchedulePublishModal({ isOpen, onClose, onSchedule }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#32324d]/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl border border-[#dcdce4] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#f6f6f9] flex justify-between items-center bg-[#fcfcfd]">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#f0f0ff] rounded-lg">
                            <Calendar size={18} className="text-[#4945ff]" />
                        </div>
                        <h3 className="font-bold text-[#32324d]">Schedule Publication</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#f6f6f9] rounded-full text-[#666687] transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    <p className="text-sm text-[#666687] leading-relaxed">
                        Pick a date and time when you want this entry to be automatically published.
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#666687] uppercase tracking-wider flex items-center gap-2">
                                <Calendar size={12} /> Publication Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#fcfcfd] border border-[#dcdce4] rounded-lg focus:border-[#4945ff] focus:ring-1 focus:ring-[#4945ff] outline-none transition-all text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#666687] uppercase tracking-wider flex items-center gap-2">
                                <Clock size={12} /> Publication Time
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#fcfcfd] border border-[#dcdce4] rounded-lg focus:border-[#4945ff] focus:ring-1 focus:ring-[#4945ff] outline-none transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[#fcfcfd] border-t border-[#f6f6f9] flex justify-end gap-3 font-bold">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm text-[#32324d] bg-white border border-[#dcdce4] rounded-lg hover:bg-[#f6f6f9] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (date && time) {
                                onSchedule(date, time);
                                onClose();
                            }
                        }}
                        disabled={!date || !time}
                        className="px-6 py-2 text-sm bg-[#4945ff] text-white rounded-lg hover:bg-[#271fe0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                    >
                        <Check size={16} /> Schedule
                    </button>
                </div>
            </div>
        </div>
    );
}

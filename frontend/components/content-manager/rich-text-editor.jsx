import React from 'react';
import { cn } from '@/lib/utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';

export const RichTextEditor = ({ value, onChange, onFocus, onEditorReady, className, placeholder }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Link.configure({
                openOnClick: false,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder: placeholder || 'Write something amazing...',
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        onFocus: ({ editor }) => {
            if (onFocus) onFocus(editor);
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm focus:outline-none min-h-[150px] px-3 py-2 text-[13px] text-[#32324d] leading-relaxed max-w-none [&_p]:text-[13px] [&_p]:my-1',
                    className // Pass the custom class here
                ),
            },
        },
    });

    // Expose editor instance to parent for external toolbar control
    React.useEffect(() => {
        if (editor && onEditorReady) {
            onEditorReady(editor);
        }
    }, [editor, onEditorReady]);

    // Update content if value changes externally
    React.useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            if (editor.isEmpty && value === "") return;
            // editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div className="border border-[#dcdce4] rounded-md bg-white overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-[#4945ff] focus-within:border-[#4945ff] transition-all">
            <EditorContent editor={editor} />
        </div>
    );
};
//comit
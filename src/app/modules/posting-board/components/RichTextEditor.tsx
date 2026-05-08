import React, { useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Bold, Italic, Link, List, ListOrdered, Pilcrow } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string, plainText: string) => void;
  placeholder?: string;
  error?: boolean;
  minHeightClassName?: string;
}

const sanitizeHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  error,
  minHeightClassName = 'min-h-[180px]',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = () => {
    const html = sanitizeHtml(editorRef.current?.innerHTML || '');
    const plainText = editorRef.current?.innerText || '';
    onChange(html, plainText);
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const addLink = () => {
    const url = window.prompt('Paste link URL');
    if (!url) return;
    runCommand('createLink', url);
  };

  return (
    <div className={`rounded-md border bg-white ${error ? 'border-destructive' : 'border-input'}`}>
      <div className="flex flex-wrap items-center gap-1 border-b bg-slate-50 px-2 py-2">
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => runCommand('bold')} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => runCommand('italic')} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => runCommand('formatBlock', 'p')} title="Paragraph">
          <Pilcrow className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => runCommand('insertUnorderedList')} title="Bulleted list">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => runCommand('insertOrderedList')} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={addLink} title="Link">
          <Link className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        className={`${minHeightClassName} rich-text-editor w-full px-3 py-2 text-sm leading-relaxed outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]`}
      />
    </div>
  );
}

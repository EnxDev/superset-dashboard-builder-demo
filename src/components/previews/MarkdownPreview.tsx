import { useState, useRef, useEffect } from 'react';

interface Props {
  content?: string;
  onContentChange?: (content: string) => void;
  readOnly?: boolean;
}

export default function MarkdownPreview({ content, onContentChange, readOnly }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(content ?? '');
  }, [content]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  const handleBlur = () => {
    setEditing(false);
    if (draft !== (content ?? '') && onContentChange) {
      onContentChange(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDraft(content ?? '');
      setEditing(false);
    }
    // Stop propagation so dnd-kit/parent handlers don't interfere
    e.stopPropagation();
  };

  if (editing && !readOnly) {
    return (
      <textarea
        ref={textareaRef}
        className="markdown-editor"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="Type markdown here..."
      />
    );
  }

  const displayContent = content?.trim();

  return (
    <div
      className="markdown-display"
      onClick={(e) => {
        if (!readOnly) {
          e.stopPropagation();
          setEditing(true);
        }
      }}
      onPointerDown={(e) => { if (!readOnly) e.stopPropagation(); }}
    >
      {displayContent ? (
        <div className="markdown-display__content">{displayContent}</div>
      ) : (
        <div className="markdown-display__placeholder">
          Click to edit markdown...
        </div>
      )}
    </div>
  );
}

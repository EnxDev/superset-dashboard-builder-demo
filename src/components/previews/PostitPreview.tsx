import { useState, useRef, useEffect } from 'react';

interface Props {
  content?: string;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  readOnly?: boolean;
  onContentChange?: (content: string) => void;
}

export default function PostitPreview({ content, bgColor, textColor, fontSize, readOnly, onContentChange }: Props) {
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
    e.stopPropagation();
  };

  const style: React.CSSProperties = {
    background: bgColor || '#fff9c4',
    color: textColor || '#5d4037',
    fontSize: fontSize ?? 14,
  };

  if (editing && !readOnly) {
    return (
      <textarea
        ref={textareaRef}
        className="postit-editor"
        style={style}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="Write something..."
      />
    );
  }

  const displayContent = content?.trim();

  return (
    <div
      className="postit-display"
      style={style}
      onClick={(e) => {
        if (!readOnly) {
          e.stopPropagation();
          setEditing(true);
        }
      }}
      onPointerDown={(e) => { if (!readOnly) e.stopPropagation(); }}
    >
      {displayContent ? (
        <div className="postit-display__content">{displayContent}</div>
      ) : (
        <div className="postit-display__placeholder">
          Click to write...
        </div>
      )}
    </div>
  );
}

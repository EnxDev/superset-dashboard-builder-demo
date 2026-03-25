import { useState, useRef, useEffect } from 'react';

interface Props {
  text?: string;
  textColor?: string;
  fontSize?: number;
  bold?: boolean;
  readOnly?: boolean;
  onTextChange?: (text: string) => void;
}

export default function LabelPreview({ text, textColor, fontSize, bold, readOnly, onTextChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(text ?? '');
  }, [text]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== (text ?? '') && onTextChange) {
      onTextChange(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { commit(); }
    if (e.key === 'Escape') { setDraft(text ?? ''); setEditing(false); }
    e.stopPropagation();
  };

  const style: React.CSSProperties = {
    color: textColor || 'var(--color-text)',
    fontSize: fontSize ?? 13,
    fontWeight: bold ? 600 : 400,
  };

  if (editing && !readOnly) {
    return (
      <div className="label-preview" style={style}>
        <input
          ref={inputRef}
          className="label-preview__input"
          style={style}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Type label..."
        />
      </div>
    );
  }

  return (
    <div
      className="label-preview"
      style={style}
      onClick={(e) => {
        if (!readOnly) { e.stopPropagation(); setEditing(true); }
      }}
      onPointerDown={(e) => { if (!readOnly) e.stopPropagation(); }}
    >
      {text?.trim() || <span className="label-preview__placeholder">Click to type...</span>}
    </div>
  );
}

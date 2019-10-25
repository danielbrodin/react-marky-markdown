import React from 'react';
import { useEditor } from './hooks/useEditor';

interface MentionData {
  value: string | number;
  label: string;
}

interface MarkdownMentionProps {
  prefix: string;
  data: MentionData[];
  onSearch?(value: string): void;
}

export const Mention: React.FC<MarkdownMentionProps> = ({
  prefix,
  data,
  onSearch
}) => {
  const { state, dispatch, editorRef } = useEditor();
  const { currentWord, valueUpToStart, value } = state.editor;
  const { width } = state;
  const show: boolean = currentWord[0] === prefix;
  const [[x, y], setPosition] = React.useState<[number, number]>([0, 0]);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const withoutPrefix = currentWord.replace(prefix, '');

  const filtered = data.filter(item =>
    `${item.value}${item.label}`.includes(withoutPrefix)
  );

  React.useEffect(() => {
    if (show && onSearch) {
      onSearch(withoutPrefix);
    }
  }, [show, withoutPrefix, onSearch]);

  // @ts-ignore noImplicitReturns
  React.useEffect(() => {
    const editor = editorRef.current;

    if (show && editor) {
      const div = document.createElement('div');
      const indicatorData = valueUpToStart.split(/\n\r?/g);
      const span = document.createElement('span');
      div.classList.add('rmm-editor');
      div.style.cssText = `max-width: ${width}px; position: absolute; opacity: 0; color: transparent; pointer-events: none; white-space: pre-wrap;`;
      span.innerHTML = '&nbsp;';
      span.style.position = 'absolute';
      div.innerHTML = indicatorData.join('<br />');
      div.append(span);
      document.body.appendChild(div);
      setPosition([span.offsetLeft, span.offsetTop + span.clientHeight + 2]);

      return () => document.body.removeChild(div);
    }
  }, [show, width, editorRef, valueUpToStart]);

  // @ts-ignore noImplicitReturns
  React.useEffect(() => {
    const editor = editorRef.current;
    if (show) {
      if (selectedIndex > filtered.length) {
        setSelectedIndex(0);
      }
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          const selectedValue = filtered[selectedIndex] || filtered[0];
          if (!selectedValue) {
            return;
          }
          const node = event.target as HTMLTextAreaElement;
          const valueUpToValue =
            value.slice(0, node.selectionStart - currentWord.length) +
            `${prefix}${selectedValue.value} `;
          const updatedValue =
            valueUpToValue + value.slice(node.selectionStart, value.length);
          const start: number = valueUpToValue.length;
          const end: number = valueUpToValue.length;
          node.value = updatedValue;
          node.setSelectionRange(start, end);
          event.stopPropagation();
          event.preventDefault();

          dispatch({
            type: 'EditorData',
            payload: node
          });
          setSelectedIndex(0);
        }
        if (event.key === 'ArrowUp') {
          setSelectedIndex(current =>
            Math.abs((current - 1) % filtered.length)
          );
          event.preventDefault();
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex(current =>
            Math.abs((current + 1) % filtered.length)
          );
          event.preventDefault();
        }
      };
      if (editor) {
        editor.addEventListener('keydown', handleKeyDown, false);
        return () => {
          editor.removeEventListener('keydown', handleKeyDown, false);
        };
      }
    }
  }, [
    show,
    currentWord,
    value,
    prefix,
    filtered,
    selectedIndex,
    dispatch,
    editorRef
  ]);

  if (!show) {
    return null;
  }

  return (
    <div
      className="rmm-list"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {filtered.map((value, index) => (
        <div
          key={value.value}
          className={`rmm-list-item ${index === selectedIndex &&
            'rmm-list-item-selected'}`}
        >
          {value.label}
        </div>
      ))}
    </div>
  );
};

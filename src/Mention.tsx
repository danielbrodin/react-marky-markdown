import * as React from 'react';
import { useEditor } from './hooks/useEditor';

interface MentionData {
  value: string | number;
  label: string;
}

export interface MentionProps {
  prefix: string;
  data: MentionData[];
  onSearch?(value: string): void;
  maxItems?: number;
}

function fuzzySearch(needle: string, haystack: string): boolean {
  if (needle.length > haystack.length) {
    return false;
  }

  outer: for (let i = 0, j = 0; i < needle.length; i++) {
    const nch = needle.charCodeAt(i);
    while (j < haystack.length) {
      if (haystack.charCodeAt(j++) === nch) {
        continue outer;
      }
    }
    return false;
  }

  return true;
}

export const Mention: React.FC<MentionProps> = ({
  prefix,
  data,
  onSearch,
  maxItems,
}) => {
  const { state, dispatch, editorRef } = useEditor();
  const { currentWord, valueUpToStart, value } = state.editor;
  const { width } = state;
  const show: boolean = currentWord[0] === prefix;
  const [[x, y], setPosition] = React.useState<[number, number]>([0, 0]);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const withoutPrefix = currentWord.replace(prefix, '');
  const [forceHide, setForceHide] = React.useState<boolean>(false);

  const filtered = data
    .filter(item =>
      fuzzySearch(
        withoutPrefix.toLowerCase(),
        `${item.value}${item.label}`.toLowerCase()
      )
    )
    .slice(0, maxItems);

  React.useEffect(() => {
    setForceHide(false);
  }, [withoutPrefix]);

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
      div.style.cssText = `max-width: ${width}px; position: absolute; top: 0; left: -9999px; opacity: 0; color: transparent; pointer-events: none; white-space: pre-wrap;`;
      span.innerHTML = '&nbsp;';
      span.style.position = 'absolute';
      div.innerHTML = indicatorData.join('<br />');
      div.append(span);
      document.body.appendChild(div);
      setPosition([span.offsetLeft, span.offsetTop + span.clientHeight + 2]);

      return () => document.body.removeChild(div);
    }
  }, [show, width, editorRef, valueUpToStart]);

  const insertValue = React.useCallback(
    (node: HTMLTextAreaElement, selectedValue: MentionData) => {
      const valueUpToValue =
        value.slice(0, node.selectionStart - currentWord.length) +
        `${prefix}${selectedValue.value} `;
      const updatedValue =
        valueUpToValue + value.slice(node.selectionStart, value.length);
      const start: number = valueUpToValue.length;
      const end: number = valueUpToValue.length;
      node.value = updatedValue;
      node.setSelectionRange(start, end);

      dispatch({
        type: 'EditorData',
        payload: node,
      });
      setSelectedIndex(0);
    },
    [currentWord.length, dispatch, prefix, value]
  );

  // @ts-ignore noImplicitReturns
  React.useEffect(() => {
    const editor = editorRef.current;
    if (show) {
      if (selectedIndex > filtered.length) {
        setSelectedIndex(0);
      }
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setForceHide(true);
        }
        if (event.key === 'Enter') {
          const selectedValue = filtered[selectedIndex] || filtered[0];
          if (!selectedValue) {
            return;
          }
          const node = event.target as HTMLTextAreaElement;
          insertValue(node, selectedValue);
          event.stopPropagation();
          event.preventDefault();
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
    editorRef,
    insertValue,
  ]);

  if (!show || !editorRef.current || forceHide) {
    return null;
  }

  const handleItemClick = (data: MentionData) => () => {
    if (editorRef.current) {
      insertValue(editorRef.current, data);
      editorRef.current.focus();
    }
  };

  return (
    <div
      className="rmm-list"
      style={{
        transform: `translate(${x}px, ${y - editorRef.current.scrollTop}px)`,
      }}
    >
      {filtered.map((item, index) => (
        <div
          key={item.value}
          role="button"
          className={`rmm-list-item ${index === selectedIndex &&
            'rmm-list-item-selected'}`}
          onMouseOver={() => setSelectedIndex(index)}
          onClick={handleItemClick(item)}
        >
          <b>{item.value}</b> {item.label}
        </div>
      ))}
    </div>
  );
};

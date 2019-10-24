import React from 'react';
import TextareaAutosize from 'react-autosize-textarea';
import { useMeasure } from './hooks/useMeasure';
import { useOnClickOutside } from './hooks/useOnClickOutside';
import "./styles.css";

interface EditorProps {
  defaultValue?: string;
  onChange?(value: string): void;
  onSubmit?(): void;
  onBlur?(): void;
  onCancel?(): void;
}

interface EditorData {
  currentWord: string;
  value: string;
  valueUpToStart: string;
}

interface State {
  editor: EditorData;
  width: number;
  height: number;
}

type EditorDataAction = {
  type: 'EditorData';
  payload: HTMLTextAreaElement;
};
type EditorSizeAction = {
  type: 'EditorSize';
  payload: { width: number; height: number };
};
type TabAction = {
  type: 'AddTab';
  payload: HTMLTextAreaElement;
};
type ListItemAction = {
  type: 'AddListItem';
  payload: {
    el: HTMLTextAreaElement;
    type: 'ul' | 'ol';
  };
};

type Action = EditorDataAction | EditorSizeAction | TabAction | ListItemAction;

function getEditorData(
  el: HTMLTextAreaElement,
  insertValue?: string
): EditorData {
  let value = el.value;
  let start = el.selectionStart;
  const valueUpToStart = value.substr(0, start);

  if (insertValue) {
    const valueAfter = value.substr(start, value.length);
    start = (valueUpToStart + insertValue).length;
    value = valueUpToStart + insertValue + valueAfter;
    el.value = value;
    el.setSelectionRange(start, start);
  }

  const currentWord = getWordAtPosition(value, start);

  return {
    value,
    currentWord,
    valueUpToStart
  };
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'EditorData':
      return {
        ...state,
        editor: {
          ...getEditorData(action.payload)
        }
      };
    case 'EditorSize':
      return {
        ...state,
        ...action.payload
      };
    case 'AddTab':
      const tabValue = '  ';

      return {
        ...state,
        editor: {
          ...getEditorData(action.payload, tabValue)
        }
      };
    case 'AddListItem':
      let listValue = '\n- ';

      if (action.payload.type === 'ol') {
        const row = getRowAtPosition(
          action.payload.el.value,
          action.payload.el.selectionStart
        );
        const listIndex = parseFloat(row.substr(0, 3));
        if (listIndex === 1) {
          listValue = '\n1. ';
        } else {
          listValue = `\n${listIndex + 1}. `;
        }
      }

      return {
        ...state,
        editor: {
          ...getEditorData(action.payload.el, listValue)
        }
      };
    default:
      return state;
  }
}

const initialState: State = {
  editor: {
    currentWord: '',
    value: '',
    valueUpToStart: ''
  },
  width: 0,
  height: 0
};

export interface EditorContextValues {
  state: State;
  dispatch(action: Action): void;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const EditorContet = React.createContext<
  EditorContextValues | undefined
>(undefined);

function getWordAtPosition(value: string, position: number): string {
  let letterIndex = 0;
  const words = value.replace(/\n/g, ' ').split(' ');

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    letterIndex += word.length;
    if (letterIndex >= position) {
      return word.replace(/\r?\n|\r/g, '').trim();
    }

    letterIndex += 1;
  }

  return '';
}

function getRowAtPosition(value: string, position: number): string {
  let letterIndex = 0;
  const rows = value.split(/\n/g);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    letterIndex += row.length;
    if (letterIndex >= position) {
      return row;
    }
    letterIndex += 1;
  }

  return '';
}

export const Editor: React.FC<EditorProps> = ({
  defaultValue,
  onChange,
  onSubmit,
  onBlur,
  onCancel,
  children
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const editorRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [state, dispatch] = React.useReducer(reducer, initialState, initial => {
    return {
      ...initial,
      value: defaultValue || ''
    };
  });
  const { width, height } = useMeasure(editorRef);
  useOnClickOutside(containerRef, () => {
    if (onBlur) {
      onBlur();
    }
  });

  React.useEffect(() => {
    dispatch({ type: 'EditorSize', payload: { width, height } });
  }, [width, height]);

  // @ts-ignore noImplicitReturns
  React.useEffect(() => {
    const editor = editorRef.current;

    if (editor) {
      const handleKeyEvent = (event: KeyboardEvent) => {
        if (
          event.key === 'Enter' &&
          (event.metaKey || event.ctrlKey) &&
          onSubmit
        ) {
          onSubmit();
        }
        if (event.key === 'Escape' && onCancel) {
          onCancel();
        }
        if (event.key === 'Enter') {
          const row = getRowAtPosition(editor.value, editor.selectionStart);
          const rowStartingChar = row.substr(0, 2);
          const olRegex = new RegExp(/^[0-9]. /);
          const isUL = rowStartingChar === '- ';
          const isOL = olRegex.test(row);
          if (isUL || isOL) {
            dispatch({
              type: 'AddListItem',
              payload: {
                el: editor,
                type: isUL ? 'ul' : 'ol'
              }
            });
            event.preventDefault();
          }
        }
        if (event.key === 'Tab') {
          event.preventDefault();

          dispatch({ type: 'AddTab', payload: editor });
        }
      };

      const handleBlur = () => {
        if (onBlur) {
          onBlur();
        }
      };

      editor.addEventListener('keydown', handleKeyEvent, false);
      editor.addEventListener('blur', handleBlur, false);

      return () => {
        editor.removeEventListener('keydown', handleKeyEvent, false);
        editor.removeEventListener('blur', handleBlur, false);
      };
    }
  }, [onSubmit, onCancel, onBlur]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedValue = event.target.value;
    const node = editorRef.current;

    if (!node) {
      return;
    }

    dispatch({
      type: 'EditorData',
      payload: node
    });

    if (onChange) {
      onChange(updatedValue);
    }
  };

  return (
    <EditorContet.Provider value={{ state, dispatch, editorRef }}>
      <div ref={containerRef} className="kaktus-container">
        <TextareaAutosize
          ref={editorRef}
          className="kaktus-editor"
          wrap="hard"
          onChange={handleChange}
          value={state.editor.value}
        />
        {children}
      </div>
    </EditorContet.Provider>
  );
};

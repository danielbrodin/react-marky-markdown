import * as React from 'react';
import TextareaAutosize from 'react-autosize-textarea';
import { useMeasure } from './hooks/useMeasure';
import { useOnClickOutside } from './hooks/useOnClickOutside';
import { getWordAtPosition, getRowAtPosition, isCtrlCmd } from './helpers';

type TextAreaProps = Omit<React.HTMLProps<HTMLTextAreaElement>, 'onChange'>;

interface EditorProps extends TextAreaProps {
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
type BoldAction = {
  type: 'ToggleBold';
  payload: HTMLTextAreaElement;
};
type ItalicAction = {
  type: 'ToggleItalic';
  payload: HTMLTextAreaElement;
};

type Action =
  | EditorDataAction
  | EditorSizeAction
  | TabAction
  | ListItemAction
  | BoldAction
  | ItalicAction;

function toggleWordWrap(el: HTMLTextAreaElement, value: string): EditorData {
  const caretStartingPosition: number = el.selectionStart;
  const caretEndingPosition: number = el.selectionEnd;
  const hasSelection: boolean = caretStartingPosition !== caretEndingPosition;
  let [word, startPosition, endPosition] = [
    '',
    caretStartingPosition,
    caretEndingPosition,
  ];

  if (hasSelection) {
    word = el.value.substr(caretStartingPosition, caretEndingPosition);
  } else {
    [word, startPosition, endPosition] = getWordAtPosition(
      el.value,
      caretStartingPosition
    );
  }

  const firstChars = word.substr(0, value.length);
  const lastChars = word.substr(-value.length);
  const beforeWord = el.value.substr(0, startPosition);
  const afterWord = el.value.substr(endPosition, el.value.length);

  if (firstChars !== value || lastChars !== value) {
    el.value = `${beforeWord}${value}${word}${value}${afterWord}`;

    el.setSelectionRange(
      caretStartingPosition + value.length,
      caretEndingPosition + value.length
    );
    return getEditorData(el);
  } else {
    const updatedWord = word.substr(
      value.length,
      word.length - value.length * 2
    );
    el.value = `${beforeWord}${updatedWord}${afterWord}`;
    el.setSelectionRange(
      caretStartingPosition - value.length,
      caretEndingPosition - value.length
    );
    return getEditorData(el);
  }

  return getEditorData(el);
}

function getEditorData(
  el: HTMLTextAreaElement,
  insertStart?: string,
  insertEnd?: string
): EditorData {
  const caretStartingPosition: number = el.selectionStart;
  const caretEndingPosition: number = el.selectionEnd;
  const hasSelected: boolean = caretStartingPosition !== caretEndingPosition;
  let value: string = el.value;
  let caretStart: number = el.selectionStart;
  let caretEnd: number = el.selectionEnd;
  let valueUpToStart = value.substr(0, caretStart);

  if (insertStart) {
    const valueAfter = value.substr(caretStart, value.length);
    caretStart = (valueUpToStart + insertStart).length;
    caretEnd = caretEnd + insertStart.length;
    value = valueUpToStart + insertStart + valueAfter;
    el.value = value;
  }

  if (insertEnd) {
    const valueAfter = value.substr(caretEnd, value.length);
    valueUpToStart = value.substr(0, caretEnd);
    caretEnd = (valueUpToStart + insertEnd).length;
    value = valueUpToStart + insertEnd + valueAfter;
    el.value = value;
  }

  if (insertStart || insertEnd) {
    if (hasSelected) {
      el.setSelectionRange(
        caretStart - (insertStart || '').length,
        caretEnd + (insertEnd || '').length
      );
    } else {
      el.setSelectionRange(caretStart, caretStart);
    }
  }

  const [currentWord] = getWordAtPosition(value, caretStart);

  return {
    value,
    currentWord,
    valueUpToStart,
  };
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'EditorData':
      return {
        ...state,
        editor: {
          ...getEditorData(action.payload),
        },
      };
    case 'EditorSize':
      return {
        ...state,
        ...action.payload,
      };
    case 'AddTab':
      const tabValue = '  ';

      return {
        ...state,
        editor: {
          ...getEditorData(action.payload, tabValue),
        },
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
          ...getEditorData(action.payload.el, listValue),
        },
      };
    case 'ToggleBold':
      return {
        ...state,
        editor: {
          ...toggleWordWrap(action.payload, '**'),
        },
      };
    case 'ToggleItalic':
      return {
        ...state,
        editor: {
          ...toggleWordWrap(action.payload, '_'),
        },
      };
    default:
      return state;
  }
}

const initialState: State = {
  editor: {
    currentWord: '',
    value: '',
    valueUpToStart: '',
  },
  width: 0,
  height: 0,
};

export interface EditorContextValues {
  state: State;
  dispatch(action: Action): void;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const EditorContet = React.createContext<
  EditorContextValues | undefined
>(undefined);

export const Editor: React.FC<EditorProps> = ({
  defaultValue,
  onChange,
  onSubmit,
  onBlur,
  onCancel,
  children,
  ...rest
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const editorRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [state, dispatch] = React.useReducer(reducer, initialState, initial => {
    return {
      ...initial,
      editor: {
        ...initial.editor,
        value: defaultValue || '',
      },
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
        const CtrlCmd: boolean = isCtrlCmd(event);

        if (CtrlCmd && event.key === 'Enter' && onSubmit) {
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
                type: isUL ? 'ul' : 'ol',
              },
            });
            event.preventDefault();
          }
        }
        if (event.key === 'Tab') {
          event.preventDefault();

          dispatch({ type: 'AddTab', payload: editor });
        }
        if (CtrlCmd && event.key === 'b') {
          dispatch({ type: 'ToggleBold', payload: editor });
        }
        if (CtrlCmd && event.key === 'i') {
          dispatch({ type: 'ToggleItalic', payload: editor });
        }
      };

      editor.addEventListener('keydown', handleKeyEvent, false);

      return () => {
        editor.removeEventListener('keydown', handleKeyEvent, false);
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
      payload: node,
    });

    if (onChange) {
      onChange(updatedValue);
    }
  };

  return (
    <EditorContet.Provider value={{ state, dispatch, editorRef }}>
      <div ref={containerRef} className="rmm-container">
        <TextareaAutosize
          {...rest}
          ref={editorRef}
          className="rmm-editor"
          wrap="hard"
          onChange={handleChange}
          value={state.editor.value}
        />
        {children}
      </div>
    </EditorContet.Provider>
  );
};

import * as React from 'react';
import TextareaAutosize from 'react-autosize-textarea';
import { useMeasure } from './hooks/useMeasure';
import { useOnClickOutside } from './hooks/useOnClickOutside';
import {
  getWordAtPosition,
  getRowAtPosition,
  isCtrlCmd,
  toggleWordWrap,
  getRows,
} from './helpers';

type TextAreaProps = Omit<TextareaAutosize.Props, 'onChange'>;

interface EditorProps extends TextAreaProps {
  defaultValue?: string;
  disableFormatting?: boolean;
  singleLine?: boolean;
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
type ClearListAction = {
  type: 'ClearList';
  payload: HTMLTextAreaElement;
};
type BoldAction = {
  type: 'ToggleBold';
  payload: HTMLTextAreaElement;
};
type ItalicAction = {
  type: 'ToggleItalic';
  payload: HTMLTextAreaElement;
};
type EncloseAction = {
  type: 'Enclose';
  payload: {
    el: HTMLTextAreaElement;
    type: '[' | '(' | '{';
  };
};

type Action =
  | EditorDataAction
  | EditorSizeAction
  | TabAction
  | ListItemAction
  | ClearListAction
  | BoldAction
  | ItalicAction
  | EncloseAction;

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
    case 'ClearList':
      const { rows, currentIndex } = getRows(
        action.payload.value,
        action.payload.selectionStart
      );
      const updatedRows = [...rows];
      updatedRows[currentIndex] = '';

      action.payload.value = updatedRows.join('\n');

      return {
        ...state,
        editor: {
          ...getEditorData(action.payload),
        },
      };
    case 'ToggleBold':
      return {
        ...state,
        editor: {
          ...getEditorData(toggleWordWrap(action.payload, '**')),
        },
      };
    case 'ToggleItalic':
      return {
        ...state,
        editor: {
          ...getEditorData(toggleWordWrap(action.payload, '_')),
        },
      };
    case 'Enclose':
      const [currentWord, , currentWordEnd] = getWordAtPosition(
        action.payload.el.value,
        action.payload.el.selectionStart,
        action.payload.el.selectionEnd
      );
      const startChar = action.payload.type;
      const endChar = startChar === '[' ? ']' : startChar === '(' ? ')' : '}';

      if (
        action.payload.el.selectionStart !== action.payload.el.selectionEnd ||
        currentWord === startChar
      ) {
        return {
          ...state,
          editor: {
            ...getEditorData(action.payload.el, startChar, endChar),
          },
        };
      } else if (currentWordEnd === action.payload.el.selectionEnd) {
        return {
          ...state,
          editor: {
            ...getEditorData(action.payload.el, startChar, endChar),
          },
        };
      }

      return {
        ...state,
        editor: {
          ...getEditorData(action.payload.el, action.payload.type),
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
  disableFormatting,
  singleLine,
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
          if (!disableFormatting) {
            const row = getRowAtPosition(editor.value, editor.selectionStart);
            const rowStartingChar = row.substr(0, 2);
            const olRegex = new RegExp(/^[0-9]. /);
            const isUL = rowStartingChar === '- ';
            const isOL = olRegex.test(row);

            if (isUL || isOL) {
              if (
                (isUL && row === rowStartingChar) ||
                (isOL && row.substr(0, 3) === row)
              ) {
                dispatch({ type: 'ClearList', payload: editor });
                return;
              }

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
          if (singleLine) {
            event.preventDefault();
          }
        }
        if (!disableFormatting) {
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
          if (['[', '(', '{'].includes(event.key)) {
            dispatch({
              type: 'Enclose',
              payload: {
                el: editor,
                type: event.key as '[' | '(' | '{',
              },
            });
            event.preventDefault();
          }
        }
      };

      editor.addEventListener('keydown', handleKeyEvent, false);

      return () => {
        editor.removeEventListener('keydown', handleKeyEvent, false);
      };
    }
  }, [onSubmit, onCancel, onBlur, disableFormatting, singleLine]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({
      type: 'EditorData',
      payload: event.target,
    });
  };

  React.useEffect(() => {
    if (onChange) {
      onChange(state.editor.value);
    }
  }, [onChange, state.editor.value]);

  return (
    <EditorContet.Provider value={{ state, dispatch, editorRef }}>
      <div data-testid="container" ref={containerRef} className="rmm-container">
        <TextareaAutosize
          {...rest}
          data-testid="textarea"
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

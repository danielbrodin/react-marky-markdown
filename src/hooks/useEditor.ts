import * as React from 'react';
import { EditorContextValues, EditorContet } from '../Editor';

export function useEditor(): EditorContextValues {
  const context = React.useContext(EditorContet);

  if (!context) {
    throw new Error('Component has to be wrapped inside <Editor />');
  }

  return context;
}

# React Marky Markdown

A clean markdown editor for react.

Currently in beta. Like this readme :)

## Usage

`yarn add react-marky-markdown`

```js
import { Editor, Mention } from 'react-marky-markdown';

const App = () => {
  return (
    <Editor>
      <Mention
        prefix="@"
        data={[
          { value: 'terminator', label: 'Arnold Schwarzenegger' },
          { value: 'markymark', label: 'Mark wahlberg' },
        ]}
      />
    </Editor>
  );
};
```

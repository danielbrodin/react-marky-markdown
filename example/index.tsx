import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Editor, Mention } from '../src';

const App = () => {
  const [users, setUsers] = React.useState([
    { value: 'terminator', label: 'Arnold Schwarzenegger' },
    { value: 'markymark', label: 'Mark wahlberg' },
    { value: 'aretha', label: 'Aretha Franklin' },
  ]);
  const [labels, setLabels] = React.useState([
    { value: 1, label: 'One' },
    { value: 2, label: 'Two' },
    { value: 3, label: 'Three' },
  ]);

  return (
    <div className="container">
      <div className="header">
        <h1>React Marky Markdown</h1>
        <p>
          Currently has <b>#</b> and <b>@</b> implemented
        </p>
      </div>
      <div className="editor-container">
        <Editor>
          <Mention prefix="@" data={users} />
          <Mention prefix="#" data={labels} />
        </Editor>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

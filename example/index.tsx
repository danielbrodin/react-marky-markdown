import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Editor, Mention } from '../.';

const App = () => {
  const [users, setUsers] = React.useState(['quentin', 'rodrigo', 'bernie']);

  const handleSearchUsers = React.useCallback((value: string) => {
    function fakeSearch() {
      setTimeout(() => {
        setUsers(['quentin', 'rodrigo', 'bernie', 'arnold', 'aretha']);
      }, 500);
    }

    if (value.includes('ar')) {
      fakeSearch();
    }
  }, []);

  return (
    <div>
      <Editor>
        <Mention prefix="@" data={users} onSearch={handleSearchUsers} />
        <Mention
          prefix="#"
          data={['label-1', 'label-2', 'label-3', 'label-4', 'label-5']}
        />
      </Editor>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

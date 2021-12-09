import React from 'react';
import Sudoku from './components/Sudoku';

function App() {
  return (
    <div className="App" onKeyPress={(e) => {console.log(e);}}>
      <Sudoku />
    </div>
  );
}

export default App;

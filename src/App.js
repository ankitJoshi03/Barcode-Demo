import React from 'react';
import HelloWorld from './components/HelloWorld.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <img className="App-logo" src={require('./Long.png')} alt="ECSite Logo"></img>
      <HelloWorld title="Barcode Scanner Demo"/>
    </div>
  );
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Modal from 'react-modal/lib/components/Modal';

Modal.setAppElement('#root');

document.getElementById('root').addEventListener('contextmenu', (e) => {
  e.preventDefault();
})

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

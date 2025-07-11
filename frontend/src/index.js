import React from 'react';
import ReactDOM from 'react-dom';
import './assets/index.css';
import App from './App';
import { UserProvider } from './context/UserContext';

ReactDOM.render(
  <UserProvider>
    <App />
  </UserProvider>,
  document.getElementById('root')
); 
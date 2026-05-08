import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('main.jsx: Module loaded');
const rootElement = document.getElementById('root');
console.log('main.jsx: root element found?', !!rootElement);

if (rootElement) {
  console.log('main.jsx: Attempting render');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} else {
  console.error('main.jsx: root element not found!');
}

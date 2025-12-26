import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// biome-ignore lint/style/useNodejsImportProtocol: browser polyfill
import { Buffer}  from 'buffer'
import './index.css'
import 'react-toastify/dist/ReactToastify.css';

window.Buffer = Buffer

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

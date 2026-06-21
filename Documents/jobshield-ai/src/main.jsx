window.addEventListener('error', (e) => {
  document.body.innerHTML = '<pre style="color:white;padding:20px;white-space:pre-wrap;font-size:14px;">ERROR: ' + e.message + '\n\n' + (e.error?.stack || '') + '</pre>';
});
window.addEventListener('unhandledrejection', (e) => {
  document.body.innerHTML = '<pre style="color:white;padding:20px;white-space:pre-wrap;font-size:14px;">PROMISE ERROR: ' + (e.reason?.message || e.reason) + '</pre>';
});
import { from } 'react'
import { createRoot } importrt 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

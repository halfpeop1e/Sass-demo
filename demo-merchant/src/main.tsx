import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './style.css';

const root = createRoot(document.getElementById('app')!);
root.render(
  <HashRouter>
    <App />
  </HashRouter>
);

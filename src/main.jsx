import React from 'react';
import { createRoot } from 'react-dom/client';
import App,{preloadRoute} from './App.jsx';
import {currentRoute} from './router.js';
import './styles.css';

// Pages are prerendered (tools/prerender.mjs): the HTML already holds the page. Load what the route needs first, then
// let React render it in one step, so the visitor never sees the page replaced by a loading screen.
const root=document.getElementById('root');
const start=()=>createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
if(root.firstElementChild)preloadRoute(currentRoute()).catch(()=>{}).then(start);else start();

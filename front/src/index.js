import React from 'react';
import ReactDOM from 'react-dom/client';
import "./index.css"
import App from './App';
import { applyAppSettings, getAppSettings } from "./utils/appSettings";

applyAppSettings(getAppSettings());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


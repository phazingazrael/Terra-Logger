import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { PrismaneProvider } from "@prismane/core";

const root = ReactDOM.createRoot(document.getElementById('root'));
const Paper = {
  spacing: "5px",
  backgroundColor: 'rgba(193, 197, 195, 0.6)',
  padding: "5px"
};
root.render(
  <React.StrictMode>
    <PrismaneProvider>
      <App />
    </PrismaneProvider>
  </React.StrictMode>
);


render();
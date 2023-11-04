import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import "./public/index.css";
import "../node_modules/rpg-awesome/css/rpg-awesome.min.css";


const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#8B97F2',
    },
    secondary: {
      main: '#508CB9',
    },
    text: {
      primary: '#1B1D22',
      secondary: '#8d8d90',
    },
    success: {
      main: '#4da570',
    },
    info: {
      main: '#29414d',
    },
    warning: {
      main: '#cb9438',
    },
    error: {
      main: '#f44336',
    },
    divider: '#29414D',
  },
  palette: {
    type: 'dark',
    primary: {
      main: '#8B97F2',
    },
    secondary: {
      main: '#508CB9',
    },
    success: {
      main: '#4da570',
    },
    info: {
      main: '#29414d',
    },
    warning: {
      main: '#cb9438',
    },
    error: {
      main: '#f44336',
    },
    divider: '#29414D',
  },
});



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
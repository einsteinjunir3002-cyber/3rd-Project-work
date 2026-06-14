import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AppStateProvider } from './context/AppStateContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);



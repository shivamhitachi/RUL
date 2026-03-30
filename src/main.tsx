/**
 * @file      : main.tsx
 * @summary   : 
 * @author    : Charles Best <cbest@nvidia.com>
 * @created   : 2023-12-14
 * @copywrite : 2023 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 * @exports   : main
 */


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import keycloak from './keycloak';

// 1. Get the root element and create the React root ONCE.
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// 2. Render a loading message initially. This is good practice.
root.render(
  <React.StrictMode>
    <div>Loading...</div>
  </React.StrictMode>
);

// 3. Initialize Keycloak
keycloak.init({ onLoad: 'login-required' }).then((authenticated) => {
  if (authenticated) {
    // 4. If authenticated, render the main App component on the SAME root.
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    // This part is rarely reached with 'login-required' because Keycloak handles
    // the redirect. But it's good to have a fallback.
    console.warn('Not authenticated');
    root.render(
      <React.StrictMode>
        <div>Unable to authenticate.</div>
      </React.StrictMode>
    );
  }
}).catch((error) => {
  console.error("Keycloak initialization failed", error);
  root.render(
    <React.StrictMode>
      <div>Error initializing authentication.</div>
    </React.StrictMode>
  );
});

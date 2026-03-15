import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import router from './routers/router.jsx'
import { RouterProvider } from 'react-router-dom'
import AuthProvider from './contexts/AuthProvider.jsx'
import { CartProvider } from './contexts/CartProvider.jsx'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            },
            success: { style: { background: '#f0fdf4', color: '#166534' } },
            error:   { style: { background: '#fef2f2', color: '#991b1b' } },
          }}
        />
        <RouterProvider router={router}></RouterProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)

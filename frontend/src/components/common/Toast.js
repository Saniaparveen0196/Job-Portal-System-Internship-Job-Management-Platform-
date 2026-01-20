import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success', // success, error, warning, info
    title: null,
  });

  const showToast = useCallback((message, type = 'success', title = null) => {
    setToast({
      open: true,
      message,
      type,
      title,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const value = {
    showToast,
    hideToast,
    showSuccess: (message, title) => showToast(message, 'success', title),
    showError: (message, title) => showToast(message, 'error', title),
    showWarning: (message, title) => showToast(message, 'warning', title),
    showInfo: (message, title) => showToast(message, 'info', title),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={hideToast}
          severity={toast.type}
          variant="filled"
          sx={{
            minWidth: 300,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
          }}
        >
          {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

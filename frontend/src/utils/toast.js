// Simple toast notification system
let toastCallback = null;

export const setToastCallback = (callback) => {
  toastCallback = callback;
};

export const toast = {
  success: (message, duration = 3000) => {
    if (toastCallback) toastCallback(message, 'success', duration);
  },
  error: (message, duration = 4000) => {
    if (toastCallback) toastCallback(message, 'error', duration);
  },
  warning: (message, duration = 3500) => {
    if (toastCallback) toastCallback(message, 'warning', duration);
  }
};

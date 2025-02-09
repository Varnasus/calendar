import React from 'react';
import './Toast.css';

function Toast({ message, type = 'success', onClose }) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  return (
    <div className={`toast ${type}`}>
      <i className={`fas ${icons[type]}`}></i>
      <span className="toast-message">{message}</span>
      {onClose && (
        <button className="toast-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
}

export default Toast; 
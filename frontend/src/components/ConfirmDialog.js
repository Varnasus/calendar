import React from 'react';
import './Modal.css';

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <div className="confirm-content">
          <i className="fas fa-exclamation-triangle warning-icon"></i>
          <p>{message}</p>
        </div>
        <div className="confirm-buttons">
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button onClick={onConfirm} className="confirm-button">
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog; 
import React, { useState, useRef, useEffect } from 'react';
import './Modal.css';
import ConfirmDialog from './ConfirmDialog';

function DraggableModal({ children, onClose }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Center modal on mount
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });
    }

    // Add resize listener to keep modal centered and in bounds
    const handleResize = () => {
      if (modalRef.current) {
        const rect = modalRef.current.getBoundingClientRect();
        setPosition(prev => ({
          x: Math.min(prev.x, window.innerWidth - rect.width),
          y: Math.min(prev.y, window.innerHeight - rect.height)
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.modal-header')) {
      e.preventDefault(); // Prevent text selection
      setIsDragging(true);
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      
      // Calculate new position
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Keep modal within viewport bounds
      newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
      newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height));
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleDetach = () => {
    const modalFeatures = 'width=600,height=600,left=200,top=200';
    const newWindow = window.open('', '_blank', modalFeatures);
    
    newWindow.document.write(`
      <html>
        <head>
          <title>Content Details</title>
          <link rel="stylesheet" href="${window.location.origin}/modal.css">
          ${document.head.innerHTML}
        </head>
        <body>
          <div id="modal-root"></div>
        </body>
      </html>
    `);

    const modalContent = modalRef.current.querySelector('.modal-content').cloneNode(true);
    newWindow.document.getElementById('modal-root').appendChild(modalContent);
    onClose();
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className={`modal ${isDragging ? 'dragging' : ''}`}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="modal-header">
          <div className="modal-controls">
            <button 
              className="modal-control-button"
              onClick={handleDetach}
              title="Open in new window"
            >
              <i className="fas fa-external-link-alt"></i>
            </button>
            <button 
              className="modal-control-button"
              onClick={handleClose}
              title="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div className="modal-content">
          {React.cloneElement(children, {
            onFormChange: () => setHasChanges(true)
          })}
        </div>
      </div>
      {showConfirm && (
        <ConfirmDialog
          message="You have unsaved changes. Are you sure you want to close?"
          onConfirm={handleConfirmClose}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

export default DraggableModal; 
import React, { useState } from 'react';
import './SavedViewButton.css';

function SavedViewButton({ onSave, hasActiveFilters }) {
  const [isNaming, setIsNaming] = useState(false);
  const [viewName, setViewName] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (viewName.trim()) {
      onSave(viewName.trim());
      setViewName('');
      setIsNaming(false);
    }
  };

  if (!hasActiveFilters) return null;

  return (
    <div className="saved-view-button">
      {!isNaming ? (
        <button onClick={() => setIsNaming(true)} className="save-view-btn">
          <i className="fas fa-save"></i>
          Save Current View
        </button>
      ) : (
        <form onSubmit={handleSave} className="save-view-form">
          <input
            type="text"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="Enter view name..."
            autoFocus
          />
          <button type="submit">
            <i className="fas fa-check"></i>
          </button>
          <button type="button" onClick={() => setIsNaming(false)}>
            <i className="fas fa-times"></i>
          </button>
        </form>
      )}
    </div>
  );
}

export default SavedViewButton; 
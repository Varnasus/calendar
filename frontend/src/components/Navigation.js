import React, { useState, useEffect } from 'react';
import './Navigation.css';

function Navigation({ preferences, onPreferenceChange }) {
  const [isOpen, setIsOpen] = useState(preferences.navPanelOpen);
  const [isHovering, setIsHovering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [duplicateView, setDuplicateView] = useState(null);
  const [newViewName, setNewViewName] = useState('');

  useEffect(() => {
    if (isHovering) {
      setIsOpen(true);
    }
  }, [isHovering]);

  const handleViewSelect = (viewId) => {
    const view = preferences.savedViews.find(v => v.id === viewId);
    if (view) {
      onPreferenceChange('filters', view.filters);
      onPreferenceChange('activeView', viewId);
    }
  };

  const handleDuplicate = (view) => {
    setDuplicateView(view);
    setNewViewName(`${view.name} (Copy)`);
  };

  const handleConfirmDuplicate = () => {
    if (!newViewName.trim()) return;
    
    const newView = {
      ...duplicateView,
      id: `view-${Date.now()}`,
      name: newViewName.trim(),
      starred: false
    };

    const newViews = [...preferences.savedViews, newView];
    onPreferenceChange('savedViews', newViews);
    setDuplicateView(null);
    setNewViewName('');
  };

  const handleDelete = (viewId) => {
    if (viewId === 'default') return;
    const newViews = preferences.savedViews.filter(v => v.id !== viewId);
    onPreferenceChange('savedViews', newViews);
    if (preferences.activeView === viewId) {
      onPreferenceChange('activeView', 'default');
    }
    setShowConfirmDelete(null);
  };

  const handleToggleStar = (view) => {
    const updatedViews = preferences.savedViews.map(v => 
      v.id === view.id ? { ...v, starred: !v.starred } : v
    );
    onPreferenceChange('savedViews', updatedViews);
  };

  const filteredViews = preferences.savedViews.filter(view => 
    view.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const starredViews = filteredViews.filter(view => view.starred);
  const unstarredViews = filteredViews.filter(view => !view.starred);

  return (
    <>
      <nav className="main-nav">
        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          <i className={`fas fa-bars ${isOpen ? 'active' : ''}`}></i>
        </button>
        <div className="nav-items">
          <a href="/" className="nav-item">
            <i className="fas fa-home"></i>
            <span>Home</span>
          </a>
          <div 
            className="nav-item"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>Calendar</span>
          </div>
        </div>
      </nav>

      <div className={`nav-panel ${isOpen ? 'open' : ''}`}>
        <div className="nav-panel-header">
          <h2>Navigation</h2>
          <button className="close-panel" onClick={() => setIsOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="nav-panel-content">
          <div className="panel-search">
            <input
              type="text"
              placeholder="Search views..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {starredViews.length > 0 && (
            <div className="saved-views-section">
              <h3>Favorite Views</h3>
              <ul className="saved-views-list">
                {starredViews.map(view => (
                  <SavedViewItem
                    key={view.id}
                    view={view}
                    isActive={preferences.activeView === view.id}
                    onSelect={handleViewSelect}
                    onDelete={() => setShowConfirmDelete(view)}
                    onDuplicate={() => handleDuplicate(view)}
                    onToggleStar={() => handleToggleStar(view)}
                  />
                ))}
              </ul>
            </div>
          )}

          <div className="saved-views-section">
            <h3>All Views</h3>
            <ul className="saved-views-list">
              {unstarredViews.map(view => (
                <SavedViewItem
                  key={view.id}
                  view={view}
                  isActive={preferences.activeView === view.id}
                  onSelect={handleViewSelect}
                  onDelete={() => setShowConfirmDelete(view)}
                  onDuplicate={() => handleDuplicate(view)}
                  onToggleStar={() => handleToggleStar(view)}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showConfirmDelete && (
        <div className="confirm-modal">
          <div className="confirm-content">
            <h3>Delete View</h3>
            <p>Are you sure you want to delete "{showConfirmDelete.name}"?</p>
            <div className="confirm-actions">
              <button onClick={() => setShowConfirmDelete(null)}>Cancel</button>
              <button 
                className="delete"
                onClick={() => handleDelete(showConfirmDelete.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {duplicateView && (
        <div className="duplicate-modal">
          <div className="duplicate-content">
            <h3>Duplicate View</h3>
            <input
              type="text"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="Enter new view name"
              autoFocus
            />
            <div className="duplicate-actions">
              <button onClick={() => setDuplicateView(null)}>Cancel</button>
              <button 
                className="duplicate"
                onClick={handleConfirmDuplicate}
              >
                Create Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && <div className="nav-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
}

function SavedViewItem({ view, isActive, onSelect, onDelete, onDuplicate, onToggleStar }) {
  return (
    <li 
      className={`saved-view-item ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(view.id)}
    >
      <span className="view-name">{view.name}</span>
      <div className="view-actions">
        <button 
          className="view-action star"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
        >
          <i className={`fas fa-star ${view.starred ? 'starred' : ''}`}></i>
        </button>
        <button 
          className="view-action duplicate"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          <i className="fas fa-copy"></i>
        </button>
        {view.id !== 'default' && (
          <button 
            className="view-action delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>
    </li>
  );
}

Navigation.defaultProps = {
  preferences: {
    savedViews: [
      {
        id: 'default',
        name: 'All Items',
        filters: {
          status: [],
          campaign: [],
          type: []
        }
      }
    ],
    activeView: 'default',
    navPanelOpen: false
  },
  onPreferenceChange: () => {}
};

export default Navigation; 
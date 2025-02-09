import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import AddItemModal from './components/AddItemModal';
import CampaignModal from './components/CampaignModal';
import SocialPostModal from './components/SocialPostModal';
import DraggableModal from './components/DraggableModal';
import Toast from './components/Toast';
import Navigation from './components/Navigation';
import { loadPreferences, updatePreference } from './services/preferences';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [contentItems, setContentItems] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);
  const [editingContentItem, setEditingContentItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [itemType, setItemType] = useState(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedContentItem, setSelectedContentItem] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedSocialPost, setSelectedSocialPost] = useState(null);
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [preferences, setPreferences] = useState(() => {
    const savedPrefs = loadPreferences();
    // Ensure savedViews exists
    if (!savedPrefs.savedViews) {
      savedPrefs.savedViews = [
        {
          id: 'default',
          name: 'All Items',
          filters: {
            status: [],
            campaign: [],
            type: []
          }
        }
      ];
      savedPrefs.activeView = 'default';
    }
    return savedPrefs;
  });

  const itemTypes = [
    { 
      id: 'content', 
      label: 'Content Item',
      color: '#1a75ff'
    },
    { 
      id: 'campaign', 
      label: 'Campaign',
      color: '#FFB3BA'
    },
    { 
      id: 'social', 
      label: 'Social Post',
      color: '#1DA1F2'
    }
  ];

  useEffect(() => {
    fetchContentItems();
    fetchCampaigns();
    fetchSocialPosts();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close Add New dropdown
      if (!e.target.closest('.add-button-container')) {
        setShowDropdown(false);
      }
      
      // Close Settings dropdown
      if (!e.target.closest('.settings-container')) {
        setShowSettingsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedPrefs = loadPreferences();
    setIsDarkMode(savedPrefs.theme === 'dark');
  }, []);

  const fetchContentItems = async () => {
    try {
      const response = await fetch('/api/content-items');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setContentItems(data);
    } catch (error) {
      console.error('Error fetching content items:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    }
  };

  const fetchSocialPosts = async () => {
    try {
      const response = await fetch('/api/social-posts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSocialPosts(data);
    } catch (error) {
      console.error('Error fetching social posts:', error);
      setSocialPosts([]);
    }
  };

  const handleAddContentItem = async (newContentItem) => {
    try {
      const response = await fetch('/api/content-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContentItem),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const savedContentItem = await response.json();
      setContentItems([...contentItems, savedContentItem]);
      setShowModal(false);
    } catch (error) {
      console.error('Error adding content item:', error);
      throw error;
    }
  };

  const handleUpdateContentItem = async (updatedContentItem) => {
    try {
      const response = await fetch(`/api/content-items/${updatedContentItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContentItem),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const savedContentItem = await response.json();
      setContentItems(contentItems.map(item => 
        item.id === savedContentItem.id ? savedContentItem : item
      ));
      setShowModal(false);
    } catch (error) {
      console.error('Error updating content item:', error);
      throw error;
    }
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleSaveContentItem = async (contentItem) => {
    try {
      if (contentItem.id) {
        await handleUpdateContentItem(contentItem);
        addToast(`Successfully updated "${contentItem.title}"`, 'success');
      } else {
        await handleAddContentItem(contentItem);
        addToast(`Successfully created "${contentItem.title}"`, 'success');
      }
      setSelectedContentItem(null);
    } catch (error) {
      addToast(
        `Failed to ${contentItem.id ? 'update' : 'create'} content item: ${error.message}`,
        'error'
      );
      throw error;
    }
  };

  const handleEditItem = (type, item) => {
    switch (type) {
      case 'content':
        setSelectedContentItem(item);
        break;
      case 'campaign':
        setSelectedCampaign(item);
        break;
      case 'social':
        setSelectedSocialPost(item);
        break;
      default:
        break;
    }
  };

  const handleContentItemClose = () => {
    setSelectedContentItem(null);
    setItemType(null);
  };

  const handleCampaignClose = () => {
    setSelectedCampaign(null);
    setItemType(null);
  };

  const handleSocialPostClose = () => {
    setSelectedSocialPost(null);
    setItemType(null);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleDeleteContentItem = async (id) => {
    try {
      setDeletingItems(prev => new Set(prev).add(id));
      const itemToDelete = contentItems.find(item => item.id === id);
      setContentItems(prevItems => prevItems.filter(item => item.id !== id));
      setSelectedContentItem(null);

      const response = await fetch(`/api/content-items/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete content item`);
      }
      addToast(`Successfully deleted "${itemToDelete.title}"`, 'success');
    } catch (error) {
      addToast(`Failed to delete content item: ${error.message}`, 'error');
      setContentItems(prevItems => {
        const item = prevItems.find(i => i.id === id);
        return item ? prevItems : [...prevItems, selectedContentItem];
      });
    } finally {
      setDeletingItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleAddClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleItemTypeSelect = (type) => {
    setItemType(type.id);
    setShowDropdown(false);
    
    // Create empty item based on type
    const today = new Date().toISOString().split('T')[0];
    
    switch (type.id) {
      case 'content':
        setSelectedContentItem({
          title: '',
          description: '',
          status: 'Backlog',
          date: today,
          campaignId: ''
        });
        break;
      case 'campaign':
        setSelectedCampaign({
          title: '',
          description: '',
          startDate: today,
          endDate: today,
          color: '#FFB3BA'
        });
        break;
      case 'social':
        setSelectedSocialPost({
          title: '',
          message: '',
          platforms: [],
          date: today
        });
        break;
      default:
        break;
    }
  };

  const handleSaveCampaign = async (campaign) => {
    try {
      const method = campaign.id ? 'PUT' : 'POST';
      const url = campaign.id ? `/api/campaigns/${campaign.id}` : '/api/campaigns';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaign),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const savedCampaign = await response.json();
      
      if (campaign.id) {
        setCampaigns(campaigns.map(c => 
          c.id === savedCampaign.id ? savedCampaign : c
        ));
      } else {
        setCampaigns([...campaigns, savedCampaign]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving campaign:', error);
      throw error;
    }
  };

  const handleDeleteCampaign = async (id) => {
    try {
      // Optimistic update
      setDeletingItems(prev => new Set(prev).add(id));
      setCampaigns(prevCampaigns => prevCampaigns.filter(campaign => campaign.id !== id));
      setSelectedCampaign(null);

      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete campaign`);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      // Revert optimistic update
      setCampaigns(prevCampaigns => {
        const campaign = prevCampaigns.find(c => c.id === id);
        return campaign ? prevCampaigns : [...prevCampaigns, selectedCampaign];
      });
      showError('Failed to delete campaign. Please try again.');
    } finally {
      setDeletingItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSaveSocialPost = async (post) => {
    try {
      const method = post.id ? 'PUT' : 'POST';
      const url = post.id ? `/api/social-posts/${post.id}` : '/api/social-posts';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const savedPost = await response.json();
      
      if (post.id) {
        setSocialPosts(socialPosts.map(p => 
          p.id === savedPost.id ? savedPost : p
        ));
      } else {
        setSocialPosts([...socialPosts, savedPost]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving social post:', error);
      throw error;
    }
  };

  const handleDeleteSocialPost = async (id) => {
    try {
      // Optimistic update
      setDeletingItems(prev => new Set(prev).add(id));
      setSocialPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      setSelectedSocialPost(null);

      const response = await fetch(`/api/social-posts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete social post`);
      }
    } catch (error) {
      console.error('Error deleting social post:', error);
      // Revert optimistic update
      setSocialPosts(prevPosts => {
        const post = prevPosts.find(p => p.id === id);
        return post ? prevPosts : [...prevPosts, selectedSocialPost];
      });
      showError('Failed to delete social post. Please try again.');
    } finally {
      setDeletingItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    setPreferences(prev => {
      const newPrefs = { ...prev, theme: newTheme };
      updatePreference('theme', newTheme);
      return newPrefs;
    });
  };

  const handleMoveItem = async (type, itemId, newDate) => {
    try {
      let endpoint;
      let updateFunction;
      let items;

      switch (type) {
        case 'content':
          endpoint = '/api/content-items';
          updateFunction = setContentItems;
          items = contentItems;
          break;
        case 'social':
          endpoint = '/api/social-posts';
          updateFunction = setSocialPosts;
          items = socialPosts;
          break;
        default:
          return;
      }

      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const updatedItem = { ...item, date: newDate };

      const response = await fetch(`${endpoint}/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedItem = await response.json();
      updateFunction(items.map(i => i.id === savedItem.id ? savedItem : i));
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <Navigation 
          preferences={preferences}
          onPreferenceChange={(key, value) => {
            setPreferences(prev => {
              const newPrefs = { ...prev, [key]: value };
              updatePreference(key, value);
              return newPrefs;
            });
          }}
        />
        <div className="main-content">
          <div className="header">
            <h1>Content Calendar</h1>
            <div className="header-controls">
              <div className="settings-container">
                <button 
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)} 
                  className="settings-button"
                >
                  <i className="fas fa-ellipsis-v"></i>
                </button>
                {showSettingsDropdown && (
                  <div className="settings-dropdown">
                    <div className="settings-item">
                      <span>Color Scheme</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={isDarkMode}
                          onChange={handleThemeToggle}
                        />
                        <span className="slider">
                          <span className="slider-text">
                            {isDarkMode ? 'Dark' : 'Light'}
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div className="add-button-container">
                <button onClick={handleAddClick} className="add-button">
                  Add New {showDropdown ? '▼' : '▶'}
                </button>
                {showDropdown && (
                  <div className="add-dropdown">
                    {itemTypes.map(type => (
                      <button
                        key={type.id}
                        className="dropdown-item"
                        onClick={() => handleItemTypeSelect(type)}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Calendar 
            contentItems={contentItems} 
            campaigns={campaigns}
            socialPosts={socialPosts}
            onEditItem={handleEditItem}
            onMoveItem={handleMoveItem}
            preferences={preferences}
            onPreferenceChange={(key, value) => {
              setPreferences(prev => {
                const newPrefs = { ...prev, [key]: value };
                updatePreference(key, value);
                return newPrefs;
              });
            }}
          />
          {errorMessage && (
            <div className="error-toast">
              <i className="fas fa-exclamation-circle"></i>
              {errorMessage}
            </div>
          )}
          {selectedContentItem && (
            <DraggableModal onClose={handleContentItemClose}>
              <AddItemModal
                contentItem={selectedContentItem}
                campaigns={campaigns}
                onSave={handleSaveContentItem}
                onCancel={handleContentItemClose}
                onDelete={handleDeleteContentItem}
                isDeleting={deletingItems.has(selectedContentItem.id)}
              />
            </DraggableModal>
          )}

          {selectedCampaign && (
            <DraggableModal onClose={handleCampaignClose}>
              <CampaignModal
                campaign={selectedCampaign}
                onSave={handleSaveCampaign}
                onCancel={handleCampaignClose}
                onDelete={handleDeleteCampaign}
                isDeleting={deletingItems.has(selectedCampaign.id)}
              />
            </DraggableModal>
          )}

          {selectedSocialPost && (
            <DraggableModal onClose={handleSocialPostClose}>
              <SocialPostModal
                post={selectedSocialPost}
                onSave={handleSaveSocialPost}
                onCancel={handleSocialPostClose}
                onDelete={handleDeleteSocialPost}
                isDeleting={deletingItems.has(selectedSocialPost.id)}
              />
            </DraggableModal>
          )}

          <div className="toast-container">
            {toasts.map(toast => (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App; 
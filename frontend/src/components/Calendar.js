import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import './Calendar.css';
import DroppableCell from './DroppableCell';
import DraggableItem from './DraggableItem';
import SavedViewButton from './SavedViewButton';

const socialPlatformColors = {
  twitter: '#1DA1F2',    // Twitter blue
  facebook: '#4267B2',   // Facebook blue
  instagram: '#E1306C',  // Instagram pink
  linkedin: '#0077B5',   // LinkedIn blue
  youtube: '#FF0000',    // YouTube red
  tiktok: '#000000',     // TikTok black
  pinterest: '#E60023',  // Pinterest red
};

function getSocialPlatformColors(platforms) {
  if (!platforms || platforms.length === 0) {
    return ['#808080']; // Default gray if no platforms selected
  }
  
  return platforms.map(platform => socialPlatformColors[platform] || '#808080');
}

const calendarStyles = {
  container: {
    backgroundColor: 'var(--background-color)',
    border: '1px solid var(--primary-color)',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  header: {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    padding: '10px'
  },
  dayCell: {
    border: '1px solid var(--secondary-color)',
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'var(--secondary-color)'
    }
  }
}

function Calendar({ 
  contentItems, 
  campaigns, 
  socialPosts, 
  onEditItem, 
  onMoveItem, 
  preferences = {
    filters: {
      status: [],
      campaign: [],
      type: []
    }
  }, 
  onPreferenceChange = () => {} 
}) {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const days = eachDayOfInterval({ start, end });
  const [selectedDate, setSelectedDate] = useState(null);
  const [filters, setFilters] = useState(preferences.filters);
  const [activeFilter, setActiveFilter] = useState(null);
  
  const statusOptions = ['Backlog', 'Planned', 'In Progress', 'Done'];
  const typeOptions = [
    { id: 'content', label: 'Content Item' },
    { id: 'campaign', label: 'Campaign' },
    { id: 'social', label: 'Social Post' }
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: filters[filterType].includes(value)
        ? filters[filterType].filter(item => item !== value)
        : [...filters[filterType], value]
    };
    
    setFilters(newFilters);
    onPreferenceChange('filters', newFilters);
  };

  const handleFilterClick = (filterType, e) => {
    e.stopPropagation();
    setActiveFilter(activeFilter === filterType ? null : filterType);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.filter-group')) {
        setActiveFilter(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getFilteredItems = (items, type) => {
    return items.filter(item => {
      const statusMatch = filters.status.length === 0 || 
        (item.status && filters.status.includes(item.status));
      const campaignMatch = filters.campaign.length === 0 || 
        (item.campaignId && filters.campaign.includes(item.campaignId));
      const typeMatch = filters.type.length === 0 || filters.type.includes(type);
      return statusMatch && campaignMatch && typeMatch;
    });
  };

  const handleCellClick = (date) => {
    setSelectedDate(date);
    onEditItem('content', { date: format(date, 'yyyy-MM-dd') });
  };

  const handleDrop = (item, date) => {
    onMoveItem(item.type, item.id, date);
  };

  const handleAddNew = (type, date) => {
    // Always open in edit mode with a new item
    onEditItem(type, { date: format(date, 'yyyy-MM-dd') });
  };

  const handleDateClick = (e, date) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setSelectedDate(selectedDate === date ? null : date); // Toggle selected date
  };

  const handleAddNewClick = (e, type, date) => {
    e.stopPropagation(); // Prevent event from bubbling up
    handleAddNew(type, date);
    setSelectedDate(null); // Close dropdown after selection
  };

  const isToday = (date) => {
    return format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  };

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: [],
      campaign: [],
      type: []
    };
    setFilters(clearedFilters);
    onPreferenceChange('filters', clearedFilters);
  };

  const renderContentItem = (contentItem) => (
    <DraggableItem
      key={`content-${contentItem.id}`}
      type="CONTENT_ITEM"
      item={{ ...contentItem, type: 'content' }}
      onDragEnd={handleDrop}
    >
      <div
        className={`content-item status-${contentItem.status.toLowerCase()}`}
        onClick={(e) => {
          e.stopPropagation();
          onEditItem('content', contentItem);
        }}
      >
        <div className="content-item-title">{contentItem.title}</div>
        {contentItem.description && (
          <div className="content-item-description">
            {contentItem.description.substring(0, 50)}
            {contentItem.description.length > 50 && '...'}
          </div>
        )}
      </div>
    </DraggableItem>
  );

  const renderSocialPost = (post) => (
    <DraggableItem
      key={`social-${post.id}`}
      type="SOCIAL_POST"
      item={{ ...post, type: 'social' }}
      onDragEnd={handleDrop}
    >
      <div 
        className="calendar-item social-post"
        style={{ backgroundColor: getSocialPlatformColors(post.platforms)[0] }}
        onClick={(e) => {
          e.stopPropagation();
          onEditItem('social', post);
        }}
      >
        <div className="social-icons">
          {post.platforms.map(platform => (
            <i 
              key={`platform-${platform}`}
              className={`fab fa-${platform}`}
              style={{ color: 'white' }}
            />
          ))}
        </div>
        <div className="item-title">{post.title}</div>
      </div>
    </DraggableItem>
  );

  const renderCampaign = (campaign, date) => {
    const isStart = date === campaign.startDate;
    const isEnd = date === campaign.endDate;
    const isMiddle = !isStart && !isEnd;
    
    return (
      <div 
        key={`campaign-${campaign.id}-${date}`}
        className={`campaign ${isStart ? 'campaign-start' : ''} ${isMiddle ? 'campaign-middle' : ''} ${isEnd ? 'campaign-end' : ''}`}
        style={{ 
          backgroundColor: campaign.color,
          color: '#000000',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEditItem('campaign', campaign);
        }}
      >
        {isStart && <div className="item-title">{campaign.title}</div>}
      </div>
    );
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const renderFilters = () => (
    <div className="filters">
      <div className="filter-group">
        <button 
          className={`filter-button ${activeFilter === 'status' ? 'active' : ''}`}
          onClick={(e) => handleFilterClick('status', e)}
        >
          Status {filters.status.length > 0 && `(${filters.status.length})`}
          <i className="fas fa-chevron-down"></i>
        </button>
        <div className={`filter-dropdown ${activeFilter === 'status' ? 'show' : ''}`}>
          {statusOptions.map(status => (
            <label key={status} className="filter-option">
              <input
                type="checkbox"
                checked={filters.status.includes(status)}
                onChange={() => handleFilterChange('status', status)}
              />
              <span className={`status-badge status-${status.toLowerCase()}`}>
                {status}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <button 
          className={`filter-button ${activeFilter === 'campaign' ? 'active' : ''}`}
          onClick={(e) => handleFilterClick('campaign', e)}
        >
          Campaign {filters.campaign.length > 0 && `(${filters.campaign.length})`}
          <i className="fas fa-chevron-down"></i>
        </button>
        <div className={`filter-dropdown ${activeFilter === 'campaign' ? 'show' : ''}`}>
          {campaigns.map(campaign => (
            <label key={campaign.id} className="filter-option">
              <input
                type="checkbox"
                checked={filters.campaign.includes(campaign.id)}
                onChange={() => handleFilterChange('campaign', campaign.id)}
              />
              <span className="campaign-badge" style={{ backgroundColor: campaign.color }}>
                {campaign.title}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <button 
          className={`filter-button ${activeFilter === 'type' ? 'active' : ''}`}
          onClick={(e) => handleFilterClick('type', e)}
        >
          Type {filters.type.length > 0 && `(${filters.type.length})`}
          <i className="fas fa-chevron-down"></i>
        </button>
        <div className={`filter-dropdown ${activeFilter === 'type' ? 'show' : ''}`}>
          {typeOptions.map(type => (
            <label key={type.id} className="filter-option">
              <input
                type="checkbox"
                checked={filters.type.includes(type.id)}
                onChange={() => handleFilterChange('type', type.id)}
              />
              {type.label}
            </label>
          ))}
        </div>
      </div>

      {(filters.status.length > 0 || filters.campaign.length > 0 || filters.type.length > 0) && (
        <button 
          className="clear-filters-button"
          onClick={handleClearFilters}
        >
          <i className="fas fa-times"></i>
          Clear Filters
        </button>
      )}
    </div>
  );

  const activeView = preferences.savedViews.find(v => v.id === preferences.activeView);
  const hasActiveFilters = filters.status.length > 0 || 
    filters.campaign.length > 0 || 
    filters.type.length > 0;

  const handleSaveView = (name) => {
    const newView = {
      id: `view-${Date.now()}`,
      name,
      filters: { ...filters }
    };
    
    const newViews = [...preferences.savedViews, newView];
    onPreferenceChange('savedViews', newViews);
    onPreferenceChange('activeView', newView.id);
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div className="view-header">
          <h2>{activeView?.name || 'All Items'}</h2>
          <SavedViewButton 
            onSave={handleSaveView}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
        {renderFilters()}
      </div>
      <div className="weekday-header">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className={`weekday-cell ${index === 0 || index === 6 ? 'weekend' : ''}`}
          >
            {day.substring(0, 3)}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day) => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          return (
            <DroppableCell
              key={day.toString()}
              date={formattedDate}
              onDrop={handleDrop}
              className={`calendar-cell 
                ${isToday(day) ? 'today' : ''} 
                ${isWeekend(day) ? 'weekend' : ''} 
                ${isPast(day) ? 'past' : ''}`
              }
            >
              <div 
                className={`date ${isToday(day) ? 'today' : ''} ${selectedDate === formattedDate ? 'selected' : ''}`}
                onClick={(e) => handleDateClick(e, formattedDate)}
              >
                {format(day, 'd')}
                {selectedDate === formattedDate && (
                  <div className="add-new-dropdown" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => handleAddNewClick(e, 'content', day)}>
                      <i className="fas fa-file-alt"></i>
                      Add Content Item
                    </button>
                    <button onClick={(e) => handleAddNewClick(e, 'campaign', day)}>
                      <i className="fas fa-calendar-alt"></i>
                      Add Campaign
                    </button>
                    <button onClick={(e) => handleAddNewClick(e, 'social', day)}>
                      <i className="fas fa-share-alt"></i>
                      Add Social Post
                    </button>
                  </div>
                )}
              </div>
              {campaigns
                .filter((campaign) => {
                  const currentDate = format(day, 'yyyy-MM-dd');
                  return currentDate >= campaign.startDate && currentDate <= campaign.endDate;
                })
                .map((campaign) => renderCampaign(campaign, format(day, 'yyyy-MM-dd')))}
              <div className="content-items">
                {getFilteredItems(contentItems, 'content')
                  .filter((contentItem) => contentItem.date === format(day, 'yyyy-MM-dd'))
                  .map((contentItem) => renderContentItem(contentItem))}
                {getFilteredItems(socialPosts, 'social')
                  .filter((post) => post.date === format(day, 'yyyy-MM-dd'))
                  .map((post) => renderSocialPost(post))}
              </div>
            </DroppableCell>
          );
        })}
      </div>
    </div>
  );
}

// Add PropTypes for better type checking
Calendar.defaultProps = {
  preferences: {
    filters: {
      status: [],
      campaign: [],
      type: []
    }
  },
  onPreferenceChange: () => {}
};

export default Calendar; 
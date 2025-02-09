import React, { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import './Modal.css';

const formatSocialText = (text) => {
  return text
    .split(' ')
    .map(word => {
      if (word.startsWith('#')) {
        return `<span class="hashtag">${word}</span>`;
      }
      if (word.startsWith('@')) {
        return `<span class="mention">${word}</span>`;
      }
      return word;
    })
    .join(' ');
};

// Add link preview helper
const extractLinkPreview = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = text.match(urlRegex);
  return links ? links[0] : null;
};

const socialPlatforms = [
  { 
    id: 'twitter', 
    name: 'Twitter', 
    color: '#1DA1F2', 
    icon: 'fab fa-twitter',
    tooltip: 'Share on Twitter',
    maxLength: 280,
    previewTemplate: (message, image) => `
      <div class="preview-twitter">
        <div class="preview-header">
          <div class="preview-user">
            <div class="preview-avatar"></div>
            <div class="preview-names">
              <div class="preview-display-name">Your Name</div>
              <div class="preview-username">@yourusername</div>
            </div>
          </div>
        </div>
        <div class="preview-content">
          <div class="preview-text">${formatSocialText(message)}</div>
          ${image ? `<div class="preview-image"><img src="${URL.createObjectURL(image)}" alt="Upload preview"/></div>` : ''}
        </div>
        <div class="preview-actions">
          <i class="far fa-comment"></i>
          <i class="fas fa-retweet"></i>
          <i class="far fa-heart"></i>
          <i class="far fa-share-square"></i>
        </div>
      </div>
    `
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    color: '#4267B2', 
    icon: 'fab fa-facebook',
    tooltip: 'Post on Facebook',
    maxLength: 63206,
    previewTemplate: (message, image) => `
      <div class="preview-facebook">
        <div class="preview-header">
          <div class="preview-user">
            <div class="preview-avatar"></div>
            <div class="preview-names">
              <div class="preview-display-name">Your Name</div>
              <div class="preview-timestamp">Just now</div>
            </div>
          </div>
        </div>
        <div class="preview-content">
          <div class="preview-text">${formatSocialText(message)}</div>
          ${image ? `<div class="preview-image"><img src="${URL.createObjectURL(image)}" alt="Upload preview"/></div>` : ''}
        </div>
        <div class="preview-actions">
          <div><i class="far fa-thumbs-up"></i> Like</div>
          <div><i class="far fa-comment"></i> Comment</div>
          <div><i class="far fa-share-square"></i> Share</div>
        </div>
      </div>
    `
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    color: '#E1306C', 
    icon: 'fab fa-instagram',
    tooltip: 'Share on Instagram',
    maxLength: 2200,
    previewTemplate: (message, image) => `
      <div class="preview-instagram">
        <div class="preview-header">
          <div class="preview-user">
            <div class="preview-avatar"></div>
            <div class="preview-username">yourusername</div>
          </div>
          <i class="fas fa-ellipsis-h"></i>
        </div>
        ${image ? `
          <div class="preview-image">
            <img src="${URL.createObjectURL(image)}" alt="Upload preview"/>
          </div>
        ` : ''}
        <div class="preview-content">
          <div class="preview-actions">
            <div class="preview-action-group">
              <i class="far fa-heart"></i>
              <i class="far fa-comment"></i>
              <i class="far fa-paper-plane"></i>
            </div>
            <i class="far fa-bookmark"></i>
          </div>
          <div class="preview-likes">0 likes</div>
          <div class="preview-caption">
            <span class="preview-username">yourusername</span>
            <span class="preview-text">${formatSocialText(message)}</span>
          </div>
          <div class="preview-timestamp">Just now</div>
        </div>
      </div>
    `
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    color: '#0077B5', 
    icon: 'fab fa-linkedin',
    tooltip: 'Post on LinkedIn',
    maxLength: 3000,
    previewTemplate: (message, image, linkPreview) => `
      <div class="preview-linkedin">
        <div class="preview-header">
          <div class="preview-user">
            <div class="preview-avatar"></div>
            <div class="preview-info">
              <div class="preview-name">Your Name</div>
              <div class="preview-headline">Your Headline</div>
              <div class="preview-timestamp">Just now • <i class="fas fa-globe-americas"></i></div>
            </div>
          </div>
          <i class="fas fa-ellipsis-h"></i>
        </div>
        <div class="preview-content">
          <div class="preview-text">${formatSocialText(message)}</div>
          ${image ? `
            <div class="preview-image">
              <img src="${URL.createObjectURL(image)}" alt="Upload preview"/>
            </div>
          ` : ''}
          ${linkPreview ? `
            <div class="preview-link-card">
              <img src="${linkPreview.image}" alt="Link preview"/>
              <div class="preview-link-content">
                <div class="preview-link-title">${linkPreview.title}</div>
                <div class="preview-link-description">${linkPreview.description}</div>
                <div class="preview-link-domain">${linkPreview.domain}</div>
              </div>
            </div>
          ` : ''}
        </div>
        <div class="preview-actions">
          <div><i class="far fa-thumbs-up"></i> Like</div>
          <div><i class="far fa-comment"></i> Comment</div>
          <div><i class="fas fa-share"></i> Share</div>
          <div><i class="far fa-paper-plane"></i> Send</div>
        </div>
      </div>
    `
  }
];

function SocialPostModal({ post, onSave, onCancel, onDelete, isEditMode = true, isDeleting }) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    message: post?.message || '',
    platforms: post?.platforms || [],
    date: post?.date || new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [linkPreview, setLinkPreview] = useState(null);
  const messageRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.message.trim()) {
        throw new Error('Message is required');
      }
      if (formData.platforms.length === 0) {
        throw new Error('Please select at least one platform');
      }

      // Validate platforms
      const invalidPlatforms = formData.platforms.filter(
        platformId => !socialPlatforms.find(p => p.id === platformId)
      );
      if (invalidPlatforms.length > 0) {
        throw new Error(`Invalid platform(s): ${invalidPlatforms.join(', ')}`);
      }

      // Validate message length for each selected platform
      const lengthViolations = formData.platforms
        .map(platformId => {
          const platform = socialPlatforms.find(p => p.id === platformId);
          if (platform && formData.message.length > platform.maxLength) {
            return `${platform.name} (max ${platform.maxLength} characters)`;
          }
          return null;
        })
        .filter(Boolean);

      if (lengthViolations.length > 0) {
        throw new Error(`Message too long for: ${lengthViolations.join(', ')}`);
      }

      await onSave(formData);
    } catch (err) {
      setError(err.message || 'Failed to save social post');
      console.error('Error saving social post:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlatformChange = (e) => {
    const platform = e.target.value;
    const newPlatforms = e.target.checked
      ? [...formData.platforms, platform]
      : formData.platforms.filter(p => p !== platform);
    
    setFormData({
      ...formData,
      platforms: newPlatforms
    });
    setError(''); // Clear error when selection changes
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = messageRef.current.selectionStart;
    const text = formData.message;
    const newText = text.slice(0, cursorPosition) + emoji + text.slice(cursorPosition);
    
    setFormData({
      ...formData,
      message: newText
    });
  };

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setFormData({
      ...formData,
      message: newMessage
    });
    
    // Check for links and fetch preview
    const link = extractLinkPreview(newMessage);
    if (link && (!linkPreview || linkPreview.url !== link)) {
      fetchLinkPreview(link);
    }
    setError('');
  };

  const fetchLinkPreview = async (url) => {
    try {
      // You'll need to set up a backend endpoint for this to avoid CORS issues
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      setLinkPreview({
        url,
        ...data
      });
    } catch (error) {
      console.error('Error fetching link preview:', error);
    }
  };

  const getMessageLengthStatus = () => {
    if (formData.platforms.length === 0) return null;

    const platformLengths = formData.platforms.map(platformId => {
      const platform = socialPlatforms.find(p => p.id === platformId);
      const remaining = platform.maxLength - formData.message.length;
      const isOverLimit = remaining < 0;
      return {
        platform,
        remaining,
        isOverLimit
      };
    });

    return (
      <div className="message-length-status">
        {platformLengths.map(({ platform, remaining, isOverLimit }) => (
          <div 
            key={platform.id}
            className={`length-indicator ${isOverLimit ? 'over-limit' : ''}`}
          >
            <i className={platform.icon} style={{ color: platform.color }} />
            <span>{Math.abs(remaining)} {isOverLimit ? 'over' : 'remaining'}</span>
          </div>
        ))}
      </div>
    );
  };

  const handlePreviewClick = (platformId) => {
    setPreviewPlatform(platformId);
    setShowPreview(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const renderPreview = () => {
    if (!showPreview || !previewPlatform) return null;

    const platform = socialPlatforms.find(p => p.id === previewPlatform);
    if (!platform) return null;

    return (
      <div className="preview-overlay" onClick={() => setShowPreview(false)}>
        <div className="preview-modal" onClick={e => e.stopPropagation()}>
          <div className="preview-header">
            <i className={platform.icon} style={{ color: platform.color }} />
            <span>{platform.name} Preview</span>
            <button onClick={() => setShowPreview(false)}>
              <i className="fas fa-times" />
            </button>
          </div>
          <div className="preview-content">
            <div dangerouslySetInnerHTML={{ 
              __html: platform.previewTemplate(formData.message, selectedImage)
            }} />
          </div>
        </div>
      </div>
    );
  };

  if (!isEditMode) {
    return (
      <div className="read-mode">
        <div className="form-group">
          <div className="form-label">Title</div>
          <div className="form-value">{formData.title}</div>
        </div>
        <div className="form-group">
          <div className="form-label">Message</div>
          <div className="form-value">{formData.message}</div>
        </div>
        <div className="form-group">
          <div className="form-label">Platforms</div>
          <div className="form-value">
            <div className="social-icons">
              {formData.platforms.map(platformId => {
                const platform = socialPlatforms.find(p => p.id === platformId);
                if (!platform) return null;
                return (
                  <i 
                    key={`icon-${platformId}`}
                    className={platform.icon}
                    style={{ color: platform.color }}
                    title={platform.tooltip}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className="form-group">
          <div className="form-label">Date</div>
          <div className="form-value">{formData.date}</div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>{post?.id ? 'Update Social Post' : 'Add New Social Post'}</h2>
        {post?.id && (
          <button 
            className="delete-button"
            onClick={() => onDelete(post.id)}
            disabled={isDeleting}
            title="Delete Social Post"
          >
            <i className={`fas ${isDeleting ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
          </button>
        )}
      </div>
      <div className="form-group">
        <label>Title: <span className="required">*</span></label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Message: <span className="required">*</span></label>
        <div className="message-input-container">
          <textarea
            ref={messageRef}
            name="message"
            value={formData.message}
            onChange={handleMessageChange}
            required
          />
          <button
            type="button"
            className="emoji-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <i className="far fa-smile"></i>
          </button>
        </div>
        {showEmojiPicker && (
          <div className="emoji-picker-container">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        {getMessageLengthStatus()}
        {linkPreview && (
          <div className="link-preview">
            <img src={linkPreview.image} alt="Link preview" />
            <div className="link-preview-content">
              <div className="link-preview-title">{linkPreview.title}</div>
              <div className="link-preview-description">{linkPreview.description}</div>
              <div className="link-preview-domain">{linkPreview.domain}</div>
            </div>
            <button
              type="button"
              className="remove-preview"
              onClick={() => setLinkPreview(null)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>
      <div className="form-group">
        <label>Platforms: <span className="required">*</span></label>
        <div className="platforms-select">
          {socialPlatforms.map(platform => (
            <label 
              key={`platform-${platform.id}`} 
              className={`platform-option ${formData.platforms.includes(platform.id) ? 'selected' : ''}`}
              title={platform.tooltip}
            >
              <input
                type="checkbox"
                name="platforms"
                value={platform.id}
                checked={formData.platforms.includes(platform.id)}
                onChange={handlePlatformChange}
              />
              <i 
                className={platform.icon} 
                style={{ color: platform.color }}
              />
              <span className="platform-name">{platform.name}</span>
              {formData.platforms.includes(platform.id) && (
                <>
                  <button
                    type="button"
                    className="preview-button"
                    onClick={() => handlePreviewClick(platform.id)}
                    title="Preview"
                  >
                    <i className="fas fa-eye" />
                  </button>
                  <i className="fas fa-check check-icon" />
                </>
              )}
            </label>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Date: <span className="required">*</span></label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Image:</label>
        <div className="image-upload">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="image-upload-label">
            <i className="fas fa-image"></i>
            {selectedImage ? ' Change Image' : ' Add Image'}
          </label>
          {selectedImage && (
            <button
              type="button"
              className="remove-image"
              onClick={() => setSelectedImage(null)}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        {selectedImage && (
          <div className="image-preview">
            <img src={URL.createObjectURL(selectedImage)} alt="Upload preview" />
          </div>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="modal-buttons">
        <button 
          type="button" 
          onClick={onCancel}
        >
          Cancel
        </button>
        <button 
          type="submit"
        >
          {post?.id ? 'Update' : 'Save'}
        </button>
      </div>
      {renderPreview()}
    </form>
  );
}

export default SocialPostModal; 
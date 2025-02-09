import React, { useState } from 'react';
import './AddItemModal.css';

function AddItemModal({ 
  contentItem, 
  campaigns, 
  onSave, 
  onCancel, 
  onDelete, 
  onEdit,
  onFormChange,
  mode = 'create', // 'create', 'read', or 'edit'
  isDeleting 
}) {
  const [formData, setFormData] = useState({
    title: contentItem?.title || '',
    description: contentItem?.description || '',
    status: contentItem?.status || 'Backlog',
    date: contentItem?.date || new Date().toISOString().split('T')[0],
    campaignId: contentItem?.campaignId || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationMessages, setValidationMessages] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (field, value) => {
    const messages = {};
    
    switch (field) {
      case 'title':
        if (!value.trim()) {
          messages.title = 'Title is required';
        } else if (value.length < 3) {
          messages.title = 'Title must be at least 3 characters';
        }
        break;
      case 'date':
        if (!value) {
          messages.date = 'Date is required';
        } else {
          const selectedDate = new Date(value);
          if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
            messages.date = 'Date cannot be in the past';
          }
        }
        break;
      case 'description':
        if (value.length > 500) {
          messages.description = 'Description must be less than 500 characters';
        }
        break;
      default:
        break;
    }

    return messages;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Only call onFormChange if it exists
    if (onFormChange) {
      onFormChange();
    }

    // Validate field on change
    const messages = validate(name, value);
    setValidationMessages(prev => ({
      ...prev,
      [name]: messages[name]
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const messages = {};
    Object.keys(formData).forEach(field => {
      const fieldMessages = validate(field, formData[field]);
      if (fieldMessages[field]) {
        messages[field] = fieldMessages[field];
      }
    });

    if (Object.keys(messages).length > 0) {
      setValidationMessages(messages);
      const allTouched = Object.keys(formData).reduce((acc, field) => ({
        ...acc,
        [field]: true
      }), {});
      setTouched(allTouched);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave(mode === 'edit' ? { ...formData, id: contentItem.id } : formData);
      onCancel(); // Close modal after successful save
    } catch (err) {
      setError(err.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalStyles = {
    content: {
      backgroundColor: 'var(--background-color)',
      border: '2px solid var(--primary-color)',
      borderRadius: '8px',
      padding: '20px'
    },
    button: {
      backgroundColor: 'var(--primary-color)',
      color: 'white',
      '&:hover': {
        backgroundColor: 'var(--hover-color)'
      }
    },
    input: {
      border: '1px solid var(--primary-color)',
      '&:focus': {
        outline: 'none',
        borderColor: 'var(--hover-color)',
        boxShadow: '0 0 0 2px var(--secondary-color)'
      }
    }
  }

  const renderReadMode = () => (
    <div className="read-mode">
      <div className="modal-header">
        <h2>{contentItem.title}</h2>
        <div className="modal-actions">
          <button 
            className="edit-button"
            onClick={onEdit}
            title="Edit Details"
          >
            <i className="fas fa-edit"></i>
          </button>
        </div>
      </div>
      <div className="content-details">
        <div className="detail-group">
          <label>Description</label>
          <div className="detail-value">{contentItem.description}</div>
        </div>
        <div className="detail-group">
          <label>Status</label>
          <div className="detail-value status-badge">
            {contentItem.status}
          </div>
        </div>
        <div className="detail-group">
          <label>Date</label>
          <div className="detail-value">{contentItem.date}</div>
        </div>
        {contentItem.campaignId && (
          <div className="detail-group">
            <label>Campaign</label>
            <div className="detail-value">
              {campaigns.find(c => c.id === contentItem.campaignId)?.title}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEditMode = () => (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>Edit Content Item</h2>
        <div className="modal-actions">
          {onDelete && (
            <button 
              className="delete-button"
              onClick={() => onDelete(contentItem.id)}
              disabled={isDeleting}
              title="Delete Content Item"
            >
              <i className={`fas ${isDeleting ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
            </button>
          )}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label>Title: <span className="required">*</span></label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={isSubmitting}
          className={`
            ${touched.title && validationMessages.title ? 'invalid' : ''}
            ${isSubmitting ? 'submitting' : ''}
          `}
        />
        {touched.title && validationMessages.title && (
          <div className="validation-message">{validationMessages.title}</div>
        )}
      </div>
      <div className="form-group">
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
        />
        {touched.description && validationMessages.description && (
          <div className="validation-message">{validationMessages.description}</div>
        )}
      </div>
      <div className="form-group">
        <label>Status:</label>
        <select 
          name="status" 
          value={formData.status} 
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
        >
          <option value="Backlog">Backlog</option>
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
      <div className="form-group">
        <label>Date: <span className="required">*</span></label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={isSubmitting}
          className={`
            ${touched.date && validationMessages.date ? 'invalid' : ''}
            ${isSubmitting ? 'submitting' : ''}
          `}
        />
        {touched.date && validationMessages.date && (
          <div className="validation-message">{validationMessages.date}</div>
        )}
      </div>
      <div className="form-group">
        <label>Campaign:</label>
        <select 
          name="campaignId" 
          value={formData.campaignId} 
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
        >
          <option value="">Select a campaign</option>
          {campaigns.map(campaign => (
            <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
          ))}
        </select>
      </div>
      <div className="modal-buttons">
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? 'loading' : ''}
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Updating...
            </>
          ) : 'Update'}
        </button>
      </div>
    </form>
  );

  const renderCreateMode = () => (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>Add New Content Item</h2>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label>Title: <span className="required">*</span></label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={isSubmitting}
          className={`
            ${touched.title && validationMessages.title ? 'invalid' : ''}
            ${isSubmitting ? 'submitting' : ''}
          `}
        />
        {touched.title && validationMessages.title && (
          <div className="validation-message">{validationMessages.title}</div>
        )}
      </div>
      <div className="form-group">
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
        />
        {touched.description && validationMessages.description && (
          <div className="validation-message">{validationMessages.description}</div>
        )}
      </div>
      <div className="form-group">
        <label>Status:</label>
        <select 
          name="status" 
          value={formData.status} 
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
        >
          <option value="Backlog">Backlog</option>
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
      <div className="form-group">
        <label>Date: <span className="required">*</span></label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={isSubmitting}
          className={`
            ${touched.date && validationMessages.date ? 'invalid' : ''}
            ${isSubmitting ? 'submitting' : ''}
          `}
        />
        {touched.date && validationMessages.date && (
          <div className="validation-message">{validationMessages.date}</div>
        )}
      </div>
      <div className="form-group">
        <label>Campaign:</label>
        <select 
          name="campaignId" 
          value={formData.campaignId} 
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
        >
          <option value="">Select a campaign</option>
          {campaigns.map(campaign => (
            <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
          ))}
        </select>
      </div>
      <div className="modal-buttons">
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? 'loading' : ''}
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Saving...
            </>
          ) : 'Save'}
        </button>
      </div>
    </form>
  );

  switch (mode) {
    case 'read':
      return renderReadMode();
    case 'edit':
      return renderEditMode();
    default:
      return renderCreateMode();
  }
}

AddItemModal.defaultProps = {
  onFormChange: () => {}, // Default empty function
  mode: 'create',
  isDeleting: false
};

export default AddItemModal; 
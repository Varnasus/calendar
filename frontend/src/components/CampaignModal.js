import React, { useState } from 'react';
import './Modal.css';

function CampaignModal({ campaign, onSave, onCancel, onDelete, isEditMode = true, isDeleting }) {
  const pastelColors = [
    '#FFB3BA', // pastel red
    '#BAFFC9', // pastel green
    '#BAE1FF', // pastel blue
    '#FFFFBA', // pastel yellow
    '#FFB3F7', // pastel pink
    '#E0BBE4', // pastel purple
  ];

  const [formData, setFormData] = useState({
    title: campaign?.title || '',
    description: campaign?.description || '',
    status: campaign?.status || 'Planned',
    startDate: campaign?.startDate || new Date().toISOString().split('T')[0],
    endDate: campaign?.endDate || new Date().toISOString().split('T')[0],
    color: campaign?.color || pastelColors[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (err) {
      console.error('Failed to save campaign:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isEditMode) {
    return (
      <div className="read-mode">
        <div className="form-group">
          <div className="form-label">Title</div>
          <div className="form-value">{formData.title}</div>
        </div>
        <div className="form-group">
          <div className="form-label">Description</div>
          <div className="form-value">{formData.description}</div>
        </div>
        <div className="form-group">
          <div className="form-label">Start Date</div>
          <div className="form-value">{formData.startDate}</div>
        </div>
        <div className="form-group">
          <div className="form-label">End Date</div>
          <div className="form-value">{formData.endDate}</div>
        </div>
        <div className="form-group">
          <div className="form-label">Color</div>
          <div className="form-value">
            <div 
              className="color-preview" 
              style={{ backgroundColor: formData.color }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>{campaign?.id ? 'Update Campaign' : 'Add New Campaign'}</h2>
        {campaign?.id && (
          <button 
            className="delete-button"
            onClick={() => onDelete(campaign.id)}
            disabled={isDeleting}
            title="Delete Campaign"
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
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Start Date: <span className="required">*</span></label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>End Date: <span className="required">*</span></label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Color:</label>
        <div className="color-picker-wrapper">
          <select
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="pastel-color-select"
          >
            {pastelColors.map((color, index) => (
              <option key={color} value={color}>
                Pastel Color {index + 1}
              </option>
            ))}
          </select>
          <div className="color-preview" style={{ backgroundColor: formData.color }} />
        </div>
      </div>
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
          {campaign?.id ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default CampaignModal; 
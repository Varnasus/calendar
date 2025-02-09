function ContentItemModal({ contentItem, campaigns, onSave, onCancel, onDelete }) {
  // ... existing code ...

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* ... existing header ... */}
        <form onSubmit={handleSubmit}>
          {/* ... existing fields ... */}
          <div className="form-group">
            <label>Campaign:</label>
            <select
              name="campaignId"
              value={formData.campaignId || ''}
              onChange={handleChange}
            >
              <option value="">No Campaign</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </div>
          {/* ... rest of form ... */}
        </form>
      </div>
    </div>
  );
} 
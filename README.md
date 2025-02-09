<<<<<<< HEAD
# Content Calendar

A modern, interactive content calendar application for managing content items, campaigns, and social media posts.

## Project Structure

```
content-calendar/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Calendar.js       # Main calendar view
│   │   │   ├── AddItemModal.js   # Content item creation/editing
│   │   │   ├── CampaignModal.js  # Campaign management
│   │   │   ├── SocialPostModal.js # Social post management
│   │   │   ├── Navigation.js     # Navigation and saved views
│   │   │   └── DraggableModal.js # Base modal with drag functionality
│   │   ├── services/     # API and utility services
│   │   └── types/       # TypeScript definitions
│   └── public/
└── backend/           # Node.js/Express backend
    ├── src/
    │   ├── controllers/  # Route handlers
    │   ├── models/       # Database models
    │   ├── routes/       # API routes
    │   ├── middleware/   # Express middleware
    │   └── config/       # Configuration files
```

## Features

### Calendar View
- Monthly calendar layout with drag-and-drop functionality
- Support for multiple content types:
  - Content Items (articles, blog posts, etc.)
  - Campaigns (date-range based marketing campaigns)
  - Social Posts (platform-specific social media content)
- Visual status indicators (Backlog, Planned, In Progress, Done)
- Date-based navigation

### Content Management
- Create, edit, and delete content items
- Campaign planning with start and end dates
- Social media post scheduling with platform selection
- Drag-and-drop rescheduling
- Status tracking workflow

### Saved Views & Filtering
- Filter content by:
  - Status
  - Campaign
  - Content Type
- Save and name custom filter combinations
- Star favorite views for quick access
- Search through saved views
- Views persist across sessions

### User Interface
- Clean, modern design
- Dark/Light theme support
- Responsive layout
- Intuitive drag-and-drop interactions
- Modal-based content editing
- Toast notifications for user feedback

## Technical Implementation

### Frontend
- React for UI components
- CSS Modules for styling
- LocalStorage for user preferences
- Drag-and-drop functionality
- Theme switching support
- Error boundary implementation

### Backend
- Node.js/Express server
- PostgreSQL database with Sequelize ORM
- RESTful API endpoints
- Error handling middleware
- Data validation

### Data Models

#### Content Item
- Title
- Description
- Date
- Status
- Campaign association

#### Campaign
- Name
- Description
- Start Date
- End Date
- Associated content items

#### Social Post
- Content
- Date
- Platforms
- Status
- Campaign association

## Setup

### Prerequisites
- Node.js (v14+)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/content-calendar.git
cd content-calendar
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

3. Start development servers:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
=======
# calendar
Test calendar functionality 
>>>>>>> 47c73ab8a4ac6cde169a7b186627ccbe45888fde

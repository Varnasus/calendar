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

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
Currently using local development mode. Authentication to be implemented.

### Content Items

#### Get All Content Items
```
GET /content-items
```
Response:
```json
[
  {
    "id": "uuid",
    "title": "Blog Post",
    "description": "Content description",
    "date": "2024-03-20",
    "status": "Planned",
    "campaignId": "uuid",
    "campaign": {
      "id": "uuid",
      "name": "Q1 Campaign"
    }
  }
]
```

#### Create Content Item
```
POST /content-items
```
Request Body:
```json
{
  "title": "New Blog Post",
  "description": "Post description",
  "date": "2024-03-20",
  "status": "Backlog",
  "campaignId": "optional-campaign-uuid"
}
```

#### Update Content Item
```
PUT /content-items/:id
```
Request Body:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "In Progress"
}
```

#### Delete Content Item
```
DELETE /content-items/:id
```

### Campaigns

#### Get All Campaigns
```
GET /campaigns
```
Response:
```json
[
  {
    "id": "uuid",
    "name": "Q1 Marketing Campaign",
    "description": "Campaign description",
    "startDate": "2024-01-01",
    "endDate": "2024-03-31",
    "contentItems": [],
    "socialPosts": []
  }
]
```

#### Create Campaign
```
POST /campaigns
```
Request Body:
```json
{
  "name": "Q2 Campaign",
  "description": "Campaign description",
  "startDate": "2024-04-01",
  "endDate": "2024-06-30"
}
```

#### Update Campaign
```
PUT /campaigns/:id
```
Request Body:
```json
{
  "name": "Updated Campaign Name",
  "description": "Updated description",
  "endDate": "2024-07-01"
}
```

#### Delete Campaign
```
DELETE /campaigns/:id
```

### Social Posts

#### Get All Social Posts
```
GET /social-posts
```
Response:
```json
[
  {
    "id": "uuid",
    "content": "Post content",
    "date": "2024-03-20",
    "platforms": ["twitter", "linkedin"],
    "status": "Planned",
    "campaignId": "uuid",
    "campaign": {
      "id": "uuid",
      "name": "Q1 Campaign"
    }
  }
]
```

#### Create Social Post
```
POST /social-posts
```
Request Body:
```json
{
  "content": "New social post content",
  "date": "2024-03-20",
  "platforms": ["twitter", "facebook"],
  "status": "Planned",
  "campaignId": "optional-campaign-uuid"
}
```

#### Update Social Post
```
PUT /social-posts/:id
```
Request Body:
```json
{
  "content": "Updated content",
  "platforms": ["twitter", "linkedin", "instagram"],
  "status": "In Progress"
}
```

#### Delete Social Post
```
DELETE /social-posts/:id
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": {
    "message": "Invalid request parameters",
    "details": {
      "field": "Error description"
    }
  }
}
```

#### 404 Not Found
```json
{
  "error": {
    "message": "Resource not found"
  }
}
```

#### 500 Server Error
```json
{
  "error": {
    "message": "Internal server error"
  }
}
```

### Data Models

#### Content Item
```typescript
{
  id: UUID;
  title: string;
  description?: string;
  date: Date;
  status: 'Backlog' | 'Planned' | 'In Progress' | 'Done';
  campaignId?: UUID;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Campaign
```typescript
{
  id: UUID;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  contentItems?: ContentItem[];
  socialPosts?: SocialPost[];
}
```

#### Social Post
```typescript
{
  id: UUID;
  content: string;
  date: Date;
  platforms: string[];
  status: 'Backlog' | 'Planned' | 'In Progress' | 'Done';
  campaignId?: UUID;
  createdAt: Date;
  updatedAt: Date;
}
```

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

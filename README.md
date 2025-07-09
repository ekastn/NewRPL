# NewRPL - Real-time People Listening

A comprehensive web application for emotion detection and team management with real-time facial emotion recognition capabilities.

## Project Structure

```
NewRPL/
├── backend/          # Go backend server
│   ├── main.go
│   ├── config/       # Database configuration
│   ├── controllers/  # API controllers
│   ├── middleware/   # Authentication middleware
│   ├── models/       # Data models
│   ├── routes/       # API routes
│   ├── uploads/      # File uploads
│   └── utils/        # Utility functions
└── frontend/         # React frontend application
    ├── src/
    │   ├── components/  # React components
    │   ├── context/     # React context
    │   ├── services/    # API services
    │   └── styles/      # CSS styles
    └── public/
        └── models/      # Face-API.js models
```

## Features

- **Real-time Emotion Detection**: Using Face-API.js for facial emotion recognition
- **User Authentication**: JWT-based authentication system
- **Team Management**: Dashboard for managing team members
- **Meeting Rooms**: Virtual meeting spaces with emotion tracking
- **Data Visualization**: Charts and insights using Chart.js
- **Responsive Design**: Modern UI built with React and Vite

## Technology Stack

### Backend (Go)
- Go with Gin framework
- MongoDB for data storage
- JWT for authentication
- File upload handling

### Frontend (React)
- React 19 with Vite
- React Router for navigation
- Axios for API communication
- Chart.js & react-chartjs-2 for data visualization
- Face-API.js for emotion detection

## Getting Started

### Prerequisites
- Go 1.19 or higher
- Node.js 18 or higher
- MongoDB running locally or connection string

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   go mod tidy
   ```

3. Set up environment variables in `.env`:
   ```
   MONGOSTRING=mongodb://localhost:27017
   DB_NAME=dbRPL
   USER_COLLECTION=users
   PORT=8080
   JWT_SECRET=your_super_secret_key_for_jwt_should_be_long_and_complex
   ```

4. Run the backend server:
   ```bash
   go run main.go
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/user` - Get user profile
- `POST /emotions` - Submit emotion data
- `GET /emotions` - Get emotion history

## Development

- Backend runs on `http://localhost:8080`
- Frontend runs on `http://localhost:5173`
- Ensure MongoDB is running before starting the backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

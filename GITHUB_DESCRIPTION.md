# TechTutor – Cloud-Based E-Learning Platform

A full-stack, cloud-hosted learning platform featuring secure user authentication, dynamic course management, and seamless enrollment workflows. Built with modern web technologies and cloud infrastructure to deliver a scalable, performant educational experience.

## 🎯 Overview

TechTutor is an end-to-end e-learning solution that empowers instructors to create and manage courses while enabling students to enroll, access course materials, and stream educational content. The platform leverages cloud technologies for robust data persistence and media asset management.

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React.js 19+, CSS3 |
| **Backend** | Node.js, Express.js 5+ |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **File Storage** | AWS S3 / Cloud Storage |
| **File Handling** | Multer (100MB upload support) |
| **API Communication** | RESTful APIs with CORS |

## ✨ Key Features

### 📚 Course Management
- **Create Courses**: Instructors can create new courses with title, description, and instructor details
- **Browse Courses**: Students can view all available courses in a responsive interface
- **Course Details**: View comprehensive course information including enrollment status

### 👥 User Enrollment
- **Dynamic Enrollment**: Students can enroll in multiple courses with validated user IDs
- **State Transitions**: Backend handles complex enrollment state management and validation

### 📹 Media Asset Management
- **Video Uploads**: Upload course videos with automatic cloud storage integration
- **Material Distribution**: Share PDFs and learning materials with students
- **AWS Integration**: Efficient media asset management through cloud infrastructure

### 🔐 Security & Performance
- **Secure Authentication**: User authentication via Supabase Auth
- **CORS Protection**: Cross-origin resource sharing configured for production
- **Data Validation**: Comprehensive server-side validation for all state transitions
- **Optimized Queries**: Modular controller logic for efficient database operations

## 🏗️ Architecture

### Frontend (React.js)
- Modular component architecture for maintainability and reusability
- State management with React Hooks (useState, useEffect)
- Tab-based interface for intuitive navigation
- Real-time error handling and user feedback
- Client-side performance optimization with lazy loading

### Backend (Node.js/Express)
- Modular controller logic separating concerns
- Middleware-based request processing pipeline
- Environment-based configuration management
- Multer integration for secure file uploads (100MB limit)
- Comprehensive error handling and HTTP status codes

### Database (Supabase/PostgreSQL)
- Relational schema design for courses, users, and enrollments
- Built-in authentication and RLS (Row-Level Security)
- Real-time capabilities for live updates
- Scalable cloud infrastructure

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- AWS account (for S3 storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TechTutor.git
   cd TechTutor
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create `.env` file in backend directory:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```
   
   Start the backend:
   ```bash
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   
   Update `supabase.js` with your configuration:
   ```javascript
   const API_BASE_URL = "http://localhost:5000"; // Adjust port as needed
   ```
   
   Start the frontend:
   ```bash
   npm start
   ```

## 📡 API Endpoints

### Courses
- `GET /courses` - Retrieve all courses
- `POST /course` - Create a new course
- `GET /course/:id` - Get course details

### Enrollment
- `POST /enroll` - Enroll user in a course
- `GET /enrollments/:userId` - Get user's enrollments

### Media
- `POST /upload-video` - Upload course video (multipart/form-data)
- `POST /upload-material` - Upload course materials
- `GET /media/:id` - Retrieve media file

## 📂 Project Structure

```
TechTutor/
├── backend/
│   ├── index.js              # Express server setup & API routes
│   ├── .env                  # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # Styling
│   │   ├── supabase.js       # Supabase client config
│   │   └── index.js          # React entry point
│   ├── public/
│   │   └── index.html
│   └── package.json
├── README.md
└── package.json
```

## 🔄 Data Flow

1. **User Interaction** → React UI captures user input
2. **API Request** → Frontend sends REST request to backend
3. **Backend Processing** → Express middleware processes request
4. **Database Operation** → Supabase executes query with validation
5. **Response** → Backend returns data with appropriate status codes
6. **UI Update** → React updates component state and re-renders
7. **Cloud Storage** → Media files stored in AWS/Cloud infrastructure

## 🎓 Learning Outcomes

This project demonstrates proficiency in:
- **Full-Stack Development**: End-to-end application architecture
- **Database Design**: Relational schema with proper normalization
- **Cloud Integration**: Supabase backend and AWS storage
- **State Management**: Complex enrollment workflows and state transitions
- **API Development**: RESTful design principles
- **Frontend Architecture**: Modular, component-based React development
- **Performance Optimization**: Efficient queries and client-side rendering

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss proposed changes.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Author

Created as a demonstration of full-stack e-learning platform development.

---

**Live Demo**: [Add deployment link when available]  
**GitHub Repository**: [Add repository link]

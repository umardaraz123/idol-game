# Idol Be Backend 🎮

A complete Node.js backend for the Idol Be gaming website with MongoDB database, Cloudinary media storage, multi-language content support, and a comprehensive admin panel.

## 🚀 Features

- **Multi-language Content Management**: Support for English, Hindi, Russian, Korean, Chinese, Japanese, and Spanish
- **Media Management**: Cloudinary integration for optimized image and video storage
- **Admin Panel**: Beautiful dark-themed admin interface with dashboard and content management
- **Authentication**: JWT-based secure admin authentication
- **File Upload**: Drag & drop file upload with progress tracking
- **REST APIs**: Complete API for frontend integration
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Cloudinary account for media storage

## 🛠️ Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

4. **Configure Environment Variables**
   Edit `.env` file with your actual values:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database (Use your MongoDB connection string)
   MONGODB_URI=mongodb://localhost:27017/idolbe
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/idolbe

   # JWT Secret (Generate a strong secret)
   JWT_SECRET=your_super_secret_jwt_key_here

   # Cloudinary Configuration (Get from cloudinary.com)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Admin Credentials
   ADMIN_EMAIL=idolbeadmin@idolbe.com
   ADMIN_PASSWORD=theidol234

   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start the Server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🌐 Admin Panel

Access the admin panel at: `http://localhost:5000/admin`

**Default Admin Credentials:**
- Email: `idolbeadmin@idolbe.com`
- Password: `theidol234`

### Admin Panel Features

- **Dashboard**: Overview of content and media statistics
- **Content Management**: Create, edit, and manage multi-language content
- **Media Library**: Upload, organize, and manage images and videos
- **Upload Interface**: Drag & drop file upload with progress tracking

## 📡 API Endpoints

### Public APIs (for Frontend)
- `GET /api/public/content/:language` - Get all content in specified language
- `GET /api/public/content/:language/:section` - Get specific section content

### Admin APIs
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/profile` - Get admin profile

### Content Management APIs
- `GET /api/content` - Get all content
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Media Management APIs
- `GET /api/upload/files` - Get all media files
- `POST /api/upload/single` - Upload single file
- `DELETE /api/upload/:id` - Delete media file

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── cloudinary.js        # Cloudinary configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── models/
│   ├── Admin.js             # Admin user model
│   ├── Content.js           # Multi-language content model
│   └── MediaFile.js         # Media file metadata model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── content.js           # Content management routes
│   ├── upload.js            # File upload routes
│   └── public.js            # Public API routes
├── public/
│   └── admin/               # Admin panel files
│       ├── index.html       # Admin panel HTML
│       ├── style.css        # Admin panel styles
│       └── js/              # Admin panel JavaScript modules
├── utils/
│   └── adminSetup.js        # Admin user setup utility
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── .env                     # Environment variables
```

## 🚀 Deployment

### Local Development
1. Make sure MongoDB is running locally
2. Set up Cloudinary account and get credentials
3. Configure `.env` file with your settings
4. Run `npm run dev`

### Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use MongoDB Atlas for database
   - Update `FRONTEND_URL` to your production domain

2. **Security**
   - Use strong JWT secret
   - Enable HTTPS
   - Configure proper CORS settings

3. **Cloud Platforms**
   - Deploy to Heroku, Railway, or any Node.js hosting platform
   - Set environment variables in hosting platform
   - Connect to MongoDB Atlas

## 🎨 Admin Panel Theme

The admin panel follows the same dark futuristic theme as the frontend:
- **Colors**: Neon blue (#00d4ff), purple (#b537f2), dark backgrounds
- **Fonts**: Orbitron, Rajdhani for futuristic typography
- **Design**: Clean, modern interface with glowing effects

## 🌍 Multi-language Support

Content can be managed in multiple languages:
- English (en)
- Hindi (hi)
- Russian (ru)
- Korean (ko)
- Chinese (zh)
- Japanese (ja)
- Spanish (es)

Each content item contains fields for all supported languages.

## 🔧 Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (if implemented)

### Adding New Languages
1. Update the `Content.js` model schema
2. Add language option in admin panel forms
3. Update frontend to handle new language

### Adding New Content Types
1. Extend the `Content.js` model
2. Update admin panel forms
3. Add new API endpoints if needed

## 🛡️ Security Features

- JWT authentication for admin access
- Password hashing with bcryptjs
- Rate limiting for API endpoints
- Input validation and sanitization
- CORS configuration
- File upload validation

## 📝 License

This project is part of the Idol Be gaming website. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please contact the development team.

---

**Made with 💙 for Idol Be Gaming** 🎮
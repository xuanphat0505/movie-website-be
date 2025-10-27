# Movie Website - Server API

Backend server cho ứng dụng website xem phim, được xây dựng với Node.js, Express và MongoDB.

## 🚀 Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (với Mongoose ODM)
- **Socket.IO** - Real-time communication
- **JWT** - Authentication & Authorization
- **Bcrypt.js** - Password hashing
- **Nodemailer** - Email service
- **Axios** - HTTP client

## 📋 Yêu cầu hệ thống

- Node.js >= 14.x
- MongoDB
- npm hoặc yarn

## 🔧 Cài đặt

1. Clone repository và di chuyển vào thư mục server:
```bash
cd server
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` và cấu hình các biến môi trường:
```env
PORT=5000
MONGO_CONNECTION_URL=your_mongodb_connection_string
JWT_ACCESSTOKEN_KEY=your_access_token_secret
JWT_REFRESHTOKEN_KEY=your_refresh_token_secret
JWT_RESET_PASSWORD_KEY=your_reset_password_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
VONAGE_API_KEY=your_vonage_api_key
VONAGE_API_SECRET=your_vonage_api_secret
CLIENT_URL=http://localhost:5173
```

4. Khởi chạy server:
```bash
npm start
```

Server sẽ chạy tại `http://localhost:5000`

## 📁 Cấu trúc thư mục

```
server/
├── src/
│   ├── app/              # Models và controllers
│   ├── middlewares/      # Custom middlewares
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── user.js       # User management
│   │   ├── admin.js      # Admin operations
│   │   ├── comment.js    # Comments
│   │   ├── favorite.js   # Favorites
│   │   ├── history.js    # Watch history
│   │   ├── playList.js   # Playlists
│   │   ├── rate.js       # Ratings
│   │   ├── notification.js # Notifications
│   │   ├── analytics.js  # Analytics
│   │   └── health-check.js # Health check
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── index.js          # Entry point
├── .env                  # Environment variables
├── package.json
└── readme.md
```

## 🛣️ API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký tài khoản mới
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/logout` - Đăng xuất
- `POST /api/v1/auth/refresh-token` - Làm mới access token
- `POST /api/v1/auth/forgot-password` - Quên mật khẩu
- `POST /api/v1/auth/reset-password` - Đặt lại mật khẩu
- `POST /api/v1/auth/google` - Đăng nhập với Google

### User
- `GET /api/v1/user/profile` - Lấy thông tin profile
- `PUT /api/v1/user/profile` - Cập nhật profile
- `PUT /api/v1/user/change-password` - Đổi mật khẩu
- `DELETE /api/v1/user/account` - Xóa tài khoản

### Movies
- `GET /api/v1/favorite` - Lấy danh sách phim yêu thích
- `POST /api/v1/favorite` - Thêm phim vào yêu thích
- `DELETE /api/v1/favorite/:id` - Xóa phim khỏi yêu thích

### History
- `GET /api/v1/history` - Lấy lịch sử xem phim
- `POST /api/v1/history` - Thêm lịch sử xem
- `DELETE /api/v1/history/:id` - Xóa lịch sử

### Playlist
- `GET /api/v1/play-list` - Lấy danh sách playlist
- `POST /api/v1/play-list` - Tạo playlist mới
- `PUT /api/v1/play-list/:id` - Cập nhật playlist
- `DELETE /api/v1/play-list/:id` - Xóa playlist

### Comments
- `GET /api/v1/comment/:movieId` - Lấy comments của phim
- `POST /api/v1/comment` - Thêm comment
- `PUT /api/v1/comment/:id` - Sửa comment
- `DELETE /api/v1/comment/:id` - Xóa comment

### Ratings
- `GET /api/v1/rate/:movieId` - Lấy rating của phim
- `POST /api/v1/rate` - Đánh giá phim
- `PUT /api/v1/rate/:id` - Cập nhật rating

### Notifications
- `GET /api/v1/notification` - Lấy danh sách thông báo
- `PUT /api/v1/notification/:id/read` - Đánh dấu đã đọc
- `DELETE /api/v1/notification/:id` - Xóa thông báo

### Analytics (Admin)
- `GET /api/v1/analytics/overview` - Tổng quan thống kê
- `GET /api/v1/analytics/users` - Thống kê người dùng
- `GET /api/v1/analytics/movies` - Thống kê phim

### Admin
- `GET /api/v1/admin/users` - Quản lý người dùng
- `PUT /api/v1/admin/users/:id` - Cập nhật thông tin user
- `DELETE /api/v1/admin/users/:id` - Xóa user
- `GET /api/v1/admin/reports` - Xem báo cáo

### Health Check
- `GET /api/v1/health-check` - Kiểm tra trạng thái server

## 🔐 Authentication

API sử dụng JWT (JSON Web Tokens) để xác thực:
- **Access Token**: Có thời hạn ngắn, dùng cho các request API
- **Refresh Token**: Có thời hạn dài, dùng để làm mới access token

Gửi access token trong header:
```
Authorization: Bearer <access_token>
```

## 🔌 Socket.IO Events

Server hỗ trợ real-time communication cho:
- Thông báo mới
- Comments real-time
- Cập nhật trạng thái online/offline

## 🛡️ Security Features

- Password hashing với bcrypt
- JWT authentication
- CORS configuration
- Cookie parser
- Input validation
- Rate limiting (nếu có)

## 📧 Email Service

Sử dụng Nodemailer để gửi email:
- Email xác thực tài khoản
- Email reset mật khẩu
- Email thông báo

## 🐛 Debug

Để chạy ở chế độ development với nodemon:
```bash
npm start
```

## 📝 Scripts

- `npm start` - Khởi chạy server với nodemon (auto-reload)
- `npm test` - Chạy tests (chưa cấu hình)

## 🤝 Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

ISC

## 👥 Author

Phát Trần

## 📞 Support

Email: phattran052004@gmail.com

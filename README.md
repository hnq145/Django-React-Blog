# 🚀 Nền tảng Blog Tích hợp AI Thế hệ mới (Next-Gen AI Integrated Blog)

Dự án phát triển nền tảng Blog Full-stack hiện đại, kết hợp sức mạnh của **Generative AI** và **Real-time Communication** để nâng cao trải nghiệm người dùng và người sáng tạo nội dung.

## 📖 Giới thiệu (Overview)

Đây không chỉ là một CMS thông thường. Hệ thống được xây dựng trên kiến trúc **Decoupled (Headless)**, tách biệt hoàn toàn giữa Backend và Frontend, mang lại hiệu năng cao và khả năng mở rộng linh hoạt. Điểm nhấn của dự án là việc tích hợp sâu **Google Gemini AI** để tự động hóa quy trình sáng tạo và tương tác thông minh.

### 🌟 Tính năng nổi bật (Highlights)

- **🤖 Trợ lý AI Đa phương tiện:**
  - **Tạo ảnh minh họa (Text-to-Image):** Tự động tạo ảnh thumbnail đẹp mắt từ mô tả bài viết (Sử dụng Google Imagen/Gemini & Pollinations.ai fallback).
  - **Tóm tắt nội dung:** Tự động đọc và tóm tắt bài viết dài thành nội dung ngắn gọn, hiển thị ngay đầu trang.
  - **Chatbot thông minh:** Trợ lý ảo hỗ trợ trả lời câu hỏi, gợi ý ý tưởng viết bài, và trò chuyện trực tiếp với người dùng.
- **💬 Nhắn tin Real-time:** Hệ thống chat hỗ trợ gửi **Tin nhắn văn bản**, **Hình ảnh**, và **Video** (xem trực tiếp trong khung chat).
- **📝 Trình soạn thảo Rich Text:** Soạn thảo bài viết chuyên nghiệp với định dạng văn bản, chèn ảnh/video dễ dàng.
- **⚡ Thông báo tức thì:** Hệ thống Push Notification real-time qua WebSockets.
- **🔐 Bảo mật:** Xác thực JWT (JSON Web Token) an toàn.

## 🛠️ Tech Stack (Công nghệ sử dụng)

### Backend (Core)

- **Framework:** Python / Django 4.2+ & Django REST Framework (DRF)
- **Real-time:** Django Channels & Daphne (ASGI Server)
- **AI Integration:** Google Generative AI SDK (`google-genai`), Requests
- **Database:** SQLite (Dev) / PostgreSQL (Production ready)
- **Authentication:** SimpleJWT

### Frontend (User Interface)

- **Framework:** ReactJS 18+ (Vite Build Tool)
- **State Management:** Zustand (Nhẹ và nhanh hơn Redux)
- **HTTP Client:** Axios Interceptors (Tự động refresh token)
- **UI Libraries:** React Bootstrap, SweetAlert2
- **Editor:** React Quill
- **Markdown:** React Markdown & Remark GFM

## ✨ Chi tiết Tính năng (Detailed Features)

### 1. Phân hệ AI (AI Module)

- **Cơ chế Fallback thông minh:** Hệ thống tự động chuyển đổi giữa các model AI (Imagen 3 -> Gemini 2.0 -> Pollinations.ai) để đảm bảo dịch vụ luôn hoạt động dù API chính gặp sự cố.
- **Xử lý nền (Background Processing):** Sử dụng Threading & Django Signals để xử lý các tác vụ AI nặng (tóm tắt, tạo ảnh) mà không làm lag giao diện người dùng.

### 2. Phân hệ Chat (Communication)

- Gửi/Nhận tin nhắn thời gian thực.
- Hỗ trợ kéo thả gửi ảnh và video.
- Trình phát Video HTML5 tích hợp sẵn trong khung chat.
- Trả lời tin nhắn bằng AI (Auto-reply Smart Assistant).

### 3. Quản lý Nội dung (CMS)

- Dashboard quản lý bài viết trực quan.
- Thống kê lượt xem, lượt thích, bình luận.
- Tương tác: Like (thả tim, haha, sad...), Comment, Bookmark.

## ⚙️ Cài đặt & Triển khai (Installation)

### Yêu cầu tiên quyết

- Python 3.9+
- Node.js 16+
- API Key từ Google AI Studio

### Bước 1: Backend Setup

```bash
# Clone dự án
git clone https://github.com/username/project-name.git
cd backend

# Tạo môi trường ảo
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Cài đặt thư viện
pip install -r requirements.txt

# Tạo file .env và thêm GEMINI_API_KEY
echo "GEMINI_API_KEY=your_key_here" > .env

# Chạy Migrations
python manage.py migrate

# Khởi chạy server (Hỗ trợ WebSocket)
daphne -p 8000 backend.asgi:application
```

### Bước 2: Frontend Setup

```bash
cd frontend

# Cài đặt packages
npm install

# Chạy development server
npm run dev
```

Truy cập: `http://localhost:5173`

## 🤝 Đóng góp & Tác giả

Dự án này được thực hiện bởi **Hoàng Ngọc Quý**.

> _"Lời tạm biệt: Có lẽ đây là dự án cá nhân cuối cùng của mình với cương vị là một Full-stack Web Developer chuyên sâu (Software Engineer). Mình đang chuyển hướng sang con đường Business Analyst (BA) / Product Manager (PM) để mở rộng cơ hội nghề nghiệp và phát huy thế mạnh tư duy sản phẩm. Tuy nhiên, đam mê code vẫn còn đó, và mình vẫn sẽ code freelance vì niềm vui! Cảm ơn GitHub và cộng đồng Open Source."_

---

© 2026 Hoang Ngoc Quy. Licensed under MIT.

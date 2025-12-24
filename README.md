# 🚀 Website Blog Tích hợp Trí tuệ Nhân tạo (AI Integrated Blog Platform)

Xây dựng hệ thống quản trị nội dung Blog hiện đại với kiến trúc Decoupled, tích hợp Gemini AI và thông báo thời gian thực.

## 📖 Giới thiệu (Overview)

Dự án này là một nền tảng **Website Blog Full-stack** được xây dựng dựa trên kiến trúc tách biệt (**Decoupled Architecture**) giữa Backend và Frontend. Hệ thống không chỉ cung cấp các chức năng quản lý nội dung (CMS) tiêu chuẩn mà còn tích hợp sâu **Generative AI (Google Gemini)** để hỗ trợ tác giả sáng tạo nội dung và công nghệ **WebSocket** để tương tác thời gian thực.

### 🎯 Điểm nhấn công nghệ
* **Kiến trúc hiện đại:** Tách biệt hoàn toàn API (Django) và Giao diện (ReactJS).
* **Trợ lý AI thông minh:** Tự động tóm tắt bài viết, gợi ý ý tưởng và tạo nội dung dựa trên ngữ cảnh (Contextual AI).
* **Real-time:** Hệ thống thông báo đẩy (Push Notification) tức thì khi có tương tác mới.
* **Bảo mật:** Xác thực người dùng bằng cơ chế JWT (JSON Web Token).

## 🛠️ Tech Stack (Công nghệ sử dụng)

### Backend
* **Ngôn ngữ:** Python 3.9+
* **Framework:** Django 4.2, Django REST Framework (DRF)
* **Real-time:** Django Channels, Daphne
* **AI Integration:** Google Generative AI SDK (Gemini API)
* **Database:** SQLite (Dev) / PostgreSQL (Production ready)
* **Message Broker:** Redis (cho WebSocket layer)

### Frontend
* **Library:** ReactJS 18+
* **State Management:** Zustand
* **HTTP Client:** Axios
* **Routing:** React Router DOM
* **Styling:** Bootstrap 5 / Tailwind CSS
* **Form Handling:** React Hook Form

## ✨ Tính năng chính (Key Features)

### 1. Phân hệ Người dùng & Xác thực
* Đăng ký / Đăng nhập / Đăng xuất.
* Cơ chế xác thực bảo mật **JWT** (Access & Refresh Token).
* Quản lý Hồ sơ cá nhân (Profile), thay đổi Avatar.

### 2. Quản lý Nội dung (Blog Core)
* **CRUD Bài viết:** Tạo, Xem, Sửa, Xóa bài viết với trình soạn thảo trực quan.
* **Phân loại:** Quản lý Danh mục (Categories) và Thẻ (Tags).
* **Tương tác:** Bình luận (Comments), Thích (Likes), Lưu bài viết (Bookmarks).
* **Tìm kiếm & Lọc:** Tìm kiếm theo từ khóa, lọc theo danh mục.

### 3. 🤖 Trợ lý AI (AI Assistant)
* **Chatbot ngữ cảnh:** Widget chat tích hợp ngay trong trang soạn thảo.
* **Tóm tắt tự động:** AI đọc và tóm tắt nội dung bài viết dài.
* **Hỗ trợ viết:** Gợi ý tiêu đề, viết đoạn mở đầu, kiểm tra chính tả.

### 4. ⚡ Thông báo thời gian thực (Real-time)
* Nhận thông báo **ngay lập tức** khi có người Like hoặc Comment vào bài viết của bạn.
* Cập nhật số lượng thông báo chưa đọc (Notification Badge).

## ⚙️ Cài đặt & Triển khai (Installation)

### Yêu cầu tiên quyết
* Python 3.8+
* Node.js 16+ & npm/yarn
* Redis (Cần thiết cho tính năng Real-time)
* API Key từ [Google AI Studio](https://aistudio.google.com/)

### Bước 1: Thiết lập Backend (Django)

1.  Clone repository:
    ```bash
    git clone [https://github.com/username/your-repo-name.git](https://github.com/username/your-repo-name.git)
    cd your-repo-name/backend
    ```

2.  Tạo và kích hoạt môi trường ảo:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  Cài đặt dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Cấu hình biến môi trường:
    * Tạo file `.env` trong thư mục gốc backend.
    * Thêm: `GEMINI_API_KEY=your_api_key_here`

5.  Chạy Migrations và khởi động Server:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver
    # Hoặc chạy với Daphne cho WebSocket
    # daphne -p 8000 backend.asgi:application
    ```

### Bước 2: Thiết lập Frontend (React)

1.  Di chuyển vào thư mục frontend:
    ```bash
    cd ../frontend
    ```

2.  Cài đặt packages:
    ```bash
    npm install
    # hoặc
    yarn install
    ```

3.  Khởi động React App:
    ```bash
    npm start
    # hoặc
    yarn start
    ```
    Truy cập tại: `http://localhost:3000`

## 🤝 Đóng góp (Contributing)
Mọi đóng góp đều được hoan nghênh. Vui lòng mở Pull Request hoặc tạo Issue để thảo luận.

## 📄 Bản quyền (License)
Dự án này được thực hiện bởi **Hoàng Ngọc Quý** 

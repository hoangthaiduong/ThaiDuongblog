# ThaiDuong Profile CMS — GitHub Pages Edition

Đây là bản **static** dành riêng cho GitHub Pages.

## Quan trọng
GitHub Pages chỉ host static HTML/CSS/JavaScript. Nó không chạy Node.js/Express/SQLite trực tiếp. Vì vậy bản này dùng `localStorage` của trình duyệt để lưu nội dung Admin.

- Public profile hoạt động qua link GitHub Pages.
- Posts, Projects, Profile, Media và Dark mode hoạt động.
- Admin chỉnh sửa được nội dung ngay trong trình duyệt.
- Có Export/Import JSON để sao lưu dữ liệu.
- Tài khoản demo: `admin`
- Tài khoản Admin: `admin`
- Mật khẩu được cấu hình trong `js/admin.js`; không hiển thị trên trang đăng nhập.

**Giới hạn:** đăng nhập Admin của bản GitHub Pages không phải xác thực bảo mật server-side. Dữ liệu cũng không đồng bộ giữa các máy/trình duyệt. Không dùng bản này cho nội dung bí mật hoặc hệ thống production cần bảo mật thực sự.

## Đưa lên GitHub
1. Tạo repository mới trên GitHub.
2. Upload toàn bộ file trong thư mục này lên nhánh `main`.
3. Vào `Settings` → `Pages`.
4. Chọn `GitHub Actions` làm Source, hoặc dùng workflow đã có ở `.github/workflows/pages.yml`.
5. Push lại nếu cần. Sau khi workflow chạy xong, bấm **Visit site**.

GitHub Pages thường có URL dạng:
`https://USERNAME.github.io/REPOSITORY/`

Nếu repository có tên `USERNAME.github.io`, URL sẽ là:
`https://USERNAME.github.io/`

## Cập nhật web
Sửa file → commit/push lên `main` → GitHub Actions tự deploy lại.

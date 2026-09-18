# MyGarden

PWA tập trung với vườn 4×4, cây/hoa/động vật, mở rộng từng 16 ô và âm thanh MP3 trong thư mục sound. Không cần cài dependency.

Giao diện responsive cho điện thoại, tablet và máy tính, không còn giới hạn vào màn vuông 720×720. Trên màn hình thấp hoặc khi xoay ngang, trang có thể cuộn để mọi điều khiển vẫn sử dụng được. Vòng thời lượng, nền tròn và mốc kéo dùng chung tâm và bán kính.

Ban đầu có 6 sinh vật. Mỗi 300 phút tập trung hoàn thành mở thêm 3 sinh vật (cây, hoa, thú), tại các mốc 5/10/15/20 giờ, tổng cộng 18 loại. Thời gian phiên đang chạy hoặc hủy sớm không được tính. Bộ chọn hiển thị mốc khóa và thời gian còn lại. Dữ liệu vườn cũ được giữ nguyên.

Âm thanh dùng ba bản MP3 do người dùng cung cấp: liecio-calming-rain.mp3 (mưa), alex_jauk-calm-zen-river-flowing-228223.mp3 (suối), focus.mp3 (tập trung). Hỗ trợ lặp lại, đổi bản, âm lượng và tự dừng khi phiên kết thúc. PWA lưu cả ba bản, khoảng 6,6 MB, để dùng ngoại tuyến sau lần tải đầu.

## Chạy

```sh
npm start
```

Mở http://localhost:4173. Kiểm tra bằng `npm test`.

## Cài đặt và ngoại tuyến

Đưa các file tĩnh lên hosting HTTPS. Mở ứng dụng một lần có mạng để service worker lưu tài nguyên. Sau đó ứng dụng và âm thanh hoạt động ngoại tuyến. Trình duyệt hỗ trợ sẽ hiện nút **Cài ứng dụng**; cũng có thể dùng menu trình duyệt → Cài ứng dụng/Thêm vào màn hình chính. iOS: Safari → Chia sẻ → Thêm vào màn hình chính.

HTTP qua địa chỉ IP nội bộ chỉ dùng xem giao diện; PWA cần HTTPS hoặc localhost. Không khóa hướng màn hình.

## Dữ liệu và thời gian

Chọn thời lượng bằng vòng quanh cây: góc dưới trái 0 phút, phía trên 30 phút, góc dưới phải 60 phút. Kéo hoặc chạm vòng; phím mũi tên thay đổi 1 phút, Page Up/Down thay đổi 5 phút, Home/End chọn 0/60. Mốc 0 không thể bắt đầu phiên. Vòng khóa trong phiên. Phiên cũ dài hơn 60 phút vẫn tiếp tục; thời lượng cho phiên mới giới hạn 60 phút. Khi deploy, upload thêm duration-dial.js.

Trong **Khu vườn → Dữ liệu**, chọn **Xuất dữ liệu JSON** để tải file sao lưu. Trên website hoặc thiết bị mới, mở cùng mục, chọn **Nhập dữ liệu JSON**, xem thông tin và xác nhận thay thế. File giữ cây, thời gian hoàn thành, tiến trình mở khóa, thiết lập và phiên đang chạy. Phiên không tạm dừng khi chuyển thiết bị; nếu đã hết giờ, sẽ được hoàn thành sau khi nhập.

Nhập thay thế dữ liệu hiện tại, không gộp hai vườn. Xuất bản hiện tại trước nếu muốn giữ lại. File không hợp lệ bị từ chối; giới hạn 5 MB. Thêm backup.js vào các file upload khi deploy.

Dữ liệu lưu trong localStorage của trình duyệt/thiết bị hiện tại. Xóa dữ liệu website sẽ xóa vườn. Cây héo từ prototype không được chuyển sang vườn mới.

Phiên lưu thời điểm kết thúc; tải lại hoặc mở lại sau khi ngủ sẽ tính lại thời gian và ghi nhận hoàn thành một lần. Không có thông báo nền khi ứng dụng đóng. Thay đổi đồng hồ hệ thống sẽ ảnh hưởng thời gian phiên. Nhạc có thể bị hệ điều hành ngắt khi ngủ.

## Cập nhật

Khi thay đổi tài nguyên, tăng tên CACHE trong sw.js. Bản mới kích hoạt sau khi đóng các cửa sổ ứng dụng cũ. Ao cá dành cho giai đoạn sau.

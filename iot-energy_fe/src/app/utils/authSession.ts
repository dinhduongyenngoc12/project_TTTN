const AUTH_NOTICE_KEY = "AUTH_NOTICE";

//Lưu thông báo ngắn hạn để vẫn hiển thị được sau khi chuyển về trang đăng nhập
export function saveAuthNotice(message: string) {
    sessionStorage.setItem(AUTH_NOTICE_KEY, message);
}

//Đọc thông báo của lần kết thúc phiên gần nhất
export function getAuthNotice(): string {
    return sessionStorage.getItem(AUTH_NOTICE_KEY) ?? "";
}

//Xóa thông báo sau khi đã hiển thị để tránh lặp lại ở lần truy cập sau
export function clearAuthNotice() {
    sessionStorage.removeItem(AUTH_NOTICE_KEY);
}

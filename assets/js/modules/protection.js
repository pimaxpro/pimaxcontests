/* =========================================================
   MODULE: SECURITY & PROTECTION (CHỐNG COPY & CHẶN INSPECT)
========================================================= */

window.ProtectionModule = {
  init() {
    // 1. Chặn chuột phải (Context Menu)
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (window.UIComponentsModule && window.UIComponentsModule.showToast) {
        window.UIComponentsModule.showToast('Thao tác chuột phải đã bị vô hiệu hóa!', 'fa-solid fa-lock');
      }
      return false;
    });

    // 2. Chặn các phím tắt Copy, In, Xem Source, Mở Developer Tools
    document.addEventListener('keydown', (e) => {
      // Chặn F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Chặn Ctrl+U (Xem mã nguồn trang)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }

      // Chặn Ctrl+S (Lưu trang web)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
        e.preventDefault();
        return false;
      }

      // Chặn Ctrl+C (Sao chép) & Ctrl+A (Chọn tất cả) & Ctrl+P (In trang)
      if (e.ctrlKey && ['c', 'C', 'a', 'A', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
        return false;
      }

      // Chặn Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (Mở F12 DevTools)
      if (e.ctrlKey && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key)) {
        e.preventDefault();
        return false;
      }

      // Chặn Cmd (Mac) tương tự Ctrl (Windows)
      if (e.metaKey && ['c', 'C', 'a', 'A', 'u', 'U', 's', 'S', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
    });

    // 3. Chặn sự kiện Copy & Cut từ clipboard
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('cut', (e) => e.preventDefault());

    // 4. Bẫy debugger: Tự động vô hạn dừng thi hành nếu học sinh cố tình mở DevTools bằng menu trình duyệt
    setInterval(() => {
      const startTime = performance.now();
      debugger;
      const endTime = performance.now();
      // Nếu DevTools đang mở, lệnh debugger sẽ làm khựng tiến trình
      if (endTime - startTime > 100) {
        document.body.innerHTML = '<div style="text-align:center; padding:50px; font-family:sans-serif;"><h2>Cảnh báo bảo mật</h2><p>Vui lòng đóng Cửa sổ kiểm tra (DevTools) để tiếp tục sử dụng website PimaX.</p></div>';
      }
    }, 1000);
  }
};

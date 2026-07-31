/* =========================================================
   MODULE: UI COMPONENTS (FOOTER & PREMIUM TOAST NOTIFICATION)
========================================================= */

window.UIComponentsModule = {
  toastTimeout: null,

  init() {
    this.renderFooter();
    this.createToastContainer();
  },

  renderFooter() {
    if (document.querySelector('.site-footer')) return;

    const footer = document.createElement('footer');
    footer.className = 'site-footer';

    footer.innerHTML = `
      <hr class="footer-divider">
      <div class="footer-content">
        <img src="assets/logo1.svg" alt="PimaX Logo" class="footer-logo">
        <span>BẢN QUYỀN THUỘC VỀ PIMAX</span>
      </div>
    `;

    document.body.appendChild(footer);
  },

  createToastContainer() {
    if (document.getElementById('toast-notification')) return;

    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'custom-toast-pill';
    
    // Cấu trúc HTML chuẩn cho Toast xịn
    toast.innerHTML = `
      <div class="toast-icon-wrapper">
        <i class="fa-solid fa-check"></i>
      </div>
      <div class="toast-body">
        <span id="toast-message">Thông báo</span>
      </div>
    `;

    document.body.appendChild(toast);
  },

  showToast(message, iconClass = 'fa-solid fa-check') {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      this.createToastContainer();
      toast = document.getElementById('toast-notification');
    }

    const msgEl = document.getElementById('toast-message');
    const iconEl = toast.querySelector('.toast-icon-wrapper i');

    if (msgEl) msgEl.textContent = message;
    if (iconEl) iconEl.className = iconClass;

    // Reset lại animation bằng cách remove/add class .active
    toast.classList.remove('active');
    void toast.offsetWidth; // Trigger reflow để restart animation
    toast.classList.add('active');

    // Xóa timeout cũ nếu người dùng thao tác liên tục
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('active');
    }, 3200);
  }
};

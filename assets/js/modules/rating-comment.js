/* =========================================================
   MODULE: RATING & COMMENT SYSTEM (GLOBAL & ITEM MANAGEMENT)
========================================================= */

window.RatingCommentModule = {
  currentExamKey: '',
  selectedNewRating: 0,
  activeReplyId: null,

  init(examTitle) {
    // Mặc định nếu không có examTitle cụ thể thì lấy Key chung của Giải đấu
    const fallbackTitle = document.getElementById('hero-title')?.textContent || 'PIMAX_TSABK_TOURNAMENT';
    const activeTitle = (examTitle && examTitle !== '--') ? examTitle : fallbackTitle;
    
    // Chuẩn hóa Key lưu trữ
    this.currentExamKey = 'pimax_cmt_' + activeTitle.trim().replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    
    this.ensureConfirmModal();
    this.renderRatingState();
    this.renderCommentsList();
    this.bindEvents();
    this.enableAutoResizeTextareas();
  },

  ensureConfirmModal() {
    if (document.getElementById('rating-confirm-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'rating-confirm-modal';
    modal.className = 'rating-modal-overlay';
    modal.innerHTML = `
      <div class="rating-modal-card">
        <div class="modal-icon"><i class="fa-solid fa-arrows-rotate"></i></div>
        <h3>Xác nhận thay đổi đánh giá?</h3>
        <p>Bạn đã từng đánh giá nội dung này. Bạn có chắc chắn muốn thay đổi số sao đánh giá không?</p>
        <div class="modal-actions">
          <button id="btn-cancel-revote" class="modal-btn btn-cancel">Hủy bỏ</button>
          <button id="btn-confirm-revote" class="modal-btn btn-confirm">Xác nhận đổi</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btn-cancel-revote').onclick = () => this.closeConfirmModal();
    document.getElementById('btn-confirm-revote').onclick = () => {
      this.applyRating(this.selectedNewRating);
      this.closeConfirmModal();
      if (window.UIComponentsModule?.showToast) {
        window.UIComponentsModule.showToast("Cập nhật đánh giá thành công!");
      }
    };
  },

  openConfirmModal(newStar) {
    this.selectedNewRating = newStar;
    const modal = document.getElementById('rating-confirm-modal');
    if (modal) modal.classList.add('show');
  },

  closeConfirmModal() {
    const modal = document.getElementById('rating-confirm-modal');
    if (modal) modal.classList.remove('show');
  },

  applyRating(starValue) {
    const storageKey = `${this.currentExamKey}_rating`;
    localStorage.setItem(storageKey, starValue);
    this.updateStatsData(starValue);
    this.renderRatingState();
  },

  updateStatsData(starValue) {
    const statsKey = `${this.currentExamKey}_stats`;
    let stats = JSON.parse(localStorage.getItem(statsKey)) || {
      avg: 5.0, total: 1, counts: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 }
    };

    stats.counts[starValue] = (stats.counts[starValue] || 0) + 1;
    stats.total += 1;
    
    let sum = 0;
    for (let s = 1; s <= 5; s++) {
      sum += s * (stats.counts[s] || 0);
    }
    stats.avg = (sum / stats.total).toFixed(1);

    localStorage.setItem(statsKey, JSON.stringify(stats));
  },

  renderRatingState() {
    const storageKey = `${this.currentExamKey}_rating`;
    const userRating = parseInt(localStorage.getItem(storageKey)) || 0;

    const stars = document.querySelectorAll('#user-star-input i');
    stars.forEach((star, index) => {
      star.className = (index + 1 <= userRating) ? 'fa-solid fa-star active' : 'fa-regular fa-star';
    });

    const statsKey = `${this.currentExamKey}_stats`;
    const stats = JSON.parse(localStorage.getItem(statsKey)) || {
      avg: 5.0, total: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };

    const avgEl = document.getElementById('rating-avg-num');
    const totalEl = document.getElementById('rating-total-count');
    if (avgEl) avgEl.textContent = stats.avg;
    if (totalEl) totalEl.textContent = `${stats.total} lượt đánh giá`;

    for (let i = 1; i <= 5; i++) {
      const bar = document.getElementById(`star-bar-${i}`);
      const countEl = document.getElementById(`star-count-${i}`);
      const count = stats.counts[i] || 0;
      const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;

      if (bar) bar.style.width = `${percent}%`;
      if (countEl) countEl.textContent = count;
    }
  },

  bindEvents() {
    const stars = document.querySelectorAll('#user-star-input i');
    stars.forEach(star => {
      star.onclick = (e) => {
        const clickedVal = parseInt(e.target.getAttribute('data-value'));
        const storageKey = `${this.currentExamKey}_rating`;
        const previousRating = parseInt(localStorage.getItem(storageKey)) || 0;

        if (previousRating > 0) {
          if (previousRating === clickedVal) return;
          this.openConfirmModal(clickedVal);
        } else {
          this.applyRating(clickedVal);
          if (window.UIComponentsModule?.showToast) {
            window.UIComponentsModule.showToast("Cảm ơn bạn đã gửi đánh giá!");
          }
        }
      };
    });

    const cmtForm = document.getElementById('cmt-submit-form');
    if (cmtForm) {
      cmtForm.onsubmit = (e) => {
        e.preventDefault();
        this.handleCommentSubmit();
      };
    }
  },

  enableAutoResizeTextareas() {
    document.addEventListener('input', (e) => {
      if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'textarea') {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
      }
    });
  },

  handleCommentSubmit() {
    const nameInput = document.getElementById('cmt-user-name');
    const ageInput = document.getElementById('cmt-user-age');
    const contentInput = document.getElementById('cmt-user-content');

    if (!nameInput || !contentInput || !nameInput.value.trim() || !contentInput.value.trim()) return;

    const newComment = {
      id: Date.now(),
      name: nameInput.value.trim(),
      age: ageInput ? ageInput.value.trim() : '',
      content: contentInput.value.trim(),
      time: new Date().toLocaleDateString('vi-VN'),
      replies: []
    };

    const cmtKey = `${this.currentExamKey}_list`;
    const existingCmts = JSON.parse(localStorage.getItem(cmtKey)) || [];
    existingCmts.unshift(newComment);

    localStorage.setItem(cmtKey, JSON.stringify(existingCmts));
    contentInput.value = '';
    contentInput.style.height = 'auto';
    this.renderCommentsList();

    if (window.UIComponentsModule?.showToast) {
      window.UIComponentsModule.showToast("Đã gửi bình luận thành công!");
    }
  },

  toggleReplyForm(commentId) {
    this.activeReplyId = (this.activeReplyId === commentId) ? null : commentId;
    this.renderCommentsList();
  },

  submitReply(parentCommentId) {
    const nameInput = document.getElementById(`reply-name-${parentCommentId}`);
    const contentInput = document.getElementById(`reply-content-${parentCommentId}`);

    if (!nameInput || !contentInput || !nameInput.value.trim() || !contentInput.value.trim()) return;

    const replyObj = {
      id: Date.now(),
      name: nameInput.value.trim(),
      content: contentInput.value.trim(),
      time: new Date().toLocaleDateString('vi-VN')
    };

    const cmtKey = `${this.currentExamKey}_list`;
    const comments = JSON.parse(localStorage.getItem(cmtKey)) || [];

    const parentCmt = comments.find(c => c.id === parentCommentId);
    if (parentCmt) {
      if (!parentCmt.replies) parentCmt.replies = [];
      parentCmt.replies.push(replyObj);
      localStorage.setItem(cmtKey, JSON.stringify(comments));
    }

    this.activeReplyId = null;
    this.renderCommentsList();

    if (window.UIComponentsModule?.showToast) {
      window.UIComponentsModule.showToast("Đã gửi câu trả lời thành công!");
    }
  },

  renderCommentsList() {
    const cmtKey = `${this.currentExamKey}_list`;
    const comments = JSON.parse(localStorage.getItem(cmtKey)) || [];
    const container = document.getElementById('comments-feed-list');
    const badgeEl = document.getElementById('comment-total-badge');

    let totalCount = 0;
    comments.forEach(c => {
      totalCount += 1 + (c.replies ? c.replies.length : 0);
    });

    if (badgeEl) badgeEl.textContent = `(${totalCount})`;
    if (!container) return;

    if (comments.length === 0) {
      container.innerHTML = `
        <div class="empty-comments-state">
          <i class="fa-regular fa-comments"></i>
          <p>Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = comments.map(item => {
      const isRepFormOpen = this.activeReplyId === item.id;
      const repliesHtml = (item.replies || []).map(reply => `
        <div class="comment-item-card reply-item">
          <div class="comment-avatar reply-avatar"><i class="fa-solid fa-reply"></i></div>
          <div class="comment-content-box">
            <div class="comment-user-meta">
              <span class="user-name">${reply.name}</span>
              <span class="comment-time">${reply.time}</span>
            </div>
            <p class="comment-text">${reply.content}</p>
          </div>
        </div>
      `).join('');

      return `
        <div class="comment-block-wrapper">
          <div class="comment-item-card">
            <div class="comment-avatar"><i class="fa-solid fa-user"></i></div>
            <div class="comment-content-box">
              <div class="comment-user-meta">
                <span class="user-name">${item.name}</span>
                ${item.age ? `<span class="user-badge">${item.age} tuổi</span>` : ''}
                <span class="comment-time">${item.time}</span>
              </div>
              <p class="comment-text">${item.content}</p>
              
              <div class="comment-actions-bar">
                <button class="btn-reply-trigger" onclick="RatingCommentModule.toggleReplyForm(${item.id})">
                  <i class="fa-solid fa-reply"></i> Trả lời ${item.replies?.length ? `<span class="reply-count-badge">${item.replies.length}</span>` : ''}
                </button>
              </div>
            </div>
          </div>

          ${isRepFormOpen ? `
            <div class="reply-form-card">
              <div class="reply-card-header">
                <i class="fa-solid fa-turn-down"></i> Trả lời <strong>${item.name}</strong>
              </div>
              <div class="reply-inputs-row">
                <input type="text" id="reply-name-${item.id}" placeholder="Họ và tên..." required />
              </div>
              <textarea id="reply-content-${item.id}" rows="1" placeholder="Viết phản hồi của bạn..." required></textarea>
              <div class="reply-btn-row">
                <button class="btn-cancel-reply" onclick="RatingCommentModule.toggleReplyForm(${item.id})">Hủy</button>
                <button class="btn-submit-reply" onclick="RatingCommentModule.submitReply(${item.id})">
                  <i class="fa-solid fa-paper-plane"></i> Gửi trả lời
                </button>
              </div>
            </div>
          ` : ''}

          <div class="replies-container">
            ${repliesHtml}
          </div>
        </div>
      `;
    }).join('');
  }
};

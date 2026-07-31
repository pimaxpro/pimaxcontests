/* =========================================================
   MODULE: RATING & COMMENT SYSTEM (ĐÁNH GIÁ SAO & BÌNH LUẬN DÙNG CHUNG)
========================================================= */

window.RatingCommentModule = {
  currentExamKey: '',

  init() {
    this.bindEvents();
  },

  // Load Đánh giá & Bình luận khi chuyển sang Bài thi bất kỳ
  loadForExam(examTitle) {
    if (!examTitle) return;
    this.currentExamKey = 'pimax_exam_' + examTitle.split('(')[0].trim().replace(/[^a-zA-Z0-9]/g, '_');

    this.renderRatingStats();
    this.renderComments();
  },

  // 1. XỬ LÝ ĐÁNH GIÁ SAO
  getRatingData() {
    const defaultData = {
      totalVotes: 8,
      sumStars: 39,
      starsCount: { 5: 7, 4: 1, 3: 0, 2: 0, 1: 0 },
      userVoted: false
    };
    const stored = localStorage.getItem(this.currentExamKey + '_rating');
    return stored ? JSON.parse(stored) : defaultData;
  },

  saveRatingData(data) {
    localStorage.setItem(this.currentExamKey + '_rating', JSON.stringify(data));
  },

  renderRatingStats() {
    const data = this.getRatingData();
    const avg = data.totalVotes > 0 ? (data.sumStars / data.totalVotes).toFixed(1) : '5.0';

    const avgEl = document.getElementById('rating-avg-num');
    const countEl = document.getElementById('rating-total-count');
    const starsSummaryEl = document.getElementById('rating-summary-stars');

    if (avgEl) avgEl.textContent = avg;
    if (countEl) countEl.textContent = `${data.totalVotes} lượt đánh giá`;

    if (starsSummaryEl) {
      let starsHTML = '';
      const roundedAvg = Math.round(parseFloat(avg));
      for (let i = 1; i <= 5; i++) {
        starsHTML += `<i class="${i <= roundedAvg ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;
      }
      starsSummaryEl.innerHTML = starsHTML;
    }

    for (let i = 5; i >= 1; i--) {
      const barEl = document.getElementById(`star-bar-${i}`);
      const countNumEl = document.getElementById(`star-count-${i}`);
      const count = data.starsCount[i] || 0;
      const percent = data.totalVotes > 0 ? Math.round((count / data.totalVotes) * 100) : 0;

      if (barEl) barEl.style.width = `${percent}%`;
      if (countNumEl) countNumEl.textContent = count;
    }

    this.highlightInteractiveStars(data.userVoted ? data.userVotedVal : 0);
  },

  highlightInteractiveStars(val) {
    const stars = document.querySelectorAll('#user-star-input i');
    stars.forEach((star, index) => {
      if (index < val) {
        star.classList.remove('fa-regular');
        star.classList.add('fa-solid', 'active');
      } else {
        star.classList.remove('fa-solid', 'active');
        star.classList.add('fa-regular');
      }
    });
  },

  submitRating(starValue) {
    const data = this.getRatingData();
    if (data.userVoted) {
      if (window.UIComponentsModule) window.UIComponentsModule.showToast('Bạn đã đánh giá bài thi này rồi!', 'fa-solid fa-circle-info');
      return;
    }

    data.totalVotes += 1;
    data.sumStars += starValue;
    data.starsCount[starValue] = (data.starsCount[starValue] || 0) + 1;
    data.userVoted = true;
    data.userVotedVal = starValue;

    this.saveRatingData(data);
    this.renderRatingStats();

    if (window.UIComponentsModule) {
      window.UIComponentsModule.showToast(`Cảm ơn bạn đã đánh giá ${starValue} sao!`, 'fa-solid fa-star');
    }
  },

  // 2. XỬ LÝ BÌNH LUẬN
  getCommentsData() {
    const stored = localStorage.getItem(this.currentExamKey + '_comments');
    return stored ? JSON.parse(stored) : [];
  },

  saveCommentsData(comments) {
    localStorage.setItem(this.currentExamKey + '_comments', JSON.stringify(comments));
  },

  renderComments() {
    const comments = this.getCommentsData();
    const listEl = document.getElementById('comments-feed-list');
    const totalCmtEl = document.getElementById('comment-total-badge');

    if (totalCmtEl) totalCmtEl.textContent = `(${comments.length})`;

    if (!listEl) return;

    if (comments.length === 0) {
      listEl.innerHTML = `
        <div class="empty-comments-state">
          <i class="fa-regular fa-comments"></i>
          <p>Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi hoặc gửi nhận xét về đề thi này!</p>
        </div>
      `;
      return;
    }

    let html = '';
    comments.forEach(cmt => {
      html += `
        <div class="comment-item-card">
          <div class="comment-avatar"><i class="fa-solid fa-user-graduate"></i></div>
          <div class="comment-content-box">
            <div class="comment-user-meta">
              <span class="user-name">${this.escapeHTML(cmt.name)}</span>
              <span class="user-badge age-badge"><i class="fa-regular fa-calendar"></i> ${this.escapeHTML(cmt.age)} tuổi</span>
              <span class="user-badge school-badge"><i class="fa-solid fa-school"></i> ${this.escapeHTML(cmt.school)}</span>
              <span class="comment-time">${cmt.time}</span>
            </div>
            <div class="comment-text">${this.escapeHTML(cmt.content)}</div>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  },

  addComment(name, age, school, content) {
    const comments = this.getCommentsData();
    const newComment = {
      id: Date.now(),
      name: name.trim(),
      age: age.trim(),
      school: school.trim(),
      content: content.trim(),
      time: new Date().toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    };

    comments.unshift(newComment);
    this.saveCommentsData(comments);
    this.renderComments();

    if (window.UIComponentsModule) {
      window.UIComponentsModule.showToast('Gửi bình luận thành công!', 'fa-solid fa-circle-check');
    }
  },

  bindEvents() {
    const starContainer = document.getElementById('user-star-input');
    if (starContainer) {
      const stars = starContainer.querySelectorAll('i');
      stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
          const val = parseInt(star.getAttribute('data-value'), 10);
          this.highlightInteractiveStars(val);
        });

        star.addEventListener('click', () => {
          const val = parseInt(star.getAttribute('data-value'), 10);
          this.submitRating(val);
        });
      });

      starContainer.addEventListener('mouseleave', () => {
        const data = this.getRatingData();
        this.highlightInteractiveStars(data.userVoted ? data.userVotedVal : 0);
      });
    }

    const form = document.getElementById('cmt-submit-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('cmt-user-name').value;
        const age = document.getElementById('cmt-user-age').value;
        const school = document.getElementById('cmt-user-school').value;
        const content = document.getElementById('cmt-user-content').value;

        if (!name || !age || !school || !content) {
          if (window.UIComponentsModule) window.UIComponentsModule.showToast('Vui lòng điền đầy đủ thông tin!', 'fa-solid fa-exclamation');
          return;
        }

        this.addComment(name, age, school, content);
        document.getElementById('cmt-user-content').value = '';
      });
    }
  },

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
};
